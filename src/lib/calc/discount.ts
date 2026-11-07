export interface DiscountValue {
  finalPrice: number;
  saved: number;
  effectivePercent: number;
}
export type DiscountResult = { ok: true; value: DiscountValue } | { ok: false; error: string };

/** Applies the first discount, then the optional second one on the reduced price. */
export function calculateDiscount(price: number, percent: number, extraPercent = 0): DiscountResult {
  if (!(price > 0)) return { ok: false, error: "Original price must be greater than zero." };
  if (!(percent >= 0 && percent <= 100)) return { ok: false, error: "Discount must be between 0% and 100%." };
  if (!(extraPercent >= 0 && extraPercent <= 100)) {
    return { ok: false, error: "Additional discount must be between 0% and 100%." };
  }
  const finalPrice = price * (1 - percent / 100) * (1 - extraPercent / 100);
  const saved = price - finalPrice;
  return { ok: true, value: { finalPrice, saved, effectivePercent: (saved / price) * 100 } };
}
