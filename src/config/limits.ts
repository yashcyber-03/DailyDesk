import type { FileRule } from "@/lib/files";

const MB = 1024 * 1024;

export const PDF_RULE: FileRule = {
  mimeTypes: ["application/pdf"],
  extensions: ["pdf"],
  maxBytes: 50 * MB,
  label: "PDF",
};

export const IMAGE_RULE: FileRule = {
  mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp"],
  extensions: ["jpg", "jpeg", "png", "webp", "gif", "bmp"],
  maxBytes: 25 * MB,
  label: "JPG, PNG, WebP, GIF or BMP image",
};

export const JPG_RULE: FileRule = { mimeTypes: ["image/jpeg"], extensions: ["jpg", "jpeg"], maxBytes: 25 * MB, label: "JPG" };
export const PNG_RULE: FileRule = { mimeTypes: ["image/png"], extensions: ["png"], maxBytes: 25 * MB, label: "PNG" };

export const MAX_PDF_FILES = 20;
export const MAX_IMAGE_FILES = 40;
export const MAX_OUTPUT_FILES = 300;
