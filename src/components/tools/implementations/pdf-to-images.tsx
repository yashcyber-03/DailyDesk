"use client";

import { useMemo, useState } from "react";
import { JobStatus } from "@/components/tools/job-ui";
import { PdfSource } from "@/components/tools/sources";
import { Field, Segmented, ToolPanel } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useJob } from "@/hooks/use-job";
import { usePdfFile } from "@/hooks/use-pdf-file";
import { UserError } from "@/lib/errors";
import { baseName } from "@/lib/files";
import { parsePageRanges } from "@/lib/pdf/ranges";
import { renderPdfPages } from "@/lib/pdf/render";

const MAX_RENDER_PAGES = 100;
type Format = "png" | "jpg";

export default function PdfToImages() {
  const source = usePdfFile();
  const { state, run, reset } = useJob();
  const [format, setFormat] = useState<Format>("png");
  const [dpi, setDpi] = useState("150");
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
          <>
            <Segmented
              label="Image format"
              value={format}
              onChange={setFormat}
              options={[
                { value: "png", label: "PNG (sharp)" },
                { value: "jpg", label: "JPG (smaller)" },
              ]}
            />
            <Field label="Resolution" htmlFor="pdfimg-dpi">
              <Select id="pdfimg-dpi" value={dpi} onChange={(e) => setDpi(e.target.value)}>
                <option value="100">Draft (100 DPI)</option>
                <option value="150">Standard (150 DPI)</option>
                <option value="200">High (200 DPI)</option>
                <option value="300">Print (300 DPI)</option>
              </Select>
            </Field>
            <Field label="Pages (optional)" htmlFor="pdfimg-pages" hint={`Leave empty for all pages. Up to ${MAX_RENDER_PAGES} pages per run.`}>
              <Input id="pdfimg-pages" value={ranges} placeholder="1-5, 8" onChange={(e) => setRanges(e.target.value)} aria-invalid={!!error} />
              {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
            </Field>
          </>
        )}
      </div>
      <div className="space-y-4">
        <Button
          disabled={!source.file || !!error || state.status === "working"}
          onClick={() =>
            run(async (report) => {
              const pages = parsed?.ok ? parsed.pages : undefined;
              const count = pages ? pages.length : source.pageCount!;
              if (count > MAX_RENDER_PAGES) {
                throw new UserError(`Please convert at most ${MAX_RENDER_PAGES} pages at a time. Use the pages box to choose a range.`);
              }
              const type = format === "png" ? "image/png" : "image/jpeg";
              const rendered = await renderPdfPages(
                await source.file!.arrayBuffer(),
                { dpi: Number(dpi), type, quality: 0.92, pages },
                (d, t) => report(d / t, `Rendering page ${d} of ${t}...`),
              );
              const base = baseName(source.file!.name);
              return { outputs: rendered.map((r) => ({ name: `${base}-page-${r.pageNumber}.${format}`, blob: r.blob })) };
            })
          }
        >
          Convert to images
        </Button>
        <JobStatus state={state} onReset={reset} zipName="pdf-pages.zip" />
        {!source.file && <p className="text-sm text-muted-foreground">Choose a PDF to convert.</p>}
      </div>
    </ToolPanel>
  );
}
