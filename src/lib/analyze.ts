import { AI_CONFIG, DEFAULT_MODE } from "@/lib/ai-config";
import type { Wallpaper } from "@/lib/images";
import { resolveAnalysis } from "@/lib/analysis-store";

export type Analysis = Record<string, unknown> & { image_number: number };

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new Error((data["error"] as string) ?? `Request failed (${res.status})`);
  return data as T;
}

/**
 * Analyses every image for the given mode, reusing any analysis already stored
 * for that image + mode (shared by BlogText and PinText). Failed analyses are
 * reported as warnings and never cached.
 */
export async function analyzeAll(
  images: Wallpaper[],
  onProgress: (done: number, currentIndex: number) => void,
  mode: string = DEFAULT_MODE,
): Promise<{ analyses: Analysis[]; failed: string[]; reused: number }> {
  const results: (Analysis | null)[] = new Array(images.length).fill(null);
  const failed: string[] = [];
  let done = 0;
  let reused = 0;
  let cursor = 0;

  async function worker() {
    while (cursor < images.length) {
      const index = cursor++;
      const image = images[index]!;
      onProgress(done, index + 1);
      try {
        const { analysis, cached } = await resolveAnalysis(image.id, mode, async () => {
          const { analysis } = await postJson<{ analysis: Analysis }>("/api/analyze-image", {
            imageNumber: index + 1,
            dataUrl: image.dataUrl,
            name: image.name,
            mode,
          });
          return analysis;
        });
        if (cached) reused++;
        results[index] = { ...analysis, image_number: index + 1 };
      } catch (error) {
        failed.push(`#${index + 1} ${image.name}: ${(error as Error).message}`);
        results[index] = {
          image_number: index + 1,
          visual_description: "",
          note: "analysis failed",
        };
      }
      done++;
      onProgress(done, index + 1);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(AI_CONFIG.concurrency, images.length) }, worker),
  );
  return { analyses: results as Analysis[], failed, reused };
}

export const api = { postJson };
