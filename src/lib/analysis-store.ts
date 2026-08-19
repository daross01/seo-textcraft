import { useSyncExternalStore } from "react";
import type { Analysis } from "@/lib/analyze";

/**
 * Session-scoped store of visual analyses, keyed by image + mode.
 * BlogText and PinText both read/write here, so an image is only analysed
 * once per content mode. Failed analyses are never stored.
 */

export type CacheKey = string;

export function analysisKey(imageId: string, mode: string): CacheKey {
  return `${mode}::${imageId}`;
}

const cache = new Map<CacheKey, Analysis>();
/** In-flight requests, so two tools can never analyse the same image+mode twice. */
const inflight = new Map<CacheKey, Promise<Analysis>>();

const listeners = new Set<() => void>();
let version = 0;

function emit() {
  version++;
  listeners.forEach((l) => l());
}

export function getAnalysis(imageId: string, mode: string): Analysis | undefined {
  return cache.get(analysisKey(imageId, mode));
}

export function setAnalysis(imageId: string, mode: string, analysis: Analysis) {
  cache.set(analysisKey(imageId, mode), analysis);
  emit();
}

export function clearAnalyses() {
  cache.clear();
  inflight.clear();
  emit();
}

/** Drops every cached analysis for images that are no longer loaded. */
export function pruneAnalyses(imageIds: string[]) {
  const allowed = new Set(imageIds);
  let changed = false;
  for (const key of [...cache.keys()]) {
    const imageId = key.slice(key.indexOf("::") + 2);
    if (!allowed.has(imageId)) {
      cache.delete(key);
      changed = true;
    }
  }
  if (changed) emit();
}

/**
 * Returns the cached analysis when present, otherwise runs `run` once —
 * concurrent callers for the same image+mode share the same promise.
 * The result is only cached when `run` resolves successfully.
 */
export async function resolveAnalysis(
  imageId: string,
  mode: string,
  run: () => Promise<Analysis>,
): Promise<{ analysis: Analysis; cached: boolean }> {
  const key = analysisKey(imageId, mode);
  const existing = cache.get(key);
  if (existing) return { analysis: existing, cached: true };

  const pending = inflight.get(key);
  if (pending) return { analysis: await pending, cached: true };

  const promise = run();
  inflight.set(key, promise);
  try {
    const analysis = await promise;
    cache.set(key, analysis);
    emit();
    return { analysis, cached: false };
  } finally {
    inflight.delete(key);
  }
}

export function countAnalysed(imageIds: string[], mode: string) {
  return imageIds.filter((id) => cache.has(analysisKey(id, mode))).length;
}

export function useAnalysesVersion() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => version,
    () => 0,
  );
}
