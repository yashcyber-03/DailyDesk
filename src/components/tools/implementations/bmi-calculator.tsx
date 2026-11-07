"use client";

import { useMemo, useState } from "react";
import { BigResult, EmptyResult, ErrorMessage, Field, NumberInput, ResultPanel, ResultRows, Segmented, ToolPanel } from "@/components/tools/ui";
import { calculateBmi, feetInchesToCm, kgToPounds, poundsToKg } from "@/lib/calc/bmi";
import { formatNumber, parseNumber } from "@/lib/format";

type System = "metric" | "imperial";

export default function BmiCalculator() {
  const [system, setSystem] = useState<System>("metric");
  const [cm, setCm] = useState("");
  const [kg, setKg] = useState("");
  const [ft, setFt] = useState("");
  const [inch, setInch] = useState("");
  const [lb, setLb] = useState("");

  const heightCm = useMemo(() => {
    if (system === "metric") return parseNumber(cm);
    const f = parseNumber(ft);
    return f === null ? null : feetInchesToCm(f, parseNumber(inch) ?? 0);
  }, [system, cm, ft, inch]);

  const weightKg = useMemo(() => {
    if (system === "metric") return parseNumber(kg);
    const w = parseNumber(lb);
    return w === null ? null : poundsToKg(w);
  }, [system, kg, lb]);

  const result = heightCm === null || weightKg === null ? null : calculateBmi(weightKg, heightCm);
  const imperial = system === "imperial";

  return (
    <ToolPanel>
      <div className="space-y-5">
        <Segmented
          label="Unit system"
          value={system}
          onChange={setSystem}
          options={[
            { value: "metric", label: "Metric (cm, kg)" },
            { value: "imperial", label: "Imperial (ft, lb)" },
          ]}
        />
        {imperial ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Height (feet)" htmlFor="bmi-ft">
                <NumberInput id="bmi-ft" min="0" value={ft} onChange={(e) => setFt(e.target.value)} />
              </Field>
              <Field label="Inches" htmlFor="bmi-in">
                <NumberInput id="bmi-in" min="0" value={inch} onChange={(e) => setInch(e.target.value)} />
              </Field>
            </div>
            <Field label="Weight (pounds)" htmlFor="bmi-lb">
              <NumberInput id="bmi-lb" min="0" value={lb} onChange={(e) => setLb(e.target.value)} />
            </Field>
          </>
        ) : (
          <>
            <Field label="Height (cm)" htmlFor="bmi-cm">
              <NumberInput id="bmi-cm" min="0" value={cm} onChange={(e) => setCm(e.target.value)} />
            </Field>
            <Field label="Weight (kg)" htmlFor="bmi-kg">
              <NumberInput id="bmi-kg" min="0" value={kg} onChange={(e) => setKg(e.target.value)} />
            </Field>
          </>
        )}
      </div>
      <ResultPanel>
        {!result ? (
          <EmptyResult />
        ) : !result.ok ? (
          <ErrorMessage>{result.error}</ErrorMessage>
        ) : (
          <>
            <BigResult label="Your BMI" value={result.value.bmi.toFixed(1)} sub={result.value.category} />
            <ResultRows
              rows={[
                {
                  label: "Healthy weight range for your height",
                  value: imperial
                    ? `${formatNumber(kgToPounds(result.value.healthyMinKg), 0)} to ${formatNumber(kgToPounds(result.value.healthyMaxKg), 0)} lb`
                    : `${formatNumber(result.value.healthyMinKg, 1)} to ${formatNumber(result.value.healthyMaxKg, 1)} kg`,
                },
              ]}
            />
            <p className="mt-4 text-xs text-muted-foreground">
              BMI is a general screening number for adults. It is not a diagnosis. For health advice, please talk to a doctor.
            </p>
          </>
        )}
      </ResultPanel>
    </ToolPanel>
  );
}
