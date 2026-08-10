import { createFileRoute } from "@tanstack/react-router";
import { AI_CONFIG, ANALYSIS_PROMPT } from "@/lib/ai-config";
import { chatJson, errorResponse, GatewayError } from "@/lib/gateway.server";

export type ImageAnalysis = Record<string, unknown> & { image_number: number };

export const Route = createFileRoute("/api/analyze-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            imageNumber?: number;
            dataUrl?: string;
            name?: string;
          };
          if (!body?.dataUrl || !body.dataUrl.startsWith("data:image/")) {
            throw new GatewayError(400, "Unsupported or missing image data.");
          }
          const analysis = await chatJson<Record<string, unknown>>(
            [
              { role: "system", content: ANALYSIS_PROMPT },
              {
                role: "user",
                content: [
                  { type: "text", text: "Analyse this wallpaper and return the JSON." },
                  { type: "image_url", image_url: { url: body.dataUrl } },
                ],
              },
            ],
            AI_CONFIG.model,
          );
          return Response.json({
            analysis: { ...analysis, image_number: body.imageNumber ?? 0, file: body.name ?? "" },
          });
        } catch (error) {
          return errorResponse(error);
        }
      },
    },
  },
});
