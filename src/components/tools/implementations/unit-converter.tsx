"use client";

import { ArrowLeftRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { BigResult, EmptyResult, ErrorMessage, Field, NumberInput, ResultPanel, ToolPanel } from "@/components/tools/ui";
import { convertUnit, unitCategories } from "@/lib/calc/units";
import { formatNumber, parseNumber } from "@/lib/format";

export default function UnitConverter() {
  const [categoryId, setCategoryId] = useState(unitCategories[0].id);
  const [from, setFrom] = useState(unitCategories[0].units[0].id);
  const [to, setTo] = useState(unitCategories[0].units[1].id);
  const [value, setValue] = useState("1");

  const category = unitCategories.find((c) => c.id === categoryId) ?? unitCategories[0];
  const fromLabel = category.units.find((u) => u.id === from)?.label ?? "";
  const toLabel = category.units.find((u) => u.id === to)?.label ?? "";
  const num = parseNumber(value);

  const result = useMemo(() => (num === null ? null : convertUnit(categoryId, from, to, num)), [num, categoryId, from, to]);

  const changeCategory = (id: string) => {
    const next = unitCategories.find((c) => c.id === id);
    if (!next) return;
    setCategoryId(id);
    setFrom(next.units[0].id);
    setTo(next.units[1].id);
  };

  return (
    <ToolPanel>
      <div className="space-y-5">
        <Field label="Category" htmlFor="unit-category">
          <Select id="unit-category" value={categoryId} onChange={(e) => changeCategory(e.target.value)}>
            {unitCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Value" htmlFor="unit-value">
          <NumberInput id="unit-value" value={value} onChange={(e) => setValue(e.target.value)} />
        </Field>
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <Field label="From" htmlFor="unit-from">
            <Select id="unit-from" value={from} onChange={(e) => setFrom(e.target.value)}>
              {category.units.map((u) => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </Select>
          </Field>
          <Button
            variant="outline"
            size="icon"
            className="mb-0.5"
            aria-label="Swap units"
            onClick={() => {
              setFrom(to);
              setTo(from);
            }}
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
          <Field label="To" htmlFor="unit-to">
            <Select id="unit-to" value={to} onChange={(e) => setTo(e.target.value)}>
              {category.units.map((u) => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </Select>
          </Field>
        </div>
      </div>
      <ResultPanel>
        {!result ? (
          <EmptyResult />
        ) : !result.ok ? (
          <ErrorMessage>{result.error}</ErrorMessage>
        ) : (
          <BigResult
            label={`${formatNumber(num!, 10)} ${fromLabel} equals`}
            value={formatNumber(Number(result.value.toPrecision(10)), 10)}
            sub={toLabel}
          />
        )}
      </ResultPanel>
    </ToolPanel>
  );
}
