"use client";

import { useState, type ReactNode } from "react";
import { BigResult, EmptyResult, ErrorMessage, Field, NumberInput, ResultPanel, Segmented, ToolPanel } from "@/components/tools/ui";
import { percentChange, percentOf, whatPercent } from "@/lib/calc/percentage";
import { formatNumber, parseNumber } from "@/lib/format";

type Mode = "of" | "what" | "change";

const modes: { value: Mode; label: string }[] = [
  { value: "of", label: "X% of Y" },
  { value: "what", label: "X is what % of Y" },
  { value: "change", label: "% change" },
];

const labels: Record<Mode, { a: string; b: string }> = {
  of: { a: "Percentage (%)", b: "Number" },
  what: { a: "Part (X)", b: "Whole (Y)" },
  change: { a: "From (old value)", b: "To (new value)" },
};

export default function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>("of");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const na = parseNumber(a);
  const nb = parseNumber(b);

  let output: ReactNode = <EmptyResult />;
  if (na !== null && nb !== null) {
    if (mode === "of") {
      const r = percentOf(na, nb);
      output = r.ok && <BigResult label={`${formatNumber(na, 4)}% of ${formatNumber(nb, 4)} is`} value={formatNumber(r.value, 4)} />;
    } else if (mode === "what") {
      const r = whatPercent(na, nb);
      output = r.ok ? (
        <BigResult label={`${formatNumber(na, 4)} is`} value={`${formatNumber(r.value, 4)}%`} sub={`of ${formatNumber(nb, 4)}`} />
      ) : (
        <ErrorMessage>{r.error}</ErrorMessage>
      );
    } else {
      const r = percentChange(na, nb);
      output = r.ok ? (
        <BigResult
          label={r.value > 0 ? "Increase" : r.value < 0 ? "Decrease" : "No change"}
          value={`${formatNumber(Math.abs(r.value), 4)}%`}
          sub={`from ${formatNumber(na, 4)} to ${formatNumber(nb, 4)}`}
        />
      ) : (
        <ErrorMessage>{r.error}</ErrorMessage>
      );
    }
  }

  return (
    <ToolPanel>
      <div className="space-y-5">
        <Segmented label="Calculation type" value={mode} onChange={setMode} options={modes} />
        <Field label={labels[mode].a} htmlFor="pct-a">
          <NumberInput id="pct-a" value={a} onChange={(e) => setA(e.target.value)} />
        </Field>
        <Field label={labels[mode].b} htmlFor="pct-b">
          <NumberInput id="pct-b" value={b} onChange={(e) => setB(e.target.value)} />
        </Field>
      </div>
      <ResultPanel>{output}</ResultPanel>
    </ToolPanel>
  );
}
