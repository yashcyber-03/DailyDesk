import { test } from "node:test";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import { parsePageRanges, parseRangeGroups } from "../src/lib/pdf/ranges.ts";
import { mergePdfs, extractPages, splitPdf, rotatePdf, compressLight, imagesToPdf, getPageCount } from "../src/lib/pdf/ops.ts";
import { createZip, crc32 } from "../src/lib/zip.ts";
import { generatePalette, hexToRgb, hslToHex, normalizeHex, readableTextColor, rgbToHsl, rgbToHex } from "../src/lib/color.ts";
import { validateFile, uniqueNames, formatBytes } from "../src/lib/files.ts";

const PNG_B64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
const JPG_B64 = "/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAUACgDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAUH/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AnAERqAAAAAAAAAAD/9k=";

async function makePdf(pages: number, size: [number, number] = [200, 300]) {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i++) doc.addPage(size);
  return doc.save();
}

test("page ranges", () => {
  const ok = parsePageRanges("1-3, 5", 10);
  assert.ok(ok.ok); assert.deepEqual(ok.pages, [1, 2, 3, 5]);
  const dup = parsePageRanges("2,2,1-2", 5);
  assert.ok(dup.ok); assert.deepEqual(dup.pages, [2, 1]);
  const groups = parseRangeGroups("1-2,4", 5);
  assert.ok(groups.ok); assert.deepEqual(groups.groups, [[1, 2], [4]]);
  for (const bad of ["", "0", "3-1", "a", "1,,2", "1-99", "1-", "-2"]) assert.equal(parsePageRanges(bad, 5).ok, false, bad);
});

test("merge, extract, split, rotate, compress", async () => {
  const a = await makePdf(2);
  const b = await makePdf(3);
  const merged = await mergePdfs([a, b]);
  assert.equal(await getPageCount(merged), 5);

  const extracted = await extractPages(merged, [5, 1]);
  assert.equal(await getPageCount(extracted), 2);

  const parts = await splitPdf(merged, [[1, 2], [3], [4, 5]]);
  assert.deepEqual(await Promise.all(parts.map(getPageCount)), [2, 1, 2]);

  const rotatedAll = await PDFDocument.load(await rotatePdf(merged, 90));
  assert.ok(rotatedAll.getPages().every((p) => p.getRotation().angle === 90));
  const rotatedSome = await PDFDocument.load(await rotatePdf(merged, 270, [2]));
  assert.deepEqual(rotatedSome.getPages().map((p) => p.getRotation().angle), [0, 270, 0, 0, 0]);
  const twice = await PDFDocument.load(await rotatePdf(await rotatePdf(merged, 270), 180));
  assert.equal(twice.getPage(0).getRotation().angle, 90);

  assert.equal(await getPageCount(await compressLight(merged)), 5);
});

test("invalid and non-pdf input gives a friendly error", async () => {
  await assert.rejects(() => getPageCount(new TextEncoder().encode("not a pdf")), /could not be read as a PDF/);
});

test("images to pdf", async () => {
  const png = new Uint8Array(Buffer.from(PNG_B64, "base64"));
  const jpg = new Uint8Array(Buffer.from(JPG_B64, "base64"));
  const fit = await imagesToPdf([{ bytes: png, kind: "png" }, { bytes: jpg, kind: "jpg" }], { pageSize: "fit", margin: 0 });
  assert.equal(await getPageCount(fit), 2);

  const a4 = await PDFDocument.load(await imagesToPdf([{ bytes: jpg, kind: "jpg" }], { pageSize: "a4", margin: 20 }));
  const { width, height } = a4.getPage(0).getSize();
  assert.ok(width > height, "landscape image gives a landscape A4 page");
  assert.ok(Math.abs(width - 841.89) < 0.01 && Math.abs(height - 595.28) < 0.01);
});

test("zip is valid and CRCs match", async () => {
  assert.equal(crc32(new TextEncoder().encode("123456789")), 0xcbf43926);
  const zip = createZip([
    { name: "a.txt", data: new TextEncoder().encode("hello") },
    { name: "folder/ü.pdf", data: new Uint8Array([1, 2, 3, 4]) },
  ]);
  const { writeFileSync } = await import("node:fs");
  writeFileSync("/tmp/dailydesk-test.zip", zip);
});

test("colors", () => {
  assert.equal(normalizeHex("F00"), "#ff0000");
  assert.equal(normalizeHex("zzz"), null);
  assert.deepEqual(hexToRgb("#ff0000"), [255, 0, 0]);
  assert.equal(hslToHex(0, 100, 50), "#ff0000");
  assert.equal(hslToHex(120, 100, 50), "#00ff00");
  assert.deepEqual(generatePalette("#ff0000", "complementary"), ["#ff0000", "#00ffff"]);
  assert.deepEqual(generatePalette("#ff0000", "triadic"), ["#ff0000", "#00ff00", "#0000ff"]);
  assert.equal(generatePalette("#336699", "analogous").length, 5);
  assert.equal(generatePalette("#336699", "monochromatic").length, 5);
  assert.deepEqual(generatePalette("nope", "triadic"), []);
  const [h, s, l] = rgbToHsl([51, 102, 153]);
  assert.equal(rgbToHex([51, 102, 153]), "#336699");
  assert.equal(hslToHex(h, s, l), "#336699");
  assert.equal(readableTextColor("#ffffff"), "#000000");
  assert.equal(readableTextColor("#000000"), "#ffffff");
});

test("file helpers", () => {
  const rule = { mimeTypes: ["application/pdf"], extensions: ["pdf"], maxBytes: 100, label: "PDF" };
  assert.equal(validateFile({ name: "a.pdf", type: "application/pdf", size: 10 }, rule), null);
  assert.equal(validateFile({ name: "a.PDF", type: "", size: 10 }, rule), null);
  assert.match(validateFile({ name: "a.txt", type: "text/plain", size: 10 }, rule)!, /Only PDF/);
  assert.match(validateFile({ name: "a.pdf", type: "application/pdf", size: 1000 }, rule)!, /too large/);
  assert.match(validateFile({ name: "a.pdf", type: "application/pdf", size: 0 }, rule)!, /empty/);
  assert.deepEqual(uniqueNames(["a.pdf", "a.pdf", "b.pdf", "a.pdf"]), ["a.pdf", "a-2.pdf", "b.pdf", "a-3.pdf"]);
  assert.equal(formatBytes(1536), "1.50 KB");
});
