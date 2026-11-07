"use client";

import { ChevronDown, ChevronUp, Image as ImageIcon, X } from "lucide-react";
import { useRef, useState } from "react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { JobStatus } from "@/components/tools/job-ui";
import { Field, Segmented, ToolPanel } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { IMAGE_RULE, MAX_IMAGE_FILES } from "@/config/limits";
import { useJob } from "@/hooks/use-job";
import { bytesToBlob, formatBytes } from "@/lib/files";
import { loadImage, renderImage } from "@/lib/image-ops";
import { imagesToPdf, type PageSize, type PdfImage } from "@/lib/pdf/ops";

interface Item {
  id: number;
  file: File;
}

export default function ImagesToPdf() {
  const [items, setItems] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [margin, setMargin] = useState<"0" | "24">("24");
  const nextId = useRef(1);
  const { state, run, reset } = useJob();
  const working = state.status === "working";

  const add = (files: File[]) => {
    reset();
    setItems((prev) => [...prev, ...files.slice(0, Math.max(0, MAX_IMAGE_FILES - prev.length)).map((file) => ({ id: nextId.current++, file }))]);
  };
  const move = (index: number, dir: -1 | 1) =>
    setItems((prev) => {
      const j = index + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[j]] = [copy[j], copy[index]];
      return copy;
    });

  return (
    <ToolPanel>
      <div className="space-y-5">
        <FileDropzone rule={IMAGE_RULE} multiple maxFiles={MAX_IMAGE_FILES} disabled={working} onFiles={add} />
        <Field label="Page size" htmlFor="i2p-size">
          <Select id="i2p-size" value={pageSize} onChange={(e) => setPageSize(e.target.value as PageSize)}>
            <option value="a4">A4</option>
            <option value="letter">US Letter</option>
            <option value="fit">Same size as each image</option>
          </Select>
        </Field>
        {pageSize !== "fit" && (
          <Segmented
            label="Margin"
            value={margin}
            onChange={setMargin}
            options={[
              { value: "24", label: "Small margin" },
              { value: "0", label: "No margin" },
            ]}
          />
        )}
      </div>
      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add images. Each one becomes a page, in the order shown.</p>
        ) : (
          <>
            <ol className="divide-y rounded-lg border">
              {items.map((item, i) => (
                <li key={item.id} className="flex items-center gap-2 p-3">
                  <ImageIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{i + 1}. {item.file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(item.file.size)}</p>
                  </div>
                  <Button variant="ghost" size="icon" aria-label={`Move ${item.file.name} up`} disabled={i === 0 || working} onClick={() => move(i, -1)}>
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label={`Move ${item.file.name} down`} disabled={i === items.length - 1 || working} onClick={() => move(i, 1)}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label={`Remove ${item.file.name}`} disabled={working} onClick={() => setItems((p) => p.filter((x) => x.id !== item.id))}>
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ol>
            <Button
              disabled={working}
              onClick={() =>
                run(async (report) => {
                  const prepared: PdfImage[] = [];
                  for (let i = 0; i < items.length; i++) {
                    report(i / items.length, `Preparing image ${i + 1} of ${items.length}...`);
                    const file = items[i].file;
                    const img = await loadImage(file);
                    try {
                      // Re-drawing on a canvas applies the photo's rotation (EXIF) and normalizes unusual formats.
                      const asJpeg = file.type === "image/jpeg";
                      const blob = await renderImage(img, {
                        type: asJpeg ? "image/jpeg" : "image/png",
                        quality: 0.92,
                        width: img.width,
                        height: img.height,
                      });
                      prepared.push({ bytes: new Uint8Array(await blob.arrayBuffer()), kind: asJpeg ? "jpg" : "png" });
                    } finally {
                      img.bitmap.close();
                    }
                  }
                  const bytes = await imagesToPdf(prepared, { pageSize, margin: Number(margin) }, (d, t) => report(d / t, `Adding page ${d} of ${t}...`));
                  return { outputs: [{ name: "images.pdf", blob: bytesToBlob(bytes, "application/pdf") }], note: `Created a PDF with ${prepared.length} pages.` };
                })
              }
            >
              Create PDF from {items.length} {items.length === 1 ? "image" : "images"}
            </Button>
          </>
        )}
        <JobStatus state={state} onReset={reset} />
      </div>
    </ToolPanel>
  );
}
