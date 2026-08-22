import { createFileRoute } from "@tanstack/react-router";
import {
  AI_CONFIG,
  pinterestPrompt,
  pinterestTitleFixPrompt,
  normalizeMode,
} from "@/lib/ai-config";
import { chatJson, errorResponse, GatewayError } from "@/lib/gateway.server";
import {
  PINTEREST_LIMITS,
  clampText,
  deriveShortTitle,
  pinterestRawSchema,
  sanitizeKeywords,
  sanitizeText,
  shortenTitle,
  titleWithinLimit,
} from "@/lib/pinterest-content";

export type PinterestContent = {
  title: string;
  description: string;
  keywords: string[];
  board_title: string;
  board_description: string;
  primary_keyword?: string;
};

export const Route = createFileRoute("/api/generate-pinterest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { analyses?: unknown[]; mode?: string };
          const analyses = body?.analyses ?? [];
          if (!Array.isArray(analyses) || analyses.length === 0) {
            throw new GatewayError(400, "No image analyses received.");
          }
          const mode = normalizeMode(body?.mode);
          const count = analyses.length;

          const raw = await chatJson<unknown>(
            [
              { role: "system", content: pinterestPrompt(count, mode) },
              {
                role: "user",
                content: `The collection contains exactly ${count} images. Visual analyses, in order:\n${JSON.stringify(
                  analyses,
                  null,
                  1,
                )}`,
              },
            ],
            AI_CONFIG.model,
          );

          const parsed = pinterestRawSchema.safeParse(raw);
          if (!parsed.success) {
            throw new GatewayError(502, "Incomplete Pinterest content. Try again.");
          }

          const primaryKeyword = sanitizeText(parsed.data.primary_keyword).toLowerCase();
          let title = sanitizeText(parsed.data.title);
          const description = sanitizeText(parsed.data.description);
          const keywords = sanitizeKeywords(parsed.data.keywords);

          if (!title || !description) {
            throw new GatewayError(502, "Incomplete Pinterest content. Try again.");
          }

          // Real length validation: ask for a shorter rewrite, then shorten safely.
          if (!titleWithinLimit(title)) {
            let rewritten = "";
            try {
              const fix = await chatJson<{ title?: string }>(
                [
                  { role: "system", content: pinterestTitleFixPrompt(count, mode, primaryKeyword) },
                  { role: "user", content: title },
                ],
                AI_CONFIG.model,
              );
              rewritten = sanitizeText(fix?.title ?? "");
            } catch {
              rewritten = "";
            }
            title = titleWithinLimit(rewritten) ? rewritten : shortenTitle(title, primaryKeyword);
          }

          const boardTitle =
            clampText(parsed.data.board_title, PINTEREST_LIMITS.boardTitle) ||
            deriveShortTitle(title, PINTEREST_LIMITS.boardTitle);
          const boardDescription =
            clampText(parsed.data.board_description, PINTEREST_LIMITS.boardDescription) ||
            clampText(description, PINTEREST_LIMITS.boardDescription);

          const content: PinterestContent = {
            title,
            description,
            keywords,
            board_title: boardTitle,
            board_description: boardDescription,
            ...(primaryKeyword ? { primary_keyword: primaryKeyword } : {}),
          };
          return Response.json({ content });
        } catch (error) {
          return errorResponse(error);
        }
      },
    },
  },
});
