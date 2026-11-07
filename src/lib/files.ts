export interface FileRule {
  /** accepted MIME types (checked together with extensions, since some browsers leave type empty) */
  mimeTypes: string[];
  /** accepted extensions, lower case, without dot */
  extensions: string[];
  maxBytes: number;
  /** human readable, e.g. "PDF" */
  label: string;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB"];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(v < 10 ? 2 : 1)} ${units[i]}`;
}

export const extensionOf = (name: string) => (name.includes(".") ? name.split(".").pop()!.toLowerCase() : "");
export const baseName = (name: string) => name.replace(/\.[^.]+$/, "") || "file";

/** Returns an error message, or null when the file is acceptable. */
export function validateFile(file: { name: string; type: string; size: number }, rule: FileRule): string | null {
  const okType = rule.mimeTypes.includes(file.type) || rule.extensions.includes(extensionOf(file.name));
  if (!okType) return `Only ${rule.label} files are accepted.`;
  if (file.size === 0) return "This file is empty.";
  if (file.size > rule.maxBytes) return `File is too large (max ${formatBytes(rule.maxBytes)}).`;
  return null;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Makes names unique inside one list: a.pdf, a.pdf -> a.pdf, a-2.pdf */
export function uniqueNames(names: string[]): string[] {
  const seen = new Map<string, number>();
  return names.map((name) => {
    const count = (seen.get(name) ?? 0) + 1;
    seen.set(name, count);
    if (count === 1) return name;
    const dot = name.lastIndexOf(".");
    return dot > 0 ? `${name.slice(0, dot)}-${count}${name.slice(dot)}` : `${name}-${count}`;
  });
}

export function bytesToBlob(bytes: Uint8Array, type: string): Blob {
  return new Blob([bytes as BlobPart], { type });
}
