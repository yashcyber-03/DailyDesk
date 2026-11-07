"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { ErrorMessage } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import type { JobOutput, JobState } from "@/hooks/use-job";
import { bytesToBlob, downloadBlob, formatBytes, uniqueNames } from "@/lib/files";
import { createZip } from "@/lib/zip";

function Thumb({ blob, large }: { blob: Blob; large: boolean }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  if (!url) return null;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Result preview" loading="lazy" className={large ? "max-h-64 rounded-md object-contain" : "h-24 w-full rounded-md border object-cover"} />
    </>
  );
}

async function downloadZip(outputs: JobOutput[], zipName: string) {
  const names = uniqueNames(outputs.map((o) => o.name));
  const entries = await Promise.all(
    outputs.map(async (o, i) => ({ name: names[i], data: new Uint8Array(await o.blob.arrayBuffer()) })),
  );
  downloadBlob(bytesToBlob(createZip(entries), "application/zip"), zipName);
}

export function JobStatus({ state, onReset, zipName = "dailydesk-files.zip" }: { state: JobState; onReset: () => void; zipName?: string }) {
  if (state.status === "idle") return null;

  if (state.status === "working") {
    const pct = Math.round(state.progress * 100);
    return (
      <div className="space-y-2" aria-live="polite">
        <p className="text-sm text-muted-foreground">{state.label}</p>
        <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Progress">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="space-y-3">
        <ErrorMessage>{state.message}</ErrorMessage>
        <Button variant="outline" size="sm" onClick={onReset}>Dismiss</Button>
      </div>
    );
  }

  const imageOutputs = state.outputs.filter((o) => o.blob.type.startsWith("image/"));
  return (
    <div className="space-y-4" aria-live="polite">
      {state.note && <p className="text-sm">{state.note}</p>}
      {imageOutputs.length === 1 && state.outputs.length === 1 && <Thumb blob={imageOutputs[0].blob} large />}
      {imageOutputs.length > 1 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {imageOutputs.slice(0, 12).map((o) => (
            <Thumb key={o.name} blob={o.blob} large={false} />
          ))}
        </div>
      )}
      {state.outputs.length > 0 && (
        <ul className="divide-y rounded-lg border text-sm">
          {state.outputs.map((o) => (
            <li key={o.name} className="flex items-center gap-3 p-3">
              <span className="min-w-0 flex-1 truncate">{o.name}</span>
              <span className="text-xs text-muted-foreground">{formatBytes(o.blob.size)}</span>
              <Button size="sm" variant="outline" onClick={() => downloadBlob(o.blob, o.name)} aria-label={`Download ${o.name}`}>
                <Download className="h-4 w-4" /> Download
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        {state.outputs.length > 1 && (
          <Button onClick={() => downloadZip(state.outputs, zipName)}>
            <Download className="h-4 w-4" /> Download all (ZIP)
          </Button>
        )}
        <Button variant="ghost" onClick={onReset}>Start over</Button>
      </div>
    </div>
  );
}
