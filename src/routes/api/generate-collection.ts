import { createFileRoute } from "@tanstack/react-router";
import { AI_CONFIG, collectionPrompt } from "@/lib/ai-config";
import { chatJson, errorResponse, GatewayError } from "@/lib/gateway.server";
import type { CollectionContent } from "@/lib/csv";

export const Route = createFileRoute("/api/generate-collection")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { analyses?: unknown[] };
          const analyses = body?.analyses ?? [];
          if (!Array.isArray(analyses) || analyses.length === 0) {
            throw new GatewayError(400, "No image analyses received.");
          }
          const content = await chatJson<CollectionContent>(
            [
              { role: "system", content: collectionPrompt(analyses.length) },
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
          return Response.json({ content });
        } catch (error) {
          return errorResponse(error);
        }
      },
    },
  },
});
