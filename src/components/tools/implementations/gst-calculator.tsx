"use client";

import { useMemo, useState } from "react";
import { Select } from "@/components/ui/select";
import { BigResult, EmptyResult, ErrorMessage, Field, NumberInput, ResultPanel, ResultRows, Segmented, ToolPanel } from "@/components/tools/ui";
import { calculateGst, type GstMode } from "@/lib/calc/gst";
import { formatMoney, parseNumber } from "@/lib/format";

const presets = ["0", "0.25", "3", "5", "18", "40"];

export default function GstCalculator() {
  const [mode, setMode] = useState<GstMode>("add");
  const [amount, setAmount] = useState("");
  const [choice, setChoice] = useState("18");
  const [custom, setCustom] = useState("");

  const amountNum = parseNumber(amount);
  const rateNum = choice === "custom" ? parseNumber(custom) : Number(choice);

  const result = useMemo(
    () => (amountNum === null || rateNum === null ? null : calculateGst(amountNum, rateNum, mode)),
    [amountNum, rateNum, mode],
  );

  return (
    <ToolPanel>
      <div className="space-y-5">
        <Segmented
          label="Calculation mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "add", label: "Add GST" },
            { value: "remove", label: "Remove GST" },
          ]}
        />
        <Field label={mode === "add" ? "Amount before GST" : "Amount including GST"} htmlFor="gst-amount">
          <NumberInput id="gst-amount" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="GST rate" htmlFor="gst-rate" hint="Check the current rate for your item or service before invoicing.">
          <Select id="gst-rate" value={choice} onChange={(e) => setChoice(e.target.value)}>
            {presets.map((p) => (
              <option key={p} value={p}>{p}%</option>
            ))}
            <option value="custom">Custom rate</option>
          </Select>
        </Field>
        {choice === "custom" && (
          <Field label="Custom GST rate (%)" htmlFor="gst-custom">
            <NumberInput id="gst-custom" min="0" max="100" value={custom} onChange={(e) => setCustom(e.target.value)} />
          </Field>
        )}
      </div>
      <ResultPanel>
        {!result ? (
          <EmptyResult />
        ) : !result.ok ? (
          <ErrorMessage>{result.error}</ErrorMessage>
        ) : (
          <>
            <BigResult label={mode === "add" ? "Total with GST" : "Price before GST"} value={formatMoney(mode === "add" ? result.value.total : result.value.net)} />
            <ResultRows
              rows={[
                { label: "Amount before GST", value: formatMoney(result.value.net) },
                { label: "CGST (half)", value: formatMoney(result.value.cgst) },
                { label: "SGST / UTGST (half)", value: formatMoney(result.value.sgst) },
                { label: "Total GST", value: formatMoney(result.value.gst) },
                { label: "Amount including GST", value: formatMoney(result.value.total) },
              ]}
            />
            <p className="mt-4 text-xs text-muted-foreground">
              For inter-state supplies, IGST equal to the total GST applies instead of CGST + SGST.
            </p>
          </>
        )}
      </ResultPanel>
    </ToolPanel>
  );
}
