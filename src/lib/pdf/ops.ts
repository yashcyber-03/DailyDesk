import { PDFDocument, degrees } from "pdf-lib";
import { UserError } from "../errors.ts";

export async function loadPdf(data: ArrayBuffer | Uint8Array): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(data);
  } catch (e) {
    if (e instanceof Error && /encrypt/i.test(e.message)) {
      throw new UserError("This PDF is password-protected. Remove the password first, then try again.");
    }
    throw new UserError("This file could not be read as a PDF. It may be damaged.");
  }
}

export async function getPageCount(data: ArrayBuffer | Uint8Array): Promise<number> {
  return (await loadPdf(data)).getPageCount();
}

type Progress = (done: number, total: number) => void;

export async function mergePdfs(buffers: (ArrayBuffer | Uint8Array)[], onProgress?: Progress): Promise<Uint8Array> {
  const out = await PDFDocument.create();
  for (let i = 0; i < buffers.length; i++) {
    const src = await loadPdf(buffers[i]);
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
    onProgress?.(i + 1, buffers.length);
  }
  return out.save();
}

/** pages are 1-based and keep the given order */
export async function extractPages(data: ArrayBuffer | Uint8Array, pages: number[]): Promise<Uint8Array> {
  const src = await loadPdf(data);
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, pages.map((p) => p - 1));
  copied.forEach((p) => out.addPage(p));
  return out.save();
}

export async function splitPdf(data: ArrayBuffer | Uint8Array, groups: number[][], onProgress?: Progress): Promise<Uint8Array[]> {
  const src = await loadPdf(data);
  const results: Uint8Array[] = [];
  for (let i = 0; i < groups.length; i++) {
    const out = await PDFDocument.create();
    const copied = await out.copyPages(src, groups[i].map((p) => p - 1));
    copied.forEach((p) => out.addPage(p));
    results.push(await out.save());
    onProgress?.(i + 1, groups.length);
  }
  return results;
}

/** angle: 90, 180 or 270 (clockwise). pages: 1-based; omit for all pages. */
export async function rotatePdf(data: ArrayBuffer | Uint8Array, angle: 90 | 180 | 270, pages?: number[]): Promise<Uint8Array> {
  const doc = await loadPdf(data);
  const all = doc.getPages();
  const targets = pages ? pages.map((p) => p - 1) : all.map((_, i) => i);
  for (const i of targets) {
    const page = all[i];
    page.setRotation(degrees((page.getRotation().angle + angle) % 360));
  }
  return doc.save();
}

/** Re-saves with compact object streams. Keeps text and quality; savings are often small. */
export async function compressLight(data: ArrayBuffer | Uint8Array): Promise<Uint8Array> {
  const doc = await loadPdf(data);
  return doc.save({ useObjectStreams: true });
}

export interface PdfImage {
  bytes: Uint8Array;
  kind: "jpg" | "png";
}
export type PageSize = "fit" | "a4" | "letter";

const SIZES = { a4: [595.28, 841.89], letter: [612, 792] } as const;

export async function imagesToPdf(images: PdfImage[], opts: { pageSize: PageSize; margin: number }, onProgress?: Progress): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const embedded = img.kind === "jpg" ? await doc.embedJpg(img.bytes) : await doc.embedPng(img.bytes);
    const iw = embedded.width;
    const ih = embedded.height;

    if (opts.pageSize === "fit") {
      const w = Math.min(Math.max(iw * 0.75, 1), 14400);
      const h = Math.min(Math.max(ih * 0.75, 1), 14400);
      doc.addPage([w, h]).drawImage(embedded, { x: 0, y: 0, width: w, height: h });
    } else {
      let pw: number = SIZES[opts.pageSize][0];
      let ph: number = SIZES[opts.pageSize][1];
      if (iw > ih) [pw, ph] = [ph, pw];
      const page = doc.addPage([pw, ph]);
      const availW = pw - opts.margin * 2;
      const availH = ph - opts.margin * 2;
      const scale = Math.min(availW / iw, availH / ih);
      const w = iw * scale;
      const h = ih * scale;
      page.drawImage(embedded, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
    }
    onProgress?.(i + 1, images.length);
  }
  return doc.save();
}
