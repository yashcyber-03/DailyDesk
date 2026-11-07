export type Rgb = [number, number, number];

const HEX = /^#?([0-9a-f]{6})$/i;
const HEX3 = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i;

export function normalizeHex(input: string): string | null {
  const t = input.trim();
  const m6 = HEX.exec(t);
  if (m6) return `#${m6[1].toLowerCase()}`;
  const m3 = HEX3.exec(t);
  if (m3) return `#${m3[1]}${m3[1]}${m3[2]}${m3[2]}${m3[3]}${m3[3]}`.toLowerCase();
  return null;
}

export function hexToRgb(hex: string): Rgb | null {
  const n = normalizeHex(hex);
  if (!n) return null;
  return [parseInt(n.slice(1, 3), 16), parseInt(n.slice(3, 5), 16), parseInt(n.slice(5, 7), 16)];
}

export const rgbToHex = ([r, g, b]: Rgb) =>
  `#${[r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("")}`;

/** h: 0-360, s and l: 0-100 */
export function rgbToHsl([r, g, b]: Rgb): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l * 100];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return [(h * 60 + 360) % 360, s * 100, l * 100];
}

export function hslToRgb(h: number, s: number, l: number): Rgb {
  const sn = s / 100, ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let rgb: Rgb = [0, 0, 0];
  if (hp < 1) rgb = [c, x, 0];
  else if (hp < 2) rgb = [x, c, 0];
  else if (hp < 3) rgb = [0, c, x];
  else if (hp < 4) rgb = [0, x, c];
  else if (hp < 5) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  const m = ln - c / 2;
  return [(rgb[0] + m) * 255, (rgb[1] + m) * 255, (rgb[2] + m) * 255];
}

export const hslToHex = (h: number, s: number, l: number) => rgbToHex(hslToRgb(h, s, l));

export type Harmony = "complementary" | "analogous" | "triadic" | "tetradic" | "split-complementary" | "monochromatic";

export const harmonies: { value: Harmony; label: string }[] = [
  { value: "analogous", label: "Analogous" },
  { value: "complementary", label: "Complementary" },
  { value: "split-complementary", label: "Split complementary" },
  { value: "triadic", label: "Triadic" },
  { value: "tetradic", label: "Tetradic" },
  { value: "monochromatic", label: "Monochromatic" },
];

const OFFSETS: Record<Exclude<Harmony, "monochromatic">, number[]> = {
  complementary: [0, 180],
  analogous: [-60, -30, 0, 30, 60],
  triadic: [0, 120, 240],
  tetradic: [0, 90, 180, 270],
  "split-complementary": [0, 150, 210],
};

export function generatePalette(baseHex: string, harmony: Harmony): string[] {
  const rgb = hexToRgb(baseHex);
  if (!rgb) return [];
  const [h, s, l] = rgbToHsl(rgb);
  if (harmony === "monochromatic") {
    return [20, 35, 50, 65, 80].map((light) => hslToHex(h, s, light));
  }
  return OFFSETS[harmony].map((off) => (off === 0 ? normalizeHex(baseHex)! : hslToHex(h + off, s, l)));
}

function luminance([r, g, b]: Rgb) {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function readableTextColor(hex: string): "#000000" | "#ffffff" {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#000000";
  return contrastRatio(rgb, [0, 0, 0]) >= contrastRatio(rgb, [255, 255, 255]) ? "#000000" : "#ffffff";
}
