import { AI_LIMITS } from "../../config/ai.ts";
import { GeminiError, generate as defaultGenerate, type GeminiMessage, type GeminiResult } from "./gemini.ts";
import { buildChatSystem, buildToolPrompt } from "./prompts.ts";
import { getClientIp, type RateLimiter } from "./rate-limit.ts";
import { validateChatRequest, validateToolRequest, type Validation } from "./validate.ts";

type Generate = (req: Parameters<typeof defaultGenerate>[0]) => Promise<GeminiResult>;

export type QuotaResult =
  | { kind: "guest" }
  | { kind: "error" }
  | { kind: "account"; allowed: boolean; limit: number };

export interface HandlerDeps {
  env: Record<string, string | undefined>;
  /** applies to everyone, per IP address */
  minuteLimiter: RateLimiter;
  /** applies to visitors who are not signed in, per IP address (best effort, in memory) */
  guestDayLimiter: RateLimiter;
  /** daily quota for signed-in accounts, stored in the database */
  accountQuota?: (request: Request) => Promise<QuotaResult>;
  now?: () => number;
  generate?: Generate;
  /** override for tests */
  baseUrl?: string;
}

const DEFAULT_MODEL = "gemini-flash-latest";

export function secondsUntilUtcMidnight(nowMs: number): number {
  const d = new Date(nowMs);
  const next = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1);
  return Math.max(1, Math.ceil((next - nowMs) / 1000));
}

function respond(status: number, body: unknown, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...extra },
  });
}

const fail = (status: number, code: string, message: string, extra?: Record<string, string>, detail?: string) =>
  respond(status, { error: { code, message, ...(detail ? { detail } : {}) } }, extra);

async function readJson(request: Request): Promise<Validation<unknown>> {
  if (!(request.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
    return { ok: false, message: "Invalid request." };
  }
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > AI_LIMITS.maxBodyBytes) return { ok: false, message: "TOO_LARGE" };
  const text = await request.text();
  if (new TextEncoder().encode(text).length > AI_LIMITS.maxBodyBytes) return { ok: false, message: "TOO_LARGE" };
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, message: "Invalid request." };
  }
}

export function createHandlers(deps: HandlerDeps) {
  const gen: Generate = deps.generate ?? defaultGenerate;
  const isProd = deps.env.NODE_ENV === "production";

  async function run(
    request: Request,
    parse: (body: unknown) => Validation<{ system: string; messages: GeminiMessage[] }>,
  ): Promise<Response> {
    const apiKey = deps.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return fail(503, "not_configured", "AI features are not set up yet. The site owner needs to add a GEMINI_API_KEY.");
    }

    const ip = getClientIp(request.headers);
    const minute = deps.minuteLimiter.check(ip);
    if (!minute.allowed) {
      const wait = minute.retryAfterSec >= 90 ? `${Math.ceil(minute.retryAfterSec / 60)} minutes` : `${minute.retryAfterSec} seconds`;
      return fail(429, "rate_limited", `You are sending requests too quickly. Please try again in about ${wait}.`, {
        "retry-after": String(minute.retryAfterSec),
      });
    }

    const quota: QuotaResult = deps.accountQuota ? await deps.accountQuota(request).catch((): QuotaResult => ({ kind: "error" })) : { kind: "guest" };
    if (quota.kind === "account") {
      if (!quota.allowed) {
        const retry = secondsUntilUtcMidnight((deps.now ?? Date.now)());
        return fail(429, "quota_exceeded", `You have used all ${quota.limit} AI requests for today. The limit resets at midnight UTC.`, {
          "retry-after": String(retry),
        });
      }
    } else {
      const day = deps.guestDayLimiter.check(ip);
      if (!day.allowed) {
        const hours = Math.max(1, Math.ceil(day.retryAfterSec / 3600));
        return fail(429, "rate_limited", `You have reached today's limit for visitors. Log in for a higher limit, or try again in about ${hours} ${hours === 1 ? "hour" : "hours"}.`, {
          "retry-after": String(day.retryAfterSec),
        });
      }
    }

    const body = await readJson(request);
    if (!body.ok) {
      return body.message === "TOO_LARGE"
        ? fail(413, "too_large", "That request is too large.")
        : fail(400, "invalid_request", body.message);
    }
    const parsed = parse(body.value);
    if (!parsed.ok) return fail(400, "invalid_request", parsed.message);

    try {
      const result = await gen({
        apiKey,
        model: deps.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL,
        system: parsed.value.system,
        messages: parsed.value.messages,
        maxOutputTokens: AI_LIMITS.maxOutputTokens,
        timeoutMs: AI_LIMITS.timeoutMs,
        baseUrl: deps.baseUrl,
      });
      return respond(200, { text: result.text, truncated: result.truncated });
    } catch (e) {
      const err = e instanceof GeminiError ? e : new GeminiError("network");
      // Log only the error kind and status, never prompts or responses.
      console.error(`[ai] upstream failure: ${err.kind}${err.status ? ` ${err.status}` : ""}`);
      const detail = isProd ? undefined : err.message;
      if (err.kind === "blocked") {
        return fail(422, "blocked", "The AI could not respond to that. Try rewording your text.", undefined, detail);
      }
      if (err.kind === "timeout") {
        return fail(504, "timeout", "The AI took too long to respond. Please try again.", undefined, detail);
      }
      if (err.kind === "http" && err.status === 429) {
        return fail(503, "busy", "The AI service is busy right now. Please try again in a minute.", { "retry-after": "60" }, detail);
      }
      return fail(502, "upstream_error", "The AI service is not available right now. Please try again later.", undefined, detail);
    }
  }

  return {
    handleTool: (request: Request) =>
      run(request, (body) => {
        const v = validateToolRequest(body);
        if (!v.ok) return v;
        const p = buildToolPrompt(v.value.slug, v.value.input, v.value.options);
        return { ok: true, value: { system: p.system, messages: [{ role: "user", text: p.user }] } };
      }),
    handleChat: (request: Request) =>
      run(request, (body) => {
        const v = validateChatRequest(body);
        if (!v.ok) return v;
        return {
          ok: true,
          value: {
            system: buildChatSystem(v.value.mode),
            messages: v.value.messages.map((m) => ({ role: m.role === "user" ? "user" : "model", text: m.content })),
          },
        };
      }),
  };
}
