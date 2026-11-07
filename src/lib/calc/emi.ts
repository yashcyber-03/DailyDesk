export interface EmiValue {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  months: number;
}
export type EmiResult = { ok: true; value: EmiValue } | { ok: false; error: string };

export const MAX_TENURE_MONTHS = 600;

export function calculateEmi(principal: number, annualRatePercent: number, months: number): EmiResult {
  if (!(principal > 0)) return { ok: false, error: "Loan amount must be greater than zero." };
  if (annualRatePercent < 0 || annualRatePercent > 100) {
    return { ok: false, error: "Interest rate must be between 0% and 100%." };
  }
  if (!Number.isInteger(months) || months < 1 || months > MAX_TENURE_MONTHS) {
    return { ok: false, error: `Tenure must be a whole number of months between 1 and ${MAX_TENURE_MONTHS}.` };
  }
  const r = annualRatePercent / 12 / 100;
  const emi = r === 0 ? principal / months : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const totalPayment = emi * months;
  return { ok: true, value: { emi, totalPayment, totalInterest: totalPayment - principal, months } };
}
