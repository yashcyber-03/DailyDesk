export type BmiCategory = "Underweight" | "Normal weight" | "Overweight" | "Obese";
export interface BmiValue {
  bmi: number;
  category: BmiCategory;
  healthyMinKg: number;
  healthyMaxKg: number;
}
export type BmiResult = { ok: true; value: BmiValue } | { ok: false; error: string };

export const feetInchesToCm = (feet: number, inches: number) => (feet * 12 + inches) * 2.54;
export const poundsToKg = (lb: number) => lb * 0.45359237;
export const kgToPounds = (kg: number) => kg / 0.45359237;

/** WHO adult categories. */
export function bmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function calculateBmi(weightKg: number, heightCm: number): BmiResult {
  if (!(heightCm >= 50 && heightCm <= 250)) return { ok: false, error: "Enter a realistic height (50 to 250 cm)." };
  if (!(weightKg >= 10 && weightKg <= 500)) return { ok: false, error: "Enter a realistic weight (10 to 500 kg)." };
  const m = heightCm / 100;
  const bmi = weightKg / (m * m);
  return {
    ok: true,
    value: {
      bmi: Math.round(bmi * 10) / 10,
      category: bmiCategory(bmi),
      healthyMinKg: 18.5 * m * m,
      healthyMaxKg: 24.9 * m * m,
    },
  };
}
