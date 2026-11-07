"use client";

import { useEffect, useState } from "react";
import { JobStatus } from "@/components/tools/job-ui";
import { ImageSource } from "@/components/tools/sources";
import { Field, NumberInput, Segmented, ToolPanel } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { IMAGE_RULE } from "@/config/limits";
import { useImageFile } from "@/hooks/use-image-file";
import { useJob } from "@/hooks/use-job";
import { parseNumber } from "@/lib/format";
import { baseName } from "@/lib/files";
import { extFor, MAX_PIXELS, renderImage, sameTypeAs } from "@/lib/image-ops";

type Mode = "pixels" | "percent";

export default function ImageResizer() {
  const source = useImageFile();
  const { state, run, reset } = useJob();
  const [mode, setMode] = useState<Mode>("pixels");
  const [w, setW] = useState("");
  const [h, setH] = useState("");
  const [percent, setPercent] = useState("50");
  const [lock, setLock] = useState(true);

  const image = source.image;
  useEffect(() => {
    if (image) {
      setW(String(image.width));
      setH(String(image.height));
    }
  }, [image]);

  const ratio = image ? image.height / image.width : 1;
  const onW = (v: string) => {
    setW(v);
    const n = parseNumber(v);
    if (lock && n !== null) setH(String(Math.max(1, Math.round(n * ratio))));
  };
  const onH = (v: string) => {
    setH(v);
    const n = parseNumber(v);
    if (lock && n !== null) setW(String(Math.max(1, Math.round(n / ratio))));
  };

  let target: { width: number; height: number } | null = null;
  let error: string | null = null;
  if (image) {
    if (mode === "percent") {
      const p = parseNumber(percent);
      if (p === null || p <= 0 || p > 1000) error = "Enter a percentage between 1 and 1000.";
      else target = { width: Math.max(1, Math.round((image.width * p) / 100)), height: Math.max(1, Math.round((image.height * p) / 100)) };
    } else {
      const wn = parseNumber(w);
      const hn = parseNumber(h);
      if (wn === null || hn === null || !Number.isInteger(wn) || !Number.isInteger(hn) || wn < 1 || hn < 1 || wn > 20000 || hn > 20000) {
        error = "Enter whole numbers from 1 to 20000 for width and height.";
      } else target = { width: wn, height: hn };
    }
    if (target && target.width * target.height > MAX_PIXELS) {
      error = "That size is too large for your browser. Choose smaller dimensions.";
      target = null;
    }
  }

  return (
    <ToolPanel>
      <div className="space-y-5">
        <ImageSource source={source} rule={IMAGE_RULE} />
        {source.file && image && (
          <>
            <Segmented
              label="Resize by"
              value={mode}
              onChange={setMode}
              options={[
                { value: "pixels", label: "Pixels" },
                { value: "percent", label: "Percent" },
              ]}
            />
            {mode === "pixels" ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Width (px)" htmlFor="rs-w">
                    <NumberInput id="rs-w" min="1" value={w} onChange={(e) => onW(e.target.value)} />
                  </Field>
                  <Field label="Height (px)" htmlFor="rs-h">
                    <NumberInput id="rs-h" min="1" value={h} onChange={(e) => onH(e.target.value)} />
                  </Field>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                  Keep proportions
                </label>
              </>
            ) : (
              <Field label="Scale (%)" htmlFor="rs-pct">
                <NumberInput id="rs-pct" min="1" value={percent} onChange={(e) => setPercent(e.target.value)} />
              </Field>
            )}
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            {target && <p className="text-sm text-muted-foreground">New size: {target.width} x {target.height} px</p>}
          </>
        )}
      </div>
      <div className="space-y-4">
        <Button
          disabled={!source.file || !target || state.status === "working"}
          onClick={() =>
            run(async (report) => {
              report(0.4, "Resizing...");
              const type = sameTypeAs(source.file!);
              const blob = await renderImage(source.image!, { type, quality: 0.92, width: target!.width, height: target!.height });
              return {
                outputs: [{ name: `${baseName(source.file!.name)}-${target!.width}x${target!.height}.${extFor(type)}`, blob }],
                note: `Resized to ${target!.width} x ${target!.height} px.`,
              };
            })
          }
        >
          Resize image
        </Button>
        <JobStatus state={state} onReset={reset} />
        {!source.file && <p className="text-sm text-muted-foreground">Choose an image to resize.</p>}
      </div>
    </ToolPanel>
  );
}
