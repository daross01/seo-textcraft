import { AI_CONFIG } from "@/lib/ai-config";

export const SEO_LIMITS = {
  title: AI_CONFIG.seoTitleMaxChars,
  description: AI_CONFIG.seoDescriptionMaxChars,
};

export function withinLimit(value: string | undefined, max: number) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;
}

/**
 * Last-resort shortening: drop whole sentences first, then whole words.
 * Never cuts mid-word and never leaves dangling punctuation.
 */
export function shortenGracefully(value: string, max: number): string {
  const text = (value ?? "").trim().replace(/\s+/g, " ");
  if (text.length <= max) return text;

  const sentences = text.match(/[^.!?]+[.!?]*/g) ?? [text];
  let built = "";
  for (const sentence of sentences) {
    const next = (built + sentence).trim();
    if (next.length > max) break;
    built = next;
  }
  if (built.length >= Math.min(max * 0.5, max)) return built.trim();

  const words = text.split(" ");
  built = "";
  for (const word of words) {
    const next = built ? `${built} ${word}` : word;
    if (next.length > max) break;
    built = next;
  }
  return built.replace(/[\s,;:—-]+$/, "").trim();
}
