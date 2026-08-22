/**
 * AI generation configuration.
 * Edit tone, language, length, SEO, Pinterest rules and content modes here —
 * no UI or API changes needed.
 */

export const AI_CONFIG = {
  model: "google/gemini-3.6-flash",
  language: "English",
  tone: "warm, editorial, specific — like a well-written design blog, never salesy",
  /** BlogText is intentionally short: the page stays visual. */
  imageTextLength: "2-3 short sentences (max ~35 words)",
  introLength: "2-3 short sentences (max ~40 words)",
  conclusionLength: "2-3 short sentences (max ~35 words)",
  subtitleLength: "one short sentence",
  seoTitleMaxChars: 60,
  seoDescriptionMaxChars: 158,
  cardTitleMaxChars: 35,
  pinterestTitleMaxChars: 95,
  pinterestDescriptionLength: "45-80 words",
  pinterestBoardTitleMaxChars: 45,
  pinterestBoardDescriptionMaxChars: 400,
  concurrency: 4,
};

/* -------------------------------------------------------------------------- */
/* Content modes                                                              */
/* -------------------------------------------------------------------------- */

export type ContentMode = {
  /** Label shown in the UI. */
  label: string;
  /** Singular noun for one item ("outfit", "wallpaper", …). */
  noun: string;
  /** Plural noun for a set of items. */
  plural: string;
  /** Short description of the site/audience for this content type. */
  audience: string;
  /**
   * Visual traits the analyst should look for when observable.
   * Guidance, never a checklist to fill in.
   */
  focus: string[];
  /** Extra JSON keys added to the analysis shape for this mode. */
  extraFields: Record<string, string>;
  /** Terms the SEO title should naturally include. */
  seoTerms: string;
};

export const CONTENT_MODES = {
  outfits: {
    label: "Outfits",
    noun: "outfit",
    plural: "outfits",
    audience: "a fashion inspiration website featuring outfit ideas",
    focus: [
      "garments and how they are combined",
      "colours and overall palette",
      "silhouette, fit and layering",
      "footwear and accessories",
      "visible materials and textures",
      "style and aesthetic (casual, elegant, streetwear, old money, minimalist, Y2K, and similar) only when the evidence is clear",
      "season and occasion when they are genuinely observable",
      "composition and framing",
      "distinctive details",
    ],
    extraFields: {
      garments: "array of the visible garments and pieces",
      silhouette: "silhouette and fit, empty string if unclear",
      layering: "layering approach, empty string if unclear",
      footwear: "visible footwear, empty string if not visible",
      accessories: "array of visible accessories, empty array if none",
      occasion: "occasion only if clearly deducible, otherwise empty string",
    },
    seoTerms: "outfit/style terms",
  },
  wallpapers: {
    label: "Wallpapers",
    noun: "wallpaper",
    plural: "wallpapers",
    audience: "a wallpapers and backgrounds website",
    focus: [
      "visual theme",
      "colours and overall palette",
      "main elements and subjects",
      "aesthetic and style",
      "composition and background",
      "texture and patterns",
      "degree of minimalism",
      "natural elements when present",
      "whether it reads as illustration, photography or abstract work",
      "season or occasion only when clearly visible",
      "distinctive characteristics",
    ],
    extraFields: {
      minimalism: "low | medium | high",
      background: "type of background",
      pattern: "pattern description, empty string if none",
      medium: "illustration | photography | abstract | 3d | other",
    },
    seoTerms: "wallpaper/background terms",
  },
  nail_designs: {
    label: "Nail Designs",
    noun: "nail design",
    plural: "nail designs",
    audience: "a nail design inspiration website",
    focus: [
      "nail shape and length",
      "colours and overall palette",
      "finish (glossy, matte, chrome, glitter, and similar)",
      "patterns and decoration (French, ombré, floral, abstract, art details)",
      "aesthetic and style",
      "season and occasion when genuinely observable",
      "distinctive details",
    ],
    extraFields: {
      nail_shape: "nail shape, empty string if unclear",
      nail_length: "short | medium | long, empty string if unclear",
      finish: "visible finish",
      decoration: "array of visible decorative techniques or motifs",
      occasion: "occasion only if clearly deducible, otherwise empty string",
    },
    seoTerms: "nail design/nail art terms",
  },
  hairstyles: {
    label: "Hairstyles",
    noun: "hairstyle",
    plural: "hairstyles",
    audience: "a hairstyle inspiration website",
    focus: [
      "hair length and visible texture",
      "type of hairstyle (updo, ponytail, braids, bun, waves, and similar)",
      "parting and volume",
      "hair accessories when visible",
      "colours and tones when observable",
      "style and aesthetic",
      "season and occasion when genuinely observable",
      "distinctive details",
    ],
    extraFields: {
      hair_length: "short | medium | long, empty string if unclear",
      hair_texture: "visible texture, empty string if unclear",
      hairstyle_type: "type of hairstyle",
      parting: "parting, empty string if not visible",
      volume: "volume description, empty string if unclear",
      accessories: "array of visible hair accessories, empty array if none",
      occasion: "occasion only if clearly deducible, otherwise empty string",
    },
    seoTerms: "hairstyle/hair terms",
  },
  makeup: {
    label: "Makeup",
    noun: "makeup look",
    plural: "makeup looks",
    audience: "a makeup inspiration website",
    focus: [
      "finish and intensity of the look",
      "eyes: eyeliner, eyeshadow, lashes",
      "brows",
      "blush, contour and highlight when visible",
      "lips",
      "colours and tones",
      "style and aesthetic",
      "occasion when genuinely observable",
      "distinctive details",
    ],
    extraFields: {
      finish: "skin finish, empty string if unclear",
      intensity: "soft | medium | bold",
      eyes: "eye makeup description including liner, shadow and lashes when visible",
      lips: "lip description, empty string if not visible",
      cheeks: "blush, contour and highlight when visible, otherwise empty string",
      occasion: "occasion only if clearly deducible, otherwise empty string",
    },
    seoTerms: "makeup look terms",
  },
} satisfies Record<string, ContentMode>;

export type ModeId = keyof typeof CONTENT_MODES;

export const MODE_IDS = Object.keys(CONTENT_MODES) as ModeId[];

export const DEFAULT_MODE: ModeId = "wallpapers";

export function isMode(value: unknown): value is ModeId {
  return typeof value === "string" && value in CONTENT_MODES;
}

export function normalizeMode(value: unknown): ModeId {
  return isMode(value) ? value : DEFAULT_MODE;
}

export function modeConfig(value: unknown): ContentMode {
  return CONTENT_MODES[normalizeMode(value)];
}

/* -------------------------------------------------------------------------- */
/* Shared editorial rules (mode-independent)                                  */
/* -------------------------------------------------------------------------- */

export const SHARED_RULES = `
Write in ${AI_CONFIG.language}. Tone: ${AI_CONFIG.tone}.
Hard rules:
- Only describe what is actually visible in the images. Never invent objects, brands, places or seasons that are not observable.
- Vary sentence openings and structure. Never start two texts the same way.
- Avoid overusing: aesthetic, beautiful, perfect, stunning, gorgeous, vibe.
- No keyword stuffing, no mechanical lists of adjectives, no technical model-output phrasing.
- No emojis, no hashtags (except where explicitly requested), no markdown.
`.trim();

const ANALYSIS_RULES = `
- Only report characteristics that are visible or reasonably deducible from the image. Never invent information.
- Treat the focus list as guidance, not a checklist: leave a field empty when the image does not support it.
- Do not name brands unless a logo is clearly legible.
`.trim();

const BASE_ANALYSIS_FIELDS: Record<string, string> = {
  visual_description: "2-3 precise sentences describing exactly what is visible",
  colors: "array of 3-6 concrete colour names",
  palette: "short description of the palette and tonality",
  style: "visual style",
  aesthetic: "aesthetic only when there is clear visual evidence, otherwise empty string",
  mood: "atmosphere / feeling",
  elements: "array of the main visible elements",
  composition: "how the frame is organised",
  texture: "surface / material / finish qualities",
  theme: "overall theme",
  distinctive: "what makes this image different from similar ones",
  seasonal: "season only if clearly observable, otherwise empty string",
};

function jsonShape(fields: Record<string, string>) {
  const lines = Object.entries(fields).map(([key, hint]) => `  "${key}": "${hint}"`);
  return `{\n${lines.join(",\n")}\n}`;
}

/** Analysis prompt for a given content mode. */
export function analysisPrompt(mode: unknown) {
  const config = modeConfig(mode);
  return `
You are a visual analyst for ${config.audience}.
Content type: ${config.label}. Each image shows one ${config.noun}.
Analyse the single image provided and return strict JSON only.

Pay special attention, when visible, to:
${config.focus.map((f) => `- ${f}`).join("\n")}

${ANALYSIS_RULES}

Return this exact shape:
${jsonShape({ ...BASE_ANALYSIS_FIELDS, ...config.extraFields })}

Output JSON with no code fences and no commentary.
`.trim();
}

/** Phrases that must never appear: they describe browsing, not the content. */
const BANNED_OPENERS = [
  "In this collection",
  "In this post",
  "Scroll through",
  "Keep scrolling",
  "Here you can see",
  "The next image",
  "This image shows",
  "This picture shows",
  "This image features",
  "Take a look at",
  "Swipe to discover",
];

const BLOGTEXT_RULES = `
- Be brief. The page is primarily visual; the text only adds context and SEO value.
- Never describe the act of browsing, scrolling or looking at the page.
- Never use these phrasings: ${BANNED_OPENERS.map((p) => `"${p}"`).join(", ")}.
- Every text must open differently. No shared formula across the image texts.
- No filler, no generic praise, no restating the intro in the conclusion.
- Write only about traits present in the given analysis. If an analysis is empty or marked as failed, write a single neutral sentence and claim nothing specific about that image.
`.trim();

export function collectionPrompt(count: number, mode: unknown = DEFAULT_MODE) {
  const config = modeConfig(mode);
  return `
You are an editorial content writer for ${config.audience}.
Content type: ${config.label}. Each item is one ${config.noun}.
You receive structured visual analyses of ${count} ${config.plural} that belong to one collection, in order.

${SHARED_RULES}

${BLOGTEXT_RULES}

Traits that matter most for this content type, only when the analysis supports them:
${config.focus.map((f) => `- ${f}`).join("\n")}
The analyses may also include: ${Object.keys(config.extraFields).join(", ")}.
Use these as context to decide what is worth saying — never as a checklist, never as fields to fill.

First identify the dominant pattern of the collection from the analyses (recurring colours, ${config.plural} traits, style, mood) and let that pattern drive the title, intro and conclusion. Individual image texts must add something concrete and specific to that image.

Produce strict JSON only, with this exact shape:
{
  "title": "short, clear, appealing collection title that reflects the real dominant traits and reads well in search. A list format using the real number ${count} is allowed but not required. Never a fixed template.",
  "card_title": "A much shorter version of the title for cards: MAX ${AI_CONFIG.cardTitleMaxChars} characters, no number, no filler, Title Case. Keep only the strongest descriptive words plus the content type. Example: title '10 Dreamy Fall Mountain and Twilight Sky Wallpapers' -> 'Dreamy Fall Wallpapers'",
  "subtitle": "${AI_CONFIG.subtitleLength}, complements the title with extra context, never repeats it",
  "intro": "${AI_CONFIG.introLength} framing the collection as a whole from its real shared traits. Do not describe images one by one.",
  "images": [
    { "image_number": 1, "text": "${AI_CONFIG.imageTextLength} about image 1 only, concrete and specific" }
  ],
  "conclusion": "${AI_CONFIG.conclusionLength} closing naturally, not a repeat of the intro",
  "seo_title": "MAX ${AI_CONFIG.seoTitleMaxChars} characters including spaces. Natural use of ${config.seoTerms} plus the real theme. Count the characters.",
  "seo_description": "MAX ${AI_CONFIG.seoDescriptionMaxChars} characters including spaces. One natural, click-worthy meta description sentence. Count the characters."
}

The "images" array MUST contain exactly ${count} items, numbered 1 to ${count}, in order, each written strictly from the analysis with that image_number.
Output JSON with no code fences and no commentary.
`.trim();
}

export function pinterestPrompt(count: number, mode: unknown = DEFAULT_MODE) {
  const config = modeConfig(mode);
  return `
You are a Pinterest content strategist for ${config.audience}.
Content type: ${config.label}.
You receive structured visual analyses of ${count} ${config.plural} that form ONE collection.

${SHARED_RULES}

${PINTEREST_RULES(count, config)}

Return strict JSON only:
{
  "primary_keyword": "the single main search keyword for this collection, lowercase, 2-4 words",
  "angle": "one short phrase naming the dominant pattern you found across the analyses",
  "title": "Pinterest title, MAX ${AI_CONFIG.pinterestTitleMaxChars} characters including spaces. Count the characters.",
  "description": "${AI_CONFIG.pinterestDescriptionLength}, about the whole collection",
  "keywords": ["6-10 relevant Pinterest keywords"],
  "board_title": "MAX ${AI_CONFIG.pinterestBoardTitleMaxChars} characters. Short board name, no number. Example: title '26 Glossy 3D Bubble Letter Wallpaper Ideas in Lavender' -> 'Lavender Glossy 3D Bubble Letter Wallpaper'",
  "board_description": "MAX ${AI_CONFIG.pinterestBoardDescriptionMaxChars} characters. Description for the Pinterest board that will hold these pins: same angle as the description but board-level, mentioning the theme, colours, style and what someone will find saved there."
}

Output JSON with no code fences and no commentary.
`.trim();
}

const GENERIC_TITLES = [
  "Beautiful Collection",
  "Amazing Ideas",
  "Cute Images",
  "My Favorite Designs",
  "Inspiration",
  "Best Collection",
];

function PINTEREST_RULES(count: number, config: ContentMode) {
  return `
Work in this order:
1. Read ALL ${count} analyses together and find the dominant pattern of the collection (recurring colours, ${config.plural} traits, style, aesthetic, season, occasion). Ignore a single outlier image — the angle must describe the set.
2. Choose ONE primary keyword that a real person would type into Pinterest search. It must match the content type (${config.seoTerms}) and the dominant pattern.
3. Write title, description and keywords from that same angle, so all three are semantically coherent.

Title rules (most important part):
- It must read like a real Pinterest search, not a caption. Never generic titles such as: ${GENERIC_TITLES.map((t) => `"${t}"`).join(", ")}.
- Include the primary keyword naturally.
- When the title reads as a collection / list of ideas, it MUST use the real number of images: ${count}. Never invent another number. A title without a number is allowed only when it is clearly better and is not phrased as a list.
- Prefer, when it fits naturally: "${count} + main theme + relevant trait + content type", "${count} + trait + content type + Ideas", or "${count} + content type + for + context". These are style references, never mandatory templates.
- Use vocabulary appropriate for ${config.label} (one ${config.noun} per image).
- MAX ${AI_CONFIG.pinterestTitleMaxChars} characters including spaces. Count them before answering.
- No hashtags, no emojis, no quotes, no markdown, no ALL CAPS words.

Description rules:
- Complements the title; never restates it.
- Uses the primary keyword once, naturally, plus a few relevant secondary keywords.
- Describes what is actually in the collection: real colours, traits, styling, mood.
- No filler such as "perfect for everyone", "you will love these", "get inspired by these beautiful images", "discover the best collection", "save these ideas for later".
- No keyword stuffing, no hashtags, no emojis.

Keyword rules:
- 6-10 lowercase Pinterest search phrases derived from the same angle: theme, visible traits, style, colours, season or occasion when genuinely observable.
- No hashtags, no near-duplicates of the same phrase, no keywords unsupported by the analyses.

Board title rules:
- A real board name: theme + traits + content type, no number, no "Ideas", Title Case.
- MAX ${AI_CONFIG.pinterestBoardTitleMaxChars} characters including spaces. Count them.

Board description rules:
- Written for the board that will contain these pins, not for a single pin.
- Same angle and keywords as the description, expanded slightly: what the board collects, real colours, traits, style, mood, and who it suits.
- MAX ${AI_CONFIG.pinterestBoardDescriptionMaxChars} characters including spaces. No hashtags, no emojis, no filler.


Never claim or imply search volume, competition or CTR data — you have no keyword data. Optimise with natural language only.
Never invent a season, occasion, aesthetic or dominant colour that the analyses do not support. If the set is mixed, keep the angle simple and factual.
Ignore any analysis that is empty or marked as failed: never invent traits for it, and base the angle only on the analyses that contain real observations.
`.trim();
}

/** Retry prompt used when the returned title exceeds the Pinterest limit. */
export function pinterestTitleFixPrompt(count: number, mode: unknown, primaryKeyword: string) {
  const config = modeConfig(mode);
  return `
You rewrite Pinterest titles for ${config.audience}.
Rewrite the given title so it is MAX ${AI_CONFIG.pinterestTitleMaxChars} characters including spaces.
Keep the primary keyword "${primaryKeyword}" and the same meaning and angle.
Keep the number ${count} if the original title used it as a list count.
Do not truncate mid-sentence; produce a complete, natural title.
No hashtags, no emojis, no markdown.

Return strict JSON only: { "title": "the shortened title" }
`.trim();
}
