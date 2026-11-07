"use client";

import { useState } from "react";
import { JobStatus } from "@/components/tools/job-ui";
import { ImageSource } from "@/components/tools/sources";
import { Field, ToolPanel } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { useImageFile } from "@/hooks/use-image-file";
import { useJob } from "@/hooks/use-job";
import { baseName, formatBytes, type FileRule } from "@/lib/files";
import { extFor, renderImage, type OutType } from "@/lib/image-ops";

/** Shared by the JPG to PNG and PNG to JPG tools. */
export function ImageConverter({ rule, to, id }: { rule: FileRule; to: OutType; id: string }) {
  const source = useImageFile();
  const { state, run, reset } = useJob();
  const [background, setBackground] = useState("#ffffff");
  const [quality, setQuality] = useState(92);
  const toJpeg = to === "image/jpeg";

  return (
    <ToolPanel>
      <div className="space-y-5">
        <ImageSource source={source} rule={rule} />
        {source.file && toJpeg && (
          <>
            <Field label="Background for transparent areas" htmlFor={`${id}-bg`} hint="JPG cannot be transparent, so any transparent parts are filled with this colour.">
              <input id={`${id}-bg`} type="color" value={background} onChange={(e) => setBackground(e.target.value)} className="h-10 w-20 cursor-pointer rounded-md border bg-background p-1" />
            </Field>
            <Field label={`Quality: ${quality}%`} htmlFor={`${id}-q`}>
              <input id={`${id}-q`} type="range" min={50} max={100} step={1} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-[hsl(var(--primary))]" />
            </Field>
          </>
        )}
        {source.file && !toJpeg && <p className="text-sm text-muted-foreground">PNG is lossless, so the converted file is usually larger than the JPG.</p>}
      </div>
      <div className="space-y-4">
        <Button
          disabled={!source.file || state.status === "working"}
          onClick={() =>
            run(async (report) => {
              report(0.4, "Converting...");
              const img = source.image!;
              const blob = await renderImage(img, {
                type: to,
                quality: toJpeg ? quality / 100 : undefined,
                width: img.width,
                height: img.height,
                background: toJpeg ? background : undefined,
              });
              return {
                outputs: [{ name: `${baseName(source.file!.name)}.${extFor(to)}`, blob }],
                note: `${formatBytes(source.file!.size)} to ${formatBytes(blob.size)}.`,
              };
            })
          }
        >
          Convert to {extFor(to).toUpperCase()}
        </Button>
        <JobStatus state={state} onReset={reset} />
        {!source.file && <p className="text-sm text-muted-foreground">Choose an image to convert.</p>}
      </div>
    </ToolPanel>
  );
}
