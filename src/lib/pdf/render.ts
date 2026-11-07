import { PDFDocument } from "pdf-lib";
import { UserError } from "@/lib/errors";

// Client-only: load pdf.js lazily (the legacy build works in older browsers too).
async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
  }
  return pdfjs;
}

const MAX_RENDER_PIXELS = 40_000_000;

export interface RenderedPage {
  pageNumber: number;
  blob: Blob;
  /** original page size in PDF points */
  widthPt: number;
  heightPt: number;
}

export async function renderPdfPages(
  data: ArrayBuffer,
  o: { dpi: number; type: "image/png" | "image/jpeg"; quality?: number; pages?: number[] },
  onProgress?: (done: number, total: number) => void,
): Promise<RenderedPage[]> {
  const pdfjs = await loadPdfjs();
  let doc;
  try {
    doc = await pdfjs.getDocument({ data: new Uint8Array(data) }).promise;
  } catch (e) {
    if (e instanceof Error && e.name === "PasswordException") {
      throw new UserError("This PDF is password-protected. Remove the password first, then try again.");
    }
    throw new UserError("This file could not be read as a PDF. It may be damaged.");
  }

  try {
    const numbers = o.pages ?? Array.from({ length: doc.numPages }, (_, i) => i + 1);
    const results: RenderedPage[] = [];
    for (let i = 0; i < numbers.length; i++) {
      const page = await doc.getPage(numbers[i]);
      const base = page.getViewport({ scale: 1 });
      let scale = o.dpi / 72;
      if (base.width * base.height * scale * scale > MAX_RENDER_PIXELS) {
        scale = Math.sqrt(MAX_RENDER_PIXELS / (base.width * base.height));
      }
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new UserError("Your browser could not create a drawing surface.");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, viewport }).promise;
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, o.type, o.quality));
      canvas.width = 0;
      canvas.height = 0;
      page.cleanup();
      if (!blob) throw new UserError("Could not create an image for one of the pages.");
      results.push({ pageNumber: numbers[i], blob, widthPt: base.width, heightPt: base.height });
      onProgress?.(i + 1, numbers.length);
    }
    return results;
  } finally {
    await doc.destroy();
  }
}

/** Strong compression: renders each page to a JPEG and rebuilds the PDF. Text is no longer selectable. */
export async function compressByRasterizing(
  data: ArrayBuffer,
  o: { dpi: number; quality: number },
  onProgress?: (done: number, total: number) => void,
): Promise<Uint8Array> {
  const pages = await renderPdfPages(data, { dpi: o.dpi, type: "image/jpeg", quality: o.quality }, onProgress);
  const out = await PDFDocument.create();
  for (const p of pages) {
    const jpg = await out.embedJpg(new Uint8Array(await p.blob.arrayBuffer()));
    out.addPage([p.widthPt, p.heightPt]).drawImage(jpg, { x: 0, y: 0, width: p.widthPt, height: p.heightPt });
  }
  return out.save();
}
