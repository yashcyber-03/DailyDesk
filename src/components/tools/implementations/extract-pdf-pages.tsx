"use client";

import { useMemo, useState } from "react";
import { JobStatus } from "@/components/tools/job-ui";
import { PdfSource } from "@/components/tools/sources";
import { Field, ToolPanel } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJob } from "@/hooks/use-job";
import { usePdfFile } from "@/hooks/use-pdf-file";
import { baseName, bytesToBlob } from "@/lib/files";
import { extractPages } from "@/lib/pdf/ops";
import { parsePageRanges } from "@/lib/pdf/ranges";

export default function ExtractPdfPages() {
  const source = usePdfFile();
  const { state, run, reset } = useJob();
  const [ranges, setRanges] = useState("");

  const parsed = useMemo(
    () => (source.pageCount && ranges.trim() ? parsePageRanges(ranges, source.pageCount) : null),
    [ranges, source.pageCount],
  );
  const error = parsed && !parsed.ok ? parsed.error : null;

  return (
    <ToolPanel>
      <div className="space-y-5">
        <PdfSource source={source} />
        {source.file && (
          <Field label="Pages to extract" htmlFor="extract-ranges" hint="Pages are kept in the order you type them. Example: 1-3, 7, 10">
            <Input id="extract-ranges" value={ranges} placeholder="1-3, 7, 10" onChange={(e) => setRanges(e.target.value)} aria-invalid={!!error} />
            {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
          </Field>
        )}
      </div>
      <div className="space-y-4">
        <Button
          disabled={!source.file || !parsed?.ok || state.status === "working"}
          onClick={() =>
            run(async () => {
              if (!parsed?.ok) return { outputs: [] };
              const bytes = await extractPages(await source.file!.arrayBuffer(), parsed.pages);
              return {
                outputs: [{ name: `${baseName(source.file!.name)}-extracted.pdf`, blob: bytesToBlob(bytes, "application/pdf") }],
                note: `Extracted ${parsed.pages.length} ${parsed.pages.length === 1 ? "page" : "pages"}.`,
              };
            })
          }
        >
          Extract pages
        </Button>
        <JobStatus state={state} onReset={reset} />
        {!source.file && <p className="text-sm text-muted-foreground">Choose a PDF to pick its pages.</p>}
      </div>
    </ToolPanel>
  );
}
