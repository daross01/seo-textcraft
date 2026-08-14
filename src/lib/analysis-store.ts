import { useSyncExternalStore } from "react";
import type { Analysis } from "@/lib/analyze";

/**
 * Session-scoped store of visual analyses, keyed by image + mode.
 * Both BlogText and PinText read/write here, so an image is only ever
 * analysed once per content mode during a session.
 */

export type AnalysisKey = string;

export function analysisKey(imageId: string, mode: string): AnalysisKey {
  return `${mode}::${imageId}`;
}

const cache = new Map<AnalysisKey, Analysis>();
const inflight = new Map<AnalysisKey, Promise<Analysis>>();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getAnalysis(imageId: string, mode: string): Analysis | undefined {
  return cache.get(analysisKey(imageId, mode));
}

/** Only valid (non-failed) analyses are stored. */
export function setAnalysis(imageId: string, mode: string, analysis: Analysis) {
  cache.set(analysisKey(imageId, mode), analysis);
  emit();
}

export function clearAnalyses() {
  cache.clear();
  inflight.clear();
  emit();
}

export function clearAnalysesForImages(imageIds: string[]) {
  const ids = new Set(imageIds);
  for (const key of [...cache.keys()]) {
    const id = key.slice(key.indexOf("::") + 2);
    if (ids.has(id)) cache.delete(key);
  }
  emit();
}

/**
 * Runs `run` at most once per image+mode, even if BlogText and PinText
 * request the same analysis concurrently.
 */
export function analyzeOnce(
  imageId: string,
  mode: string,
  run: () => Promise<Analysis>,
): Promise<Analysis> {
  const key = analysisKey(imageId, mode);
  const cached = cache.get(key);
  if (cached) return Promise.resolve(cached);

  const pending = inflight.get(key);
  if (pending) return pending;

  const promise = run()
    .then((analysis) => {
      cache.set(key, analysis);
      emit();
      return analysis;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

export function countCached(imageIds: string[], mode: string) {
  return imageIds.filter((id) => cache.has(analysisKey(id, mode))).length;
}

export function useAnalysisVersion() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => cache.size,
    () => 0,
  );
}
