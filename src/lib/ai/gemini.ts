export type GeminiErrorKind = "blocked" | "http" | "timeout" | "empty" | "network";

export class GeminiError extends Error {
  kind: GeminiErrorKind;
  status?: number;
  constructor(kind: GeminiErrorKind, status?: number) {
    super(`Gemini request failed: ${kind}${status ? ` (${status})` : ""}`);
    this.name = "GeminiError";
    this.kind = kind;
    this.status = status;
  }
}

export interface GeminiMessage {
  role: "user" | "model";
  text: string;
}

export interface GeminiRequest {
  apiKey: string;
  model: string;
  system: string;
  messages: GeminiMessage[];
  maxOutputTokens: number;
  temperature?: number;
  timeoutMs: number;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export interface GeminiResult {
  text: string;
  truncated: boolean;
}

interface GeminiResponse {
  promptFeedback?: { blockReason?: string };
  candidates?: {
    finishReason?: string;
    content?: { parts?: { text?: unknown; thought?: unknown }[] };
  }[];
}

const MODEL_PATTERN = /^[a-zA-Z0-9._-]+$/;

/** Calls the Gemini generateContent REST endpoint. Never log the request or response content. */
export async function generate(req: GeminiRequest): Promise<GeminiResult> {
  if (!MODEL_PATTERN.test(req.model)) throw new GeminiError("http", 400);
  const base = req.baseUrl ?? "https://generativelanguage.googleapis.com";
  const url = `${base}/v1beta/models/${encodeURIComponent(req.model)}:generateContent`;
  const doFetch = req.fetchImpl ?? fetch;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), req.timeoutMs);
  let res: Response;
  try {
    res = await doFetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": req.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: req.system }] },
        contents: req.messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
        generationConfig: { temperature: req.temperature ?? 0.6, maxOutputTokens: req.maxOutputTokens },
      }),
      signal: controller.signal,
    });
  } catch (e) {
    throw new GeminiError(e instanceof Error && e.name === "AbortError" ? "timeout" : "network");
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) throw new GeminiError("http", res.status);

  let data: GeminiResponse;
  try {
    data = (await res.json()) as GeminiResponse;
  } catch {
    throw new GeminiError("empty");
  }

  if (data.promptFeedback?.blockReason) throw new GeminiError("blocked");
  const candidate = data.candidates?.[0];
  const text = (candidate?.content?.parts ?? [])
    .filter((p) => typeof p.text === "string" && !p.thought)
    .map((p) => p.text as string)
    .join("")
    .trim();
  if (!text) {
    const reason = candidate?.finishReason;
    throw new GeminiError(reason && reason !== "STOP" && reason !== "MAX_TOKENS" ? "blocked" : "empty");
  }
  return { text, truncated: candidate?.finishReason === "MAX_TOKENS" };
}
