"use client";

import { useCallback, useState } from "react";
import { UserError } from "@/lib/errors";
import { getPageCount } from "@/lib/pdf/ops";

export function usePdfFile() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const select = useCallback(async (next: File | null) => {
    setFile(null);
    setPageCount(null);
    setError(null);
    if (!next) return;
    setLoading(true);
    try {
      const count = await getPageCount(await next.arrayBuffer());
      setFile(next);
      setPageCount(count);
    } catch (e) {
      setError(e instanceof UserError ? e.message : "Could not read this PDF.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { file, pageCount, error, loading, select };
}
export type PdfFileState = ReturnType<typeof usePdfFile>;
