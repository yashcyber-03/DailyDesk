"use client";

import { useRef, useState, type PointerEvent } from "react";
import { JobStatus } from "@/components/tools/job-ui";
import { ImageSource } from "@/components/tools/sources";
import { Field, NumberInput, Segmented, ToolPanel } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { IMAGE_RULE } from "@/config/limits";
import { useImageFile } from "@/hooks/use-image-file";
import { useJob } from "@/hooks/use-job";
import { baseName } from "@/lib/files";
import { parseNumber } from "@/lib/format";
import { extFor, renderImage, sameTypeAs } from "@/lib/image-ops";

interface Sel { x: number; y: number; w: number; h: number }
type Aspect = "free" | "1:1" | "4:3" | "16:9";
const ratios: Record<Aspect, number | null> = { free: null, "1:1": 1, "4:3": 4 / 3, "16:9": 16 / 9 };
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export default function ImageCropper() {
  const source = useImageFile();
  const { state, run, reset } = useJob();
  const [sel, setSel] = useState<Sel | null>(null);
  const [aspect, setAspect] = useState<Aspect>("free");
  const imgRef = useRef<HTMLImageElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);

  const image = source.image;
  const W = image?.width ?? 1;
  const H = image?.height ?? 1;
  const ratio = ratios[aspect];

  function pointFrom(e: PointerEvent) {
    const rect = imgRef.current!.getBoundingClientRect();
    return {
      x: clamp(((e.clientX - rect.left) / rect.width) * W, 0, W),
      y: clamp(((e.clientY - rect.top) / rect.height) * H, 0, H),
    };
  }

  function onDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = pointFrom(e);
    setSel({ x: start.current.x, y: start.current.y, w: 0, h: 0 });
    reset();
  }

  function onMove(e: PointerEvent<HTMLDivElement>) {
    const s = start.current;
    if (!s) return;
    const p = pointFrom(e);
    const dx = p.x - s.x;
    const dy = p.y - s.y;
    let width = Math.abs(dx);
    let height = Math.abs(dy);
    if (ratio) {
      const availW = dx >= 0 ? W - s.x : s.x;
      const availH = dy >= 0 ? H - s.y : s.y;
      width = Math.min(Math.max(width, height * ratio), availW, availH * ratio);
      height = width / ratio;
    }
    setSel({ x: dx >= 0 ? s.x : s.x - width, y: dy >= 0 ? s.y : s.y - height, w: width, h: height });
  }

  function onUp() {
    start.current = null;
    setSel((cur) => (cur && cur.w >= 2 && cur.h >= 2 ? cur : null));
  }

  function edit(field: keyof Sel, value: string) {
    const n = parseNumber(value);
    if (n === null || !sel) return;
    let next = { ...sel, [field]: Math.round(n) };
    if (ratio && field === "w") next.h = Math.round(next.w / ratio);
    if (ratio && field === "h") next.w = Math.round(next.h * ratio);
    next = {
      x: clamp(next.x, 0, W - 1),
      y: clamp(next.y, 0, H - 1),
      w: clamp(next.w, 1, W),
      h: clamp(next.h, 1, H),
    };
    next.w = Math.min(next.w, W - next.x);
    next.h = Math.min(next.h, H - next.y);
    setSel(next);
  }

  const rounded = sel && sel.w >= 1 && sel.h >= 1 ? { x: Math.round(sel.x), y: Math.round(sel.y), w: Math.round(sel.w), h: Math.round(sel.h) } : null;

  return (
    <ToolPanel>
      <div className="space-y-4">
        {!source.file || !image ? (
          <ImageSource source={source} rule={IMAGE_RULE} />
        ) : (
          <>
            <div
              className="relative inline-block max-w-full touch-none select-none overflow-hidden rounded-lg border"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              role="application"
              aria-label="Drag on the image to select the area to keep. You can also type exact values below."
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img ref={imgRef} src={source.previewUrl ?? ""} alt="Image to crop" draggable={false} className="block max-h-[28rem] max-w-full" />
              {rounded && (
                <div
                  className="pointer-events-none absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
                  style={{ left: `${(rounded.x / W) * 100}%`, top: `${(rounded.y / H) * 100}%`, width: `${(rounded.w / W) * 100}%`, height: `${(rounded.h / H) * 100}%` }}
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {source.file.name} - {W} x {H} px. Drag on the image to choose the area to keep.
            </p>
            <Button variant="ghost" size="sm" onClick={() => { source.select(null); setSel(null); reset(); }}>Choose another image</Button>
          </>
        )}
      </div>
      <div className="space-y-5">
        {source.file && image && (
          <>
            <Segmented label="Shape" value={aspect} onChange={setAspect} options={[
              { value: "free", label: "Free" },
              { value: "1:1", label: "1:1" },
              { value: "4:3", label: "4:3" },
              { value: "16:9", label: "16:9" },
            ]} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Left (px)" htmlFor="crop-x"><NumberInput id="crop-x" disabled={!rounded} value={rounded?.x ?? ""} onChange={(e) => edit("x", e.target.value)} /></Field>
              <Field label="Top (px)" htmlFor="crop-y"><NumberInput id="crop-y" disabled={!rounded} value={rounded?.y ?? ""} onChange={(e) => edit("y", e.target.value)} /></Field>
              <Field label="Width (px)" htmlFor="crop-w"><NumberInput id="crop-w" disabled={!rounded} value={rounded?.w ?? ""} onChange={(e) => edit("w", e.target.value)} /></Field>
              <Field label="Height (px)" htmlFor="crop-h"><NumberInput id="crop-h" disabled={!rounded} value={rounded?.h ?? ""} onChange={(e) => edit("h", e.target.value)} /></Field>
            </div>
            <Button
              disabled={!rounded || state.status === "working"}
              onClick={() =>
                run(async (report) => {
                  report(0.4, "Cropping...");
                  const c = rounded!;
                  const type = sameTypeAs(source.file!);
                  const blob = await renderImage(source.image!, { type, quality: 0.92, width: c.w, height: c.h, crop: c });
                  return { outputs: [{ name: `${baseName(source.file!.name)}-cropped.${extFor(type)}`, blob }], note: `Cropped to ${c.w} x ${c.h} px.` };
                })
              }
            >
              Crop image
            </Button>
          </>
        )}
        {!source.file && <p className="text-sm text-muted-foreground">Choose an image, then drag to select the area to keep.</p>}
        <JobStatus state={state} onReset={reset} />
      </div>
    </ToolPanel>
  );
}
