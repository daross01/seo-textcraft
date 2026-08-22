import { createFileRoute } from "@tanstack/react-router";
import { AI_CONFIG, collectionPrompt, normalizeMode } from "@/lib/ai-config";
import { chatJson, errorResponse, GatewayError, type ChatMessage } from "@/lib/gateway.server";
import { SEO_LIMITS, shortenGracefully, withinLimit } from "@/lib/seo-limits";
import type { CollectionContent } from "@/lib/csv";
import { deriveShortTitle } from "@/lib/pinterest-content";

type SeoPair = { seo_title: string; seo_description: string };

/** Ask the model for a compliant rewrite, then fall back to graceful shortening. */
async function enforceSeoLimits(content: CollectionContent): Promise<CollectionContent> {
  const titleOk = withinLimit(content.seo_title, SEO_LIMITS.title);
  const descOk = withinLimit(content.seo_description, SEO_LIMITS.description);
  if (titleOk && descOk) return content;

  let repaired: SeoPair | null = null;
  try {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: [
          "You rewrite SEO metadata to fit strict character limits.",
          `seo_title: max ${SEO_LIMITS.title} characters including spaces.`,
          `seo_description: max ${SEO_LIMITS.description} characters including spaces.`,
          "Keep the same meaning and language, keep it natural and fully-formed. Never truncate mid-sentence.",
          'Return strict JSON only: {"seo_title": "...", "seo_description": "..."}',
        ].join("\n"),
      },
      {
        role: "user",
        content: JSON.stringify({
          title: content.title,
          seo_title: content.seo_title,
          seo_description: content.seo_description,
        }),
      },
    ];
    repaired = await chatJson<SeoPair>(messages, AI_CONFIG.model);
  } catch {
    repaired = null;
  }

  const seo_title = withinLimit(repaired?.seo_title, SEO_LIMITS.title)
    ? repaired!.seo_title.trim()
    : shortenGracefully(content.seo_title || content.title || "", SEO_LIMITS.title);
  const seo_description = withinLimit(repaired?.seo_description, SEO_LIMITS.description)
    ? repaired!.seo_description.trim()
    : shortenGracefully(content.seo_description || content.intro || "", SEO_LIMITS.description);

  return { ...content, seo_title, seo_description };
}

export const Route = createFileRoute("/api/generate-collection")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { analyses?: unknown[]; mode?: string };
          const analyses = body?.analyses ?? [];
          if (!Array.isArray(analyses) || analyses.length === 0) {
            throw new GatewayError(400, "No image analyses received.");
          }
          const content = await chatJson<CollectionContent>(
            [
              { role: "system", content: collectionPrompt(analyses.length, normalizeMode(body?.mode)) },
              {
                role: "user",
                content: `Visual analyses in order:\n${JSON.stringify(analyses, null, 1)}`,
              },
            ],
            AI_CONFIG.model,
          );
          if (!Array.isArray(content?.images) || content.images.length !== analyses.length) {
            throw new GatewayError(
              502,
              `Incomplete generation: expected ${analyses.length} image texts, got ${content?.images?.length ?? 0}. Try again.`,
            );
          }
          const withLimits = await enforceSeoLimits(content);
          const card_title =
            (withLimits.card_title ?? "").trim().length > 0 &&
            withLimits.card_title.length <= AI_CONFIG.cardTitleMaxChars
              ? withLimits.card_title.trim()
              : deriveShortTitle(withLimits.card_title || withLimits.title || "", AI_CONFIG.cardTitleMaxChars);
          return Response.json({ content: { ...withLimits, card_title } });
        } catch (error) {
          return errorResponse(error);
        }
      },
    },
  },
});
