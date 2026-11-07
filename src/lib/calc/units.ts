export interface UnitDef {
  id: string;
  label: string;
  /** multiply by this to get the category's base unit (not used for temperature) */
  factor: number;
}
export interface UnitCategory {
  id: string;
  label: string;
  units: UnitDef[];
}

export const unitCategories: UnitCategory[] = [
  {
    id: "length", label: "Length", units: [
      { id: "mm", label: "Millimetre (mm)", factor: 0.001 },
      { id: "cm", label: "Centimetre (cm)", factor: 0.01 },
      { id: "m", label: "Metre (m)", factor: 1 },
      { id: "km", label: "Kilometre (km)", factor: 1000 },
      { id: "in", label: "Inch (in)", factor: 0.0254 },
      { id: "ft", label: "Foot (ft)", factor: 0.3048 },
      { id: "yd", label: "Yard (yd)", factor: 0.9144 },
      { id: "mi", label: "Mile (mi)", factor: 1609.344 },
    ],
  },
  {
    id: "weight", label: "Weight / Mass", units: [
      { id: "mg", label: "Milligram (mg)", factor: 0.000001 },
      { id: "g", label: "Gram (g)", factor: 0.001 },
      { id: "kg", label: "Kilogram (kg)", factor: 1 },
      { id: "t", label: "Tonne (t)", factor: 1000 },
      { id: "oz", label: "Ounce (oz)", factor: 0.028349523125 },
      { id: "lb", label: "Pound (lb)", factor: 0.45359237 },
    ],
  },
  {
    id: "temperature", label: "Temperature", units: [
      { id: "c", label: "Celsius (°C)", factor: 1 },
      { id: "f", label: "Fahrenheit (°F)", factor: 1 },
      { id: "k", label: "Kelvin (K)", factor: 1 },
    ],
  },
  {
    id: "area", label: "Area", units: [
      { id: "cm2", label: "Square centimetre (cm²)", factor: 0.0001 },
      { id: "m2", label: "Square metre (m²)", factor: 1 },
      { id: "km2", label: "Square kilometre (km²)", factor: 1000000 },
      { id: "ha", label: "Hectare (ha)", factor: 10000 },
      { id: "in2", label: "Square inch (in²)", factor: 0.00064516 },
      { id: "ft2", label: "Square foot (ft²)", factor: 0.09290304 },
      { id: "yd2", label: "Square yard (yd²)", factor: 0.83612736 },
      { id: "acre", label: "Acre", factor: 4046.8564224 },
    ],
  },
  {
    id: "volume", label: "Volume", units: [
      { id: "ml", label: "Millilitre (ml)", factor: 0.001 },
      { id: "l", label: "Litre (l)", factor: 1 },
      { id: "m3", label: "Cubic metre (m³)", factor: 1000 },
      { id: "tsp", label: "Teaspoon (US)", factor: 0.00492892159375 },
      { id: "tbsp", label: "Tablespoon (US)", factor: 0.01478676478125 },
      { id: "floz", label: "Fluid ounce (US)", factor: 0.0295735295625 },
      { id: "cup", label: "Cup (US)", factor: 0.2365882365 },
      { id: "gal", label: "Gallon (US)", factor: 3.785411784 },
    ],
  },
  {
    id: "speed", label: "Speed", units: [
      { id: "ms", label: "Metre/second (m/s)", factor: 1 },
      { id: "kmh", label: "Kilometre/hour (km/h)", factor: 1 / 3.6 },
      { id: "mph", label: "Mile/hour (mph)", factor: 0.44704 },
      { id: "kn", label: "Knot (kn)", factor: 1852 / 3600 },
      { id: "fts", label: "Foot/second (ft/s)", factor: 0.3048 },
    ],
  },
];

export type ConvertResult = { ok: true; value: number } | { ok: false; error: string };

const toKelvin = (unit: string, v: number) => (unit === "c" ? v + 273.15 : unit === "f" ? ((v - 32) * 5) / 9 + 273.15 : v);
const fromKelvin = (unit: string, k: number) => (unit === "c" ? k - 273.15 : unit === "f" ? ((k - 273.15) * 9) / 5 + 32 : k);

export function convertUnit(categoryId: string, fromId: string, toId: string, value: number): ConvertResult {
  const category = unitCategories.find((c) => c.id === categoryId);
  if (!category) return { ok: false, error: "Unknown category." };
  const from = category.units.find((u) => u.id === fromId);
  const to = category.units.find((u) => u.id === toId);
  if (!from || !to) return { ok: false, error: "Unknown unit." };
  if (!Number.isFinite(value)) return { ok: false, error: "Enter a valid number." };

  if (category.id === "temperature") {
    const kelvin = toKelvin(from.id, value);
    if (kelvin < -1e-9) return { ok: false, error: "That is below absolute zero." };
    return { ok: true, value: fromKelvin(to.id, kelvin) };
  }
  return { ok: true, value: (value * from.factor) / to.factor };
}
