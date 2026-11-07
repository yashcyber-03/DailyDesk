"use client";

import { useState } from "react";
import { JobStatus } from "@/components/tools/job-ui";
import { ImageSource } from "@/components/tools/sources";
import { Field, NumberInput, Segmented, ToolPanel } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { IMAGE_RULE } from "@/config/limits";
import { useImageFile } from "@/hooks/use-image-file";
import { useJob } from "@/hooks/use-job";
import { baseName, formatBytes } from "@/lib/files";
import { extFor, renderImage, type OutType } from "@/lib/image-ops";
import { parseNumber } from "@/lib/format";

export default function ImageCompressor() {
  const source = useImageFile();
  const { state, run, reset } = useJob();
  const [type, setType] = useState<OutType>("image/jpeg");
  const [quality, setQuality] = useState(75);
  const [maxDim, setMaxDim] = useState("");

  const maxDimNum = parseNumber(maxDim);
  const maxDimError = maxDim.trim() !== "" && (maxDimNum === null || maxDimNum < 16 || maxDimNum > 20000) ? "Enter a size between 16 and 20000 pixels, or leave empty." : null;

  return (
    <ToolPanel>
      <div className="space-y-5">
        <ImageSource source={source} rule={IMAGE_RULE} />
        {source.file && (
          <>
            <Segmented
              label="Output format"
              value={type}
              onChange={setType}
              options={[
                { value: "image/jpeg", label: "JPEG" },
                { value: "image/webp", label: "WebP (smaller)" },
              ]}
            />
            <Field label={`Quality: ${quality}%`} htmlFor="comp-quality" hint="Lower quality gives a smaller file.">
              <input id="comp-quality" type="range" min={10} max={100} step={5} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-[hsl(var(--primary))]" />
            </Field>
            <Field label="Limit the longest side (pixels, optional)" htmlFor="comp-max" hint="Shrinking large photos saves the most space.">
              <NumberInput id="comp-max" min="16" value={maxDim} onChange={(e) => setMaxDim(e.target.value)} aria-invalid={!!maxDimError} />
              {maxDimError && <p role="alert" className="text-xs text-destructive">{maxDimError}</p>}
            </Field>
            {type === "image/jpeg" && <p className="text-xs text-muted-foreground">JPEG has no transparency, so transparent areas become white.</p>}
          </>
        )}
      </div>
      <div className="space-y-4">
        <Button
          disabled={!source.file || !!maxDimError || state.status === "working"}
          onClick={() =>
            run(async (report) => {
              const img = source.image!;
              const file = source.file!;
              report(0.3, "Compressing...");
              const longest = Math.max(img.width, img.height);
              const scale = maxDimNum && longest > maxDimNum ? maxDimNum / longest : 1;
              const blob = await renderImage(img, {
                type,
                quality: quality / 100,
                width: img.width * scale,
                height: img.height * scale,
              });
              const diff = Math.round((1 - blob.size / file.size) * 100);
              return {
                outputs: [{ name: `${baseName(file.name)}-compressed.${extFor(type)}`, blob }],
                note:
                  diff >= 0
                    ? `${formatBytes(file.size)} to ${formatBytes(blob.size)} (${diff}% smaller).`
                    : `The result (${formatBytes(blob.size)}) is larger than the original (${formatBytes(file.size)}). Try a lower quality or a smaller size.`,
              };
            })
          }
        >
          Compress image
        </Button>
        <JobStatus state={state} onReset={reset} />
        {!source.file && <p className="text-sm text-muted-foreground">Choose an image to compress.</p>}
      </div>
    </ToolPanel>
  );
}
