export type GstMode = "add" | "remove";
export interface GstValue {
  net: number;
  gst: number;
  cgst: number;
  sgst: number;
  total: number;
}
export type GstResult = { ok: true; value: GstValue } | { ok: false; error: string };

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function calculateGst(amount: number, ratePercent: number, mode: GstMode): GstResult {
  if (!(amount >= 0)) return { ok: false, error: "Amount cannot be negative." };
  if (!(ratePercent >= 0 && ratePercent <= 100)) return { ok: false, error: "GST rate must be between 0% and 100%." };
  let net: number;
  let gst: number;
  let total: number;
  if (mode === "add") {
    net = round2(amount);
    gst = round2((net * ratePercent) / 100);
    total = round2(net + gst);
  } else {
    total = round2(amount);
    net = round2(total / (1 + ratePercent / 100));
    gst = round2(total - net);
  }
  return { ok: true, value: { net, gst, cgst: gst / 2, sgst: gst / 2, total } };
}
