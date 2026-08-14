/**
 * AI generation configuration.
 * Edit tone, language, length, SEO and Pinterest rules here — no UI changes needed.
 */

export const AI_CONFIG = {
  model: "google/gemini-3.6-flash",
  language: "English",
  tone: "warm, editorial, specific — like a well-written design blog, never salesy",
  imageTextLength: "45-70 words",
  introLength: "70-110 words",
  conclusionLength: "50-80 words",
  seoTitleMaxChars: 60,
  seoDescriptionMaxChars: 158,
  pinterestTitleMaxChars: 95,
  pinterestDescriptionLength: "45-80 words",
  concurrency: 4,
};

export const SHARED_RULES = `
Write in ${AI_CONFIG.language}. Tone: ${AI_CONFIG.tone}.
Hard rules:
- Only describe what is actually visible in the images. Never invent objects, brands, places or seasons that are not observable.
- Vary sentence openings and structure. Never start two texts the same way.
- Avoid overusing: wallpaper, aesthetic, beautiful, perfect, stunning, gorgeous, vibe.
- No keyword stuffing, no mechanical lists of adjectives, no technical model-output phrasing.
- No emojis, no hashtags (except where explicitly requested), no markdown.
`.trim();

/**
 * Content modes. Only the current (provisional) mode is defined for now;
 * the next step will add the remaining modes here — prompts stay centralised.
 */
export const CONTENT_MODES = {
  wallpapers: {
    id: "wallpapers",
    label: "Wallpapers",
    subject: "wallpapers",
  },
} as const;

export type ContentMode = keyof typeof CONTENT_MODES;
export const DEFAULT_MODE: ContentMode = "wallpapers";

export function isContentMode(value: unknown): value is ContentMode {
  return typeof value === "string" && value in CONTENT_MODES;
}

export function normalizeMode(value: unknown): ContentMode {
  return isContentMode(value) ? value : DEFAULT_MODE;
}

export function analysisPrompt(mode: ContentMode = DEFAULT_MODE) {
  const subject = CONTENT_MODES[mode].subject;
  return `
You are a visual analyst for a ${subject} website. Analyse the single image provided and return strict JSON only.

Return this exact shape:
{
  "visual_description": "2-3 precise sentences describing exactly what is visible",
  "colors": ["3-6 concrete colour names"],
  "palette": "short description of the palette and tonality",
  "style": "visual style",
  "mood": "atmosphere / feeling",
  "elements": ["main visible objects or shapes"],
  "composition": "how the frame is organised",
  "texture": "surface / grain / finish qualities",
  "theme": "overall theme",
  "minimalism": "low | medium | high",
  "background": "type of background",
  "distinctive": "what makes this image different from similar ones",
  "seasonal": "seasonal reference if clearly observable, otherwise empty string"
}

Only describe what is observable. Output JSON with no code fences and no commentary.
`.trim();
}

/** Kept for backwards compatibility. */
export const ANALYSIS_PROMPT = analysisPrompt(DEFAULT_MODE);


export function collectionPrompt(count: number) {
  return `
You are an editorial content writer for a wallpapers website.
You receive structured visual analyses of ${count} wallpapers that belong to one collection, in order.

${SHARED_RULES}

Produce strict JSON only, with this exact shape:
{
  "title": "main collection title, attractive and SEO-friendly, not spammy",
  "subtitle": "complementary subtitle, different from the title, describing the character of the collection",
  "intro": "${AI_CONFIG.introLength} introducing the collection as a coherent whole, based on the real visual traits. Do not describe images one by one.",
  "images": [
    { "image_number": 1, "text": "${AI_CONFIG.imageTextLength} about image 1 only" }
  ],
  "conclusion": "${AI_CONFIG.conclusionLength} closing the piece naturally, not a repeat of the intro",
  "seo_title": "max ${AI_CONFIG.seoTitleMaxChars} characters, includes wallpaper/background terms plus the real theme",
  "seo_description": "max ${AI_CONFIG.seoDescriptionMaxChars} characters, natural, click-worthy meta description"
}

The "images" array MUST contain exactly ${count} items, numbered 1 to ${count}, in order, each written strictly from the analysis with that image_number.
Output JSON with no code fences and no commentary.
`.trim();
}

export function pinterestPrompt(count: number) {
  return `
You are a Pinterest content strategist for a wallpapers website.
You receive structured visual analyses of ${count} wallpapers that form ONE collection.

${SHARED_RULES}

Write ONE title and ONE description that work for the entire collection — never for a single image.

Return strict JSON only:
{
  "title": "Pinterest title, max ${AI_CONFIG.pinterestTitleMaxChars} characters, appealing and searchable",
  "description": "${AI_CONFIG.pinterestDescriptionLength}, describes the whole collection, weaves in relevant Pinterest keywords naturally, encourages saving and downloading",
  "keywords": ["6-10 relevant Pinterest keywords"]
}

Output JSON with no code fences and no commentary.
`.trim();
}
