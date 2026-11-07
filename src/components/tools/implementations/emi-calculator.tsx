"use client";

import { useMemo, useState } from "react";
import { BigResult, EmptyResult, ErrorMessage, Field, NumberInput, ResultPanel, ResultRows, Segmented, ToolPanel } from "@/components/tools/ui";
import { calculateEmi } from "@/lib/calc/emi";
import { formatMoney, formatNumber, parseNumber } from "@/lib/format";

type Unit = "years" | "months";

export default function EmiCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [unit, setUnit] = useState<Unit>("years");

  const p = parseNumber(principal);
  const r = parseNumber(rate);
  const t = parseNumber(tenure);

  const result = useMemo(() => {
    if (p === null || r === null || t === null) return null;
    const months = unit === "years" ? Math.round(t * 12 * 1e6) / 1e6 : t;
    return calculateEmi(p, r, months);
  }, [p, r, t, unit]);

  const principalShare = result?.ok ? Math.round((p! / result.value.totalPayment) * 100) : 0;

  return (
    <ToolPanel>
      <div className="space-y-5">
        <Field label="Loan amount" htmlFor="emi-principal">
          <NumberInput id="emi-principal" min="0" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
        </Field>
        <Field label="Annual interest rate (%)" htmlFor="emi-rate">
          <NumberInput id="emi-rate" min="0" max="100" value={rate} onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Field label="Loan tenure" htmlFor="emi-tenure">
          <div className="flex gap-3">
            <NumberInput id="emi-tenure" min="0" value={tenure} onChange={(e) => setTenure(e.target.value)} />
            <Segmented
              label="Tenure unit"
              value={unit}
              onChange={setUnit}
              options={[
                { value: "years", label: "Years" },
                { value: "months", label: "Months" },
              ]}
            />
          </div>
        </Field>
      </div>
      <ResultPanel>
        {!result ? (
          <EmptyResult />
        ) : !result.ok ? (
          <ErrorMessage>{result.error}</ErrorMessage>
        ) : (
          <>
            <BigResult label="Monthly EMI" value={formatMoney(result.value.emi)} sub={`for ${formatNumber(result.value.months, 0)} months`} />
            <div
              className="mt-5 flex h-3 overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label={`Principal ${principalShare}% and interest ${100 - principalShare}% of total payment`}
            >
              <div className="bg-primary" style={{ width: `${principalShare}%` }} />
              <div className="bg-primary/30" style={{ width: `${100 - principalShare}%` }} />
            </div>
            <ResultRows
              rows={[
                { label: "Principal amount", value: formatMoney(p!) },
                { label: "Total interest", value: formatMoney(result.value.totalInterest) },
                { label: "Total payment", value: formatMoney(result.value.totalPayment) },
              ]}
            />
          </>
        )}
      </ResultPanel>
    </ToolPanel>
  );
}
