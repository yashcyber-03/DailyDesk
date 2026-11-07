"use client";

import { useMemo, useState } from "react";
import { JobStatus } from "@/components/tools/job-ui";
import { PdfSource } from "@/components/tools/sources";
import { Field, Segmented, ToolPanel } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_OUTPUT_FILES } from "@/config/limits";
import { useJob } from "@/hooks/use-job";
import { usePdfFile } from "@/hooks/use-pdf-file";
import { UserError } from "@/lib/errors";
import { baseName, bytesToBlob, uniqueNames } from "@/lib/files";
import { splitPdf } from "@/lib/pdf/ops";
import { parseRangeGroups } from "@/lib/pdf/ranges";

type Mode = "ranges" | "every";

export default function SplitPdf() {
  const source = usePdfFile();
  const { state, run, reset } = useJob();
  const [mode, setMode] = useState<Mode>("ranges");
  const [ranges, setRanges] = useState("");

  const parsed = useMemo(
    () => (source.pageCount && ranges.trim() ? parseRangeGroups(ranges, source.pageCount) : null),
    [ranges, source.pageCount],
  );
  const rangeError = mode === "ranges" && parsed && !parsed.ok ? parsed.error : null;
  const canRun = !!source.file && state.status !== "working" && (mode === "every" || (parsed?.ok ?? false));

  return (
    <ToolPanel>
      <div className="space-y-5">
        <PdfSource source={source} />
        {source.file && (
          <>
            <Segmented
              label="Split mode"
              value={mode}
              onChange={(m) => {
                setMode(m);
                reset();
              }}
              options={[
                { value: "ranges", label: "By page ranges" },
                { value: "every", label: "Every page" },
              ]}
            />
            {mode === "ranges" && (
              <Field label="Page ranges" htmlFor="split-ranges" hint="Each comma-separated part becomes its own PDF. Example: 1-3, 4, 5-8">
                <Input id="split-ranges" value={ranges} placeholder="1-3, 4, 5-8" onChange={(e) => setRanges(e.target.value)} aria-invalid={!!rangeError} />
                {rangeError && <p role="alert" className="text-xs text-destructive">{rangeError}</p>}
              </Field>
            )}
          </>
        )}
      </div>
      <div className="space-y-4">
        <Button
          disabled={!canRun}
          onClick={() =>
            run(async (report) => {
              const file = source.file!;
              const groups =
                mode === "every"
                  ? Array.from({ length: source.pageCount! }, (_, i) => [i + 1])
                  : parsed && parsed.ok ? parsed.groups : [];
              if (groups.length > MAX_OUTPUT_FILES) {
                throw new UserError(`That would create more than ${MAX_OUTPUT_FILES} files. Use page ranges instead.`);
              }
              const parts = await splitPdf(await file.arrayBuffer(), groups, (d, t) => report(d / t, `Creating file ${d} of ${t}...`));
              const base = baseName(file.name);
              const names = uniqueNames(
                groups.map((g) => (g.length === 1 ? `${base}-page-${g[0]}.pdf` : `${base}-pages-${g[0]}-${g[g.length - 1]}.pdf`)),
              );
              return { outputs: parts.map((p, i) => ({ name: names[i], blob: bytesToBlob(p, "application/pdf") })) };
            })
          }
        >
          Split PDF
        </Button>
        <JobStatus state={state} onReset={reset} zipName="split-pdf.zip" />
        {!source.file && <p className="text-sm text-muted-foreground">Choose a PDF to see the split options.</p>}
      </div>
    </ToolPanel>
  );
}
