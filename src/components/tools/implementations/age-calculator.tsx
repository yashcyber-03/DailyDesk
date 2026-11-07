"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { BigResult, EmptyResult, ErrorMessage, Field, ResultPanel, ResultRows, ToolPanel } from "@/components/tools/ui";
import { calculateAge, todayISO } from "@/lib/calc/age";
import { formatNumber } from "@/lib/format";

export default function AgeCalculator() {
  const [dob, setDob] = useState("");
  const [asOf, setAsOf] = useState("");

  const result = useMemo(() => (dob ? calculateAge(dob, asOf || todayISO()) : null), [dob, asOf]);

  return (
    <ToolPanel>
      <div className="space-y-5">
        <Field label="Date of birth" htmlFor="age-dob">
          <Input id="age-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
        </Field>
        <Field label="Age at (optional)" htmlFor="age-asof" hint="Leave empty to use today's date.">
          <Input id="age-asof" type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
        </Field>
      </div>
      <ResultPanel>
        {!result ? (
          <EmptyResult />
        ) : !result.ok ? (
          <ErrorMessage>{result.error}</ErrorMessage>
        ) : (
          <>
            <BigResult
              label="Your age"
              value={`${result.value.years} years, ${result.value.months} months, ${result.value.days} days`}
            />
            <ResultRows
              rows={[
                { label: "Total days lived", value: formatNumber(result.value.totalDays, 0) },
                { label: "Born on a", value: result.value.birthWeekday },
                {
                  label: "Next birthday",
                  value:
                    result.value.daysToNextBirthday === 0
                      ? "Today"
                      : `in ${formatNumber(result.value.daysToNextBirthday, 0)} days`,
                },
              ]}
            />
          </>
        )}
      </ResultPanel>
    </ToolPanel>
  );
}
