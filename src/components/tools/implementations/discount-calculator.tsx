"use client";

import { useMemo, useState } from "react";
import { BigResult, EmptyResult, ErrorMessage, Field, NumberInput, ResultPanel, ResultRows, ToolPanel } from "@/components/tools/ui";
import { calculateDiscount } from "@/lib/calc/discount";
import { formatMoney, formatNumber, parseNumber } from "@/lib/format";

export default function DiscountCalculator() {
  const [price, setPrice] = useState("");
  const [percent, setPercent] = useState("");
  const [extra, setExtra] = useState("");

  const priceNum = parseNumber(price);
  const percentNum = parseNumber(percent);
  const extraNum = parseNumber(extra);

  const result = useMemo(
    () => (priceNum === null || percentNum === null ? null : calculateDiscount(priceNum, percentNum, extraNum ?? 0)),
    [priceNum, percentNum, extraNum],
  );

  return (
    <ToolPanel>
      <div className="space-y-5">
        <Field label="Original price" htmlFor="disc-price">
          <NumberInput id="disc-price" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
        </Field>
        <Field label="Discount (%)" htmlFor="disc-percent">
          <NumberInput id="disc-percent" min="0" max="100" value={percent} onChange={(e) => setPercent(e.target.value)} />
        </Field>
        <Field label="Additional discount (%, optional)" htmlFor="disc-extra" hint="Applied on the already reduced price.">
          <NumberInput id="disc-extra" min="0" max="100" value={extra} onChange={(e) => setExtra(e.target.value)} />
        </Field>
      </div>
      <ResultPanel>
        {!result ? (
          <EmptyResult />
        ) : !result.ok ? (
          <ErrorMessage>{result.error}</ErrorMessage>
        ) : (
          <>
            <BigResult label="Final price" value={formatMoney(result.value.finalPrice)} />
            <ResultRows
              rows={[
                { label: "You save", value: formatMoney(result.value.saved) },
                { label: "Effective discount", value: `${formatNumber(result.value.effectivePercent, 2)}%` },
              ]}
            />
          </>
        )}
      </ResultPanel>
    </ToolPanel>
  );
}
