import { createFileRoute } from "@tanstack/react-router";
import { AI_CONFIG, analysisPrompt, modeConfig, normalizeMode } from "@/lib/ai-config";
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
            mode?: string;
          };
          if (!body?.dataUrl || !body.dataUrl.startsWith("data:image/")) {
            throw new GatewayError(400, "Unsupported or missing image data.");
          }
          const mode = normalizeMode(body.mode);
          const analysis = await chatJson<Record<string, unknown>>(
            [
              { role: "system", content: analysisPrompt(mode) },
              {
                role: "user",
                content: [
                  { type: "text", text: `Analyse this ${modeConfig(mode).noun} and return the JSON.` },
                  { type: "image_url", image_url: { url: body.dataUrl } },
                ],
              },
            ],
            AI_CONFIG.model,
          );
          return Response.json({
            analysis: {
              ...analysis,
              image_number: body.imageNumber ?? 0,
              file: body.name ?? "",
              mode,
            },
          });
        } catch (error) {
          return errorResponse(error);
        }
      },
    },
  },
});
