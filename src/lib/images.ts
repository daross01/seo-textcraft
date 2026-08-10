import { useSyncExternalStore } from "react";

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
  const files = all
    .filter(isSupported)
    .sort((a, b) => collator.compare(a.name, b.name));

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

/* ---- shared store so both tools can reuse the same folder ---- */

let current: Wallpaper[] = [];
const listeners = new Set<() => void>();

export function setSharedWallpapers(images: Wallpaper[]) {
  current = images;
  listeners.forEach((l) => l());
}

export function useSharedWallpapers() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => [] as Wallpaper[],
  );
}
