"use client";

import { ChevronDown, ChevronUp, FileText, X } from "lucide-react";
import { useRef, useState } from "react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { JobStatus } from "@/components/tools/job-ui";
import { ErrorMessage, ToolPanel } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { MAX_PDF_FILES, PDF_RULE } from "@/config/limits";
import { useJob } from "@/hooks/use-job";
import { UserError } from "@/lib/errors";
import { bytesToBlob, formatBytes } from "@/lib/files";
import { getPageCount, mergePdfs } from "@/lib/pdf/ops";

interface Item {
  id: number;
  file: File;
  pages: number;
}

export default function MergePdf() {
  const [items, setItems] = useState<Item[]>([]);
  const [notices, setNotices] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const nextId = useRef(1);
  const { state, run, reset } = useJob();

  async function add(files: File[]) {
    setAdding(true);
    reset();
    const errs: string[] = [];
    const added: Item[] = [];
    for (const file of files) {
      if (items.length + added.length >= MAX_PDF_FILES) {
        errs.push(`You can merge up to ${MAX_PDF_FILES} files at once.`);
        break;
      }
      try {
        const pages = await getPageCount(await file.arrayBuffer());
        added.push({ id: nextId.current++, file, pages });
      } catch (e) {
        errs.push(`${file.name}: ${e instanceof UserError ? e.message : "Could not read this PDF."}`);
      }
    }
    setItems((prev) => [...prev, ...added]);
    setNotices(errs);
    setAdding(false);
  }

  const move = (index: number, dir: -1 | 1) =>
    setItems((prev) => {
      const j = index + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[j]] = [copy[j], copy[index]];
      return copy;
    });

  const totalPages = items.reduce((s, i) => s + i.pages, 0);
  const working = state.status === "working";

  return (
    <ToolPanel>
      <div className="space-y-4">
        <FileDropzone rule={PDF_RULE} multiple maxFiles={MAX_PDF_FILES} disabled={adding || working} onFiles={add} />
        {adding && <p className="text-sm text-muted-foreground">Reading PDFs...</p>}
        {notices.length > 0 && (
          <ul role="alert" className="space-y-1 text-sm text-destructive">
            {notices.map((n) => <li key={n}>{n}</li>)}
          </ul>
        )}
      </div>
      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add at least two PDFs. You can reorder them before merging.</p>
        ) : (
          <>
            <ol className="divide-y rounded-lg border">
              {items.map((item, i) => (
                <li key={item.id} className="flex items-center gap-2 p-3">
                  <FileText className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{i + 1}. {item.file.name}</p>
                    <p className="text-xs text-muted-foreground">{item.pages} pages - {formatBytes(item.file.size)}</p>
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
            {items.length < 2 && <ErrorMessage>Add one more PDF to merge.</ErrorMessage>}
            <Button
              disabled={items.length < 2 || working}
              onClick={() =>
                run(async (report) => {
                  const buffers: ArrayBuffer[] = [];
                  for (const item of items) buffers.push(await item.file.arrayBuffer());
                  const bytes = await mergePdfs(buffers, (d, t) => report(d / t, `Merging file ${d} of ${t}...`));
                  return { outputs: [{ name: "merged.pdf", blob: bytesToBlob(bytes, "application/pdf") }], note: `Merged ${items.length} files into ${totalPages} pages.` };
                })
              }
            >
              Merge {items.length} PDFs
            </Button>
          </>
        )}
        <JobStatus state={state} onReset={reset} />
      </div>
    </ToolPanel>
  );
}
