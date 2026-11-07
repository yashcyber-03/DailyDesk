export interface AgeValue {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  daysToNextBirthday: number;
  birthWeekday: string;
}
export type AgeResult = { ok: true; value: AgeValue } | { ok: false; error: string };

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();
const dayNumber = (y: number, m: number, d: number) => Math.round(Date.UTC(y, m - 1, d) / 86400000);

function parseISO(value: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) return null;
  return { y, m, d };
}

export function todayISO(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

export function calculateAge(dob: string, asOf: string): AgeResult {
  const b = parseISO(dob);
  const a = parseISO(asOf);
  if (!b) return { ok: false, error: "Enter a valid date of birth." };
  if (!a) return { ok: false, error: "Enter a valid 'age at' date." };
  if (b.y < 1900) return { ok: false, error: "Date of birth must be 1900 or later." };
  if (dayNumber(b.y, b.m, b.d) > dayNumber(a.y, a.m, a.d)) {
    return { ok: false, error: "Date of birth cannot be after the 'age at' date." };
  }

  let totalMonths = (a.y - b.y) * 12 + (a.m - b.m);
  if (a.d < b.d) totalMonths -= 1;

  // Anchor = birth date moved forward by whole months (day clamped to month end).
  const anchorMonthIndex = b.m - 1 + totalMonths;
  const anchorY = b.y + Math.floor(anchorMonthIndex / 12);
  const anchorM = (anchorMonthIndex % 12) + 1;
  const anchorD = Math.min(b.d, daysInMonth(anchorY, anchorM));
  const days = dayNumber(a.y, a.m, a.d) - dayNumber(anchorY, anchorM, anchorD);

  let nextY = a.y;
  let nextD = Math.min(b.d, daysInMonth(nextY, b.m));
  if (dayNumber(nextY, b.m, nextD) < dayNumber(a.y, a.m, a.d)) {
    nextY += 1;
    nextD = Math.min(b.d, daysInMonth(nextY, b.m));
  }

  return {
    ok: true,
    value: {
      years: Math.floor(totalMonths / 12),
      months: totalMonths % 12,
      days,
      totalDays: dayNumber(a.y, a.m, a.d) - dayNumber(b.y, b.m, b.d),
      daysToNextBirthday: dayNumber(nextY, b.m, nextD) - dayNumber(a.y, a.m, a.d),
      birthWeekday: WEEKDAYS[new Date(Date.UTC(b.y, b.m - 1, b.d)).getUTCDay()],
    },
  };
}
