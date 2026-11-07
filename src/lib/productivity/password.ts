export interface PasswordOptions {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  avoidAmbiguous: boolean;
}
export const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
  length: 16,
  lower: true,
  upper: true,
  digits: true,
  symbols: true,
  avoidAmbiguous: false,
};
export const MIN_LENGTH = 8;
export const MAX_LENGTH = 64;

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?",
} as const;
const AMBIGUOUS = /[0O1lI]/g;

export type RandomInt = (maxExclusive: number) => number;

/** Uniform random integer in [0, max) using rejection sampling (no modulo bias). */
export const cryptoRandomInt: RandomInt = (max) => {
  if (!Number.isInteger(max) || max <= 0 || max > 0x100000000) throw new RangeError("Invalid range");
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  let x: number;
  do {
    globalThis.crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % max;
};

export function activeSets(o: PasswordOptions): string[] {
  const picked = (["lower", "upper", "digits", "symbols"] as const).filter((k) => o[k]).map((k) => SETS[k]);
  return o.avoidAmbiguous ? picked.map((s) => s.replace(AMBIGUOUS, "")) : [...picked];
}

export function validateOptions(o: PasswordOptions): string | null {
  if (!Number.isInteger(o.length) || o.length < MIN_LENGTH || o.length > MAX_LENGTH) return `Choose a length from ${MIN_LENGTH} to ${MAX_LENGTH}.`;
  if (activeSets(o).length === 0) return "Select at least one type of character.";
  return null;
}

export function generatePassword(o: PasswordOptions, rand: RandomInt = cryptoRandomInt): string {
  const error = validateOptions(o);
  if (error) throw new RangeError(error);
  const sets = activeSets(o);
  const pool = sets.join("");
  const chars: string[] = sets.map((s) => s[rand(s.length)]);
  while (chars.length < o.length) chars.push(pool[rand(pool.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

export function strength(o: PasswordOptions): { bits: number; label: "Weak" | "Fair" | "Strong" | "Very strong" } {
  const poolSize = activeSets(o).join("").length;
  const bits = poolSize > 0 ? Math.round(o.length * Math.log2(poolSize)) : 0;
  return { bits, label: bits < 50 ? "Weak" : bits < 70 ? "Fair" : bits < 100 ? "Strong" : "Very strong" };
}
