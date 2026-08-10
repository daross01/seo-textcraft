import { createFileRoute } from "@tanstack/react-router";
import { AI_CONFIG, pinterestPrompt } from "@/lib/ai-config";
import { chatJson, errorResponse, GatewayError } from "@/lib/gateway.server";

export type PinterestContent = { title: string; description: string; keywords?: string[] };

export const Route = createFileRoute("/api/generate-pinterest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { analyses?: unknown[] };
          const analyses = body?.analyses ?? [];
          if (!Array.isArray(analyses) || analyses.length === 0) {
            throw new GatewayError(400, "No image analyses received.");
          }
          const content = await chatJson<PinterestContent>(
            [
              { role: "system", content: pinterestPrompt(analyses.length) },
              {
                role: "user",
                content: `Visual analyses of the collection:\n${JSON.stringify(analyses, null, 1)}`,
              },
            ],
            AI_CONFIG.model,
          );
          if (!content?.title || !content?.description) {
            throw new GatewayError(502, "Incomplete Pinterest content. Try again.");
          }
          return Response.json({ content });
        } catch (error) {
          return errorResponse(error);
        }
      },
    },
  },
});
