"use client";

import { FileText } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { ErrorMessage } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { PDF_RULE } from "@/config/limits";
import type { ImageFileState } from "@/hooks/use-image-file";
import type { PdfFileState } from "@/hooks/use-pdf-file";
import { formatBytes, type FileRule } from "@/lib/files";

export function PdfSource({ source }: { source: PdfFileState }) {
  if (!source.file) {
    return (
      <div className="space-y-3">
        <FileDropzone rule={PDF_RULE} disabled={source.loading} onFiles={(f) => source.select(f[0])} />
        {source.loading && <p className="text-sm text-muted-foreground">Reading PDF...</p>}
        {source.error && <ErrorMessage>{source.error}</ErrorMessage>}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{source.file.name}</p>
        <p className="text-xs text-muted-foreground">
          {source.pageCount} {source.pageCount === 1 ? "page" : "pages"} - {formatBytes(source.file.size)}
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={() => source.select(null)}>Change</Button>
    </div>
  );
}

export function ImageSource({ source, rule }: { source: ImageFileState; rule: FileRule }) {
  if (!source.file || !source.image) {
    return (
      <div className="space-y-3">
        <FileDropzone rule={rule} onFiles={(f) => source.select(f[0])} />
        {source.error && <ErrorMessage>{source.error}</ErrorMessage>}
      </div>
    );
  }
  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{source.file.name}</p>
          <p className="text-xs text-muted-foreground">
            {source.image.width} x {source.image.height} px - {formatBytes(source.file.size)}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => source.select(null)}>Change</Button>
      </div>
      {source.previewUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={source.previewUrl} alt="Preview of the selected image" className="max-h-56 rounded-md object-contain" />
        </>
      )}
    </div>
  );
}
