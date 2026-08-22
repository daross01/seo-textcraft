import { z } from "zod";
import { AI_CONFIG } from "@/lib/ai-config";

export const PINTEREST_LIMITS = {
  title: AI_CONFIG.pinterestTitleMaxChars,
  boardTitle: AI_CONFIG.pinterestBoardTitleMaxChars,
  boardDescription: AI_CONFIG.pinterestBoardDescriptionMaxChars,
};

/** Raw shape expected from the model. */
export const pinterestRawSchema = z.object({
  primary_keyword: z.string().optional().default(""),
  angle: z.string().optional().default(""),
  title: z.string().min(1),
  description: z.string().min(1),
  keywords: z.array(z.string()).optional().default([]),
  board_title: z.string().optional().default(""),
  board_description: z.string().optional().default(""),
});

export type PinterestRaw = z.infer<typeof pinterestRawSchema>;

const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{20E3}]/gu;

/** Strips emojis, hashtags and markdown noise; collapses whitespace. */
export function sanitizeText(value: string): string {
  return (value ?? "")
    .replace(EMOJI, "")
    .replace(/#(\w)/g, "$1")
    .replace(/[*_`>]+/g, "")
    .replace(/["“”]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Lowercase, de-duplicated, hashtag-free keyword list. */
export function sanitizeKeywords(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values ?? []) {
    const keyword = sanitizeText(String(raw)).toLowerCase().replace(/[.,;]+$/, "");
    if (!keyword) continue;
    const key = keyword.replace(/\s+/g, " ");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(key);
    if (out.length >= 10) break;
  }
  return out;
}

export function titleWithinLimit(title: string) {
  const clean = sanitizeText(title);
  return clean.length > 0 && clean.length <= PINTEREST_LIMITS.title;
}

/**
 * Shortens a title without cutting mid-word, keeping the primary keyword when
 * possible. Used only as a last resort after the model rewrite fails.
 */
export function shortenTitle(title: string, keyword: string, max = PINTEREST_LIMITS.title) {
  const clean = sanitizeText(title);
  if (clean.length <= max) return clean;

  const parts = clean.split(/\s+[|–—-]\s+/);
  const withKeyword = parts.find(
    (part) => keyword && part.toLowerCase().includes(keyword.toLowerCase()) && part.length <= max,
  );
  if (withKeyword) return withKeyword.trim();
  if (parts[0] && parts[0].length <= max) return parts[0].trim();

  const words = clean.split(" ");
  let built = "";
  for (const word of words) {
    const next = built ? `${built} ${word}` : word;
    if (next.length > max) break;
    built = next;
  }
  return built.replace(/[\s,;:–—-]+$/, "").trim();
}
/** Word-safe shortening for any field with a hard character limit. */
export function clampText(value: string, max: number) {
  const clean = sanitizeText(value);
  if (clean.length <= max) return clean;
  const words = clean.split(" ");
  let built = "";
  for (const word of words) {
    const next = built ? `${built} ${word}` : word;
    if (next.length > max) break;
    built = next;
  }
  return built.replace(/[\s,;:–—-]+$/, "").trim();
}

const FILLER = /\b(ideas?|inspiration|collection|aesthetic ideas|for you|best|top|cute)\b/gi;

/** Fallback short title derived from the Pinterest title (no number, no filler). */
export function deriveShortTitle(title: string, max: number) {
  const base = sanitizeText(title)
    .replace(/^\d+\s+/, "")
    .replace(/\bin\s+/i, "")
    .replace(FILLER, "")
    .replace(/\s+/g, " ")
    .trim();
  return clampText(base, max);
}
