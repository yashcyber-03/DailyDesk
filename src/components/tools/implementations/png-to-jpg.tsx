"use client";

import { ImageConverter } from "@/components/tools/implementations/image-converter";
import { PNG_RULE } from "@/config/limits";

export default function PngToJpg() {
  return <ImageConverter rule={PNG_RULE} to="image/jpeg" id="png2jpg" />;
}
