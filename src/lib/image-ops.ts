import { UserError } from "@/lib/errors";

export type OutType = "image/jpeg" | "image/png" | "image/webp";
export const MAX_PIXELS = 100_000_000;

export const extFor = (t: OutType) => (t === "image/jpeg" ? "jpg" : t === "image/png" ? "png" : "webp");

export interface LoadedImage {
  bitmap: ImageBitmap;
  width: number;
  height: number;
}

export async function loadImage(file: Blob): Promise<LoadedImage> {
  try {
    const bitmap = await createImageBitmap(file);
    return { bitmap, width: bitmap.width, height: bitmap.height };
  } catch {
    throw new UserError("This image could not be opened. It may be damaged or in an unsupported format.");
  }
}

export interface RenderOptions {
  type: OutType;
  /** 0 to 1, used for JPEG and WebP */
  quality?: number;
  width: number;
  height: number;
  /** source rectangle in original pixels */
  crop?: { x: number; y: number; w: number; h: number };
  /** fill colour behind transparent areas. JPEG always gets one (white by default). */
  background?: string;
}

export async function renderImage(img: LoadedImage, o: RenderOptions): Promise<Blob> {
  const w = Math.round(o.width);
  const h = Math.round(o.height);
  if (!(w >= 1 && h >= 1)) throw new UserError("Width and height must be at least 1 pixel.");
  if (w * h > MAX_PIXELS) throw new UserError("The resulting image is too large for your browser. Choose a smaller size.");

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new UserError("Your browser could not create a drawing surface.");

  if (o.type === "image/jpeg" || o.background) {
    ctx.fillStyle = o.background ?? "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const c = o.crop ?? { x: 0, y: 0, w: img.width, h: img.height };
  ctx.drawImage(img.bitmap, c.x, c.y, c.w, c.h, 0, 0, w, h);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, o.type, o.quality));
  canvas.width = 0;
  canvas.height = 0;
  if (!blob) throw new UserError("Could not create the output image.");
  if (blob.type !== o.type) throw new UserError(`Your browser cannot export ${extFor(o.type).toUpperCase()} images. Try another format.`);
  return blob;
}

/** Output type that matches the input where possible (JPEG, PNG, WebP), otherwise PNG. */
export function sameTypeAs(file: { type: string }): OutType {
  return file.type === "image/jpeg" || file.type === "image/webp" ? (file.type as OutType) : "image/png";
}
