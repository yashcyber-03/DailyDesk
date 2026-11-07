"use client";

import { useState } from "react";
import { JobStatus } from "@/components/tools/job-ui";
import { PdfSource } from "@/components/tools/sources";
import { Field, Segmented, ToolPanel } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useJob } from "@/hooks/use-job";
import { usePdfFile } from "@/hooks/use-pdf-file";
import { baseName, bytesToBlob, formatBytes } from "@/lib/files";
import { compressLight } from "@/lib/pdf/ops";
import { compressByRasterizing } from "@/lib/pdf/render";

type Mode = "light" | "strong";
const levels = {
  balanced: { dpi: 150, quality: 0.7, label: "Balanced (150 DPI)" },
  small: { dpi: 110, quality: 0.6, label: "Smaller (110 DPI)" },
  smallest: { dpi: 80, quality: 0.5, label: "Smallest (80 DPI)" },
} as const;
type Level = keyof typeof levels;

export default function CompressPdf() {
  const source = usePdfFile();
  const { state, run, reset } = useJob();
  const [mode, setMode] = useState<Mode>("light");
  const [level, setLevel] = useState<Level>("balanced");

  return (
    <ToolPanel>
      <div className="space-y-5">
        <PdfSource source={source} />
        {source.file && (
          <>
            <Segmented
              label="Compression mode"
              value={mode}
              onChange={setMode}
              options={[
                { value: "light", label: "Light (keeps text)" },
                { value: "strong", label: "Strong (pages become images)" },
              ]}
            />
            {mode === "light" ? (
              <p className="text-sm text-muted-foreground">
                Rewrites the PDF more compactly. Text stays selectable and quality does not change, but the saving is often small.
              </p>
            ) : (
              <>
                <Field label="Quality" htmlFor="compress-level">
                  <Select id="compress-level" value={level} onChange={(e) => setLevel(e.target.value as Level)}>
                    {(Object.keys(levels) as Level[]).map((k) => (
                      <option key={k} value={k}>{levels[k].label}</option>
                    ))}
                  </Select>
                </Field>
                <p className="text-sm text-muted-foreground">
                  Each page is turned into a picture, which can shrink scanned or image-heavy PDFs a lot. Text can no longer be selected or searched.
                </p>
              </>
            )}
          </>
        )}
      </div>
      <div className="space-y-4">
        <Button
          disabled={!source.file || state.status === "working"}
          onClick={() =>
            run(async (report) => {
              const file = source.file!;
              const data = await file.arrayBuffer();
              let bytes: Uint8Array;
              if (mode === "light") {
                report(0.3, "Optimizing...");
                bytes = await compressLight(data);
              } else {
                const l = levels[level];
                bytes = await compressByRasterizing(data, l, (d, t) => report(d / t, `Compressing page ${d} of ${t}...`));
              }
              if (bytes.length >= file.size) {
                return {
                  outputs: [],
                  note: `No saving: the result (${formatBytes(bytes.length)}) is not smaller than the original (${formatBytes(file.size)}). The PDF may already be well compressed. ${mode === "light" ? "Try Strong mode." : "Try a lower quality."}`,
                };
              }
              const saved = Math.round((1 - bytes.length / file.size) * 100);
              return {
                outputs: [{ name: `${baseName(file.name)}-compressed.pdf`, blob: bytesToBlob(bytes, "application/pdf") }],
                note: `${formatBytes(file.size)} to ${formatBytes(bytes.length)} (${saved}% smaller).`,
              };
            })
          }
        >
          Compress PDF
        </Button>
        <JobStatus state={state} onReset={reset} />
        {!source.file && <p className="text-sm text-muted-foreground">Choose a PDF to compress.</p>}
      </div>
    </ToolPanel>
  );
}
