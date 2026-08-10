const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

type Content =
  | string
  | Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    >;

export type ChatMessage = { role: "system" | "user"; content: Content };

export class GatewayError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function chatJson<T>(messages: ChatMessage[], model: string): Promise<T> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new GatewayError(500, "AI is not configured (missing API key).");

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({ model, messages, response_format: { type: "json_object" } }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429)
      throw new GatewayError(429, "Rate limit reached. Please wait a moment and try again.");
    if (res.status === 402)
      throw new GatewayError(402, "AI credits exhausted. Add credits to continue.");
    throw new GatewayError(res.status, `AI request failed (${res.status}): ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = data.choices?.[0]?.message?.content ?? "";
  return parseJson<T>(raw);
}

export function parseJson<T>(raw: string): T {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    }
    throw new GatewayError(502, "The AI returned an unreadable response. Please try again.");
  }
}

export function errorResponse(error: unknown) {
  const status = error instanceof GatewayError ? error.status : 500;
  const message = error instanceof Error ? error.message : "Unexpected error";
  return Response.json({ error: message }, { status: status >= 400 ? status : 500 });
}
