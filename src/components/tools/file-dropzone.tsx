"use client";

import { UploadCloud } from "lucide-react";
import { useId, useState } from "react";
import { validateFile, type FileRule, formatBytes } from "@/lib/files";
import { cn } from "@/lib/utils";

interface Props {
  rule: FileRule;
  multiple?: boolean;
  maxFiles?: number;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
}

export function FileDropzone({ rule, multiple = false, maxFiles = 50, disabled, onFiles }: Props) {
  const id = useId();
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const accept = [...rule.extensions.map((e) => `.${e}`), ...rule.mimeTypes].join(",");

  function handle(list: FileList | null) {
    if (!list || list.length === 0) return;
    const accepted: File[] = [];
    const errs: string[] = [];
    for (const file of Array.from(list)) {
      const err = validateFile(file, rule);
      if (err) errs.push(`${file.name}: ${err}`);
      else accepted.push(file);
    }
    let final = accepted;
    if (!multiple && final.length > 1) {
      final = final.slice(0, 1);
      errs.push("Only one file can be used here. The first file was kept.");
    }
    if (final.length > maxFiles) {
      final = final.slice(0, maxFiles);
      errs.push(`Only the first ${maxFiles} files were kept.`);
    }
    setErrors(errs);
    if (final.length > 0) onFiles(final);
  }

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="peer sr-only"
          onChange={(e) => {
            handle(e.target.files);
            e.target.value = "";
          }}
        />
        <label
          htmlFor={id}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!disabled) handle(e.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors hover:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
            dragging && "border-primary bg-accent",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <UploadCloud className="h-7 w-7 text-primary" aria-hidden="true" />
          <span className="font-medium">{multiple ? "Choose files or drop them here" : "Choose a file or drop it here"}</span>
          <span className="text-xs text-muted-foreground">
            {rule.label}, up to {formatBytes(rule.maxBytes)} each. Files stay in your browser and are not uploaded.
          </span>
        </label>
      </div>
      {errors.length > 0 && (
        <ul role="alert" className="mt-3 space-y-1 text-sm text-destructive">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
