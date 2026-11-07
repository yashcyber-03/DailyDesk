import { AI_LIMITS } from "../../config/ai.ts";
import { aiLimitFor } from "../../config/plans.ts";
import { isSupabaseConfigured } from "../supabase/config";
import { createClient } from "../supabase/server";
import { createHandlers, type QuotaResult } from "./handler.ts";
import { createRateLimiter } from "./rate-limit.ts";

const intFromEnv = (value: string | undefined, fallback: number) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

const minuteLimiter = createRateLimiter([{ windowMs: 60_000, max: intFromEnv(process.env.AI_RATE_LIMIT_PER_MINUTE, AI_LIMITS.perMinute) }]);
const guestDayLimiter = createRateLimiter([{ windowMs: 24 * 60 * 60_000, max: intFromEnv(process.env.AI_RATE_LIMIT_PER_DAY, AI_LIMITS.perDay) }]);

/** Signed-in users get a per-account daily quota that lives in the database, so it holds across server instances. */
async function accountQuota(): Promise<QuotaResult> {
  if (!isSupabaseConfigured()) return { kind: "guest" };
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (!data?.claims) return { kind: "guest" };
    const limit = aiLimitFor("free");
    const { data: allowed, error } = await supabase.rpc("consume_ai_quota", { p_limit: limit });
    if (error) return { kind: "error" };
    return { kind: "account", allowed: allowed === true, limit };
  } catch {
    return { kind: "error" };
  }
}

export const aiHandlers = createHandlers({ env: process.env, minuteLimiter, guestDayLimiter, accountQuota });
