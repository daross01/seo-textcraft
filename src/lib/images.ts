import { useSyncExternalStore } from "react";
import { DEFAULT_MODE, normalizeMode, type ModeId } from "@/lib/ai-config";
import { pruneAnalyses } from "@/lib/analysis-store";

export type Wallpaper = {
  id: string;
  name: string;
  previewUrl: string;
  dataUrl: string;
};

export const SUPPORTED = ["jpg", "jpeg", "png", "webp"];

export function isSupported(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return SUPPORTED.includes(ext) || file.type.startsWith("image/");
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

async function toDataUrl(file: File, maxSize = 768): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read this image.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", 0.82);
}

export async function loadWallpapers(fileList: FileList | File[]): Promise<{
  images: Wallpaper[];
  skipped: string[];
}> {
  const all = Array.from(fileList);
  const skipped = all.filter((f) => !isSupported(f)).map((f) => f.name);
  const files = all.filter(isSupported).sort((a, b) => collator.compare(a.name, b.name));

  const images: Wallpaper[] = [];
  for (const file of files) {
    const dataUrl = await toDataUrl(file);
    images.push({
      id: `${file.name}-${file.size}-${images.length}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      dataUrl,
    });
  }
  return { images, skipped };
}

/* ---- shared collection state so both tools reuse folder + mode + analyses ---- */

let current: Wallpaper[] = [];
const empty: Wallpaper[] = [];
let mode: ModeId = DEFAULT_MODE;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function setSharedWallpapers(images: Wallpaper[]) {
  current = images;
  // Analyses of images that are no longer loaded are useless; drop them.
  pruneAnalyses(images.map((i) => i.id));
  emit();
}

export function useSharedWallpapers() {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => empty,
  );
}

export function setSharedMode(next: string) {
  const normalized = normalizeMode(next);
  if (normalized === mode) return;
  mode = normalized;
  emit();
}

export function useSharedMode() {
  return useSyncExternalStore(
    subscribe,
    () => mode,
    () => DEFAULT_MODE,
  );
}
