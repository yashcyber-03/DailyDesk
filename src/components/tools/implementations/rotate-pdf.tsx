"use client";

import { useMemo, useState } from "react";
import { JobStatus } from "@/components/tools/job-ui";
import { PdfSource } from "@/components/tools/sources";
import { Field, Segmented, ToolPanel } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJob } from "@/hooks/use-job";
import { usePdfFile } from "@/hooks/use-pdf-file";
import { baseName, bytesToBlob } from "@/lib/files";
import { rotatePdf } from "@/lib/pdf/ops";
import { parsePageRanges } from "@/lib/pdf/ranges";

type Angle = "90" | "180" | "270";
type Scope = "all" | "some";

export default function RotatePdf() {
  const source = usePdfFile();
  const { state, run, reset } = useJob();
  const [angle, setAngle] = useState<Angle>("90");
  const [scope, setScope] = useState<Scope>("all");
  const [ranges, setRanges] = useState("");

  const parsed = useMemo(
    () => (scope === "some" && source.pageCount && ranges.trim() ? parsePageRanges(ranges, source.pageCount) : null),
    [scope, ranges, source.pageCount],
  );
  const error = parsed && !parsed.ok ? parsed.error : null;
  const ready = !!source.file && (scope === "all" || !!parsed?.ok);

  return (
    <ToolPanel>
      <div className="space-y-5">
        <PdfSource source={source} />
        {source.file && (
          <>
            <Segmented
              label="Rotation"
              value={angle}
              onChange={setAngle}
              options={[
                { value: "90", label: "90° right" },
                { value: "180", label: "180°" },
                { value: "270", label: "90° left" },
              ]}
            />
            <Segmented
              label="Pages to rotate"
              value={scope}
              onChange={setScope}
              options={[
                { value: "all", label: "All pages" },
                { value: "some", label: "Selected pages" },
              ]}
            />
            {scope === "some" && (
              <Field label="Pages" htmlFor="rotate-ranges" hint="Example: 1-3, 5">
                <Input id="rotate-ranges" value={ranges} placeholder="1-3, 5" onChange={(e) => setRanges(e.target.value)} aria-invalid={!!error} />
                {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
              </Field>
            )}
          </>
        )}
      </div>
      <div className="space-y-4">
        <Button
          disabled={!ready || state.status === "working"}
          onClick={() =>
            run(async () => {
              const pages = scope === "some" && parsed?.ok ? parsed.pages : undefined;
              const bytes = await rotatePdf(await source.file!.arrayBuffer(), Number(angle) as 90 | 180 | 270, pages);
              return { outputs: [{ name: `${baseName(source.file!.name)}-rotated.pdf`, blob: bytesToBlob(bytes, "application/pdf") }] };
            })
          }
        >
          Rotate PDF
        </Button>
        <JobStatus state={state} onReset={reset} />
        {!source.file && <p className="text-sm text-muted-foreground">Choose a PDF to rotate.</p>}
      </div>
    </ToolPanel>
  );
}
