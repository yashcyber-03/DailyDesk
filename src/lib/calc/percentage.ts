type Result = { ok: true; value: number } | { ok: false; error: string };

/** X% of Y */
export function percentOf(percent: number, value: number): Result {
  return { ok: true, value: (percent / 100) * value };
}

/** part is what % of whole */
export function whatPercent(part: number, whole: number): Result {
  if (whole === 0) return { ok: false, error: "The whole cannot be zero." };
  return { ok: true, value: (part / whole) * 100 };
}

/** percentage change from `from` to `to` (positive = increase) */
export function percentChange(from: number, to: number): Result {
  if (from === 0) return { ok: false, error: "The starting value cannot be zero." };
  return { ok: true, value: ((to - from) / Math.abs(from)) * 100 };
}
