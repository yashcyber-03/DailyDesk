"use client";

import { ImageConverter } from "@/components/tools/implementations/image-converter";
import { JPG_RULE } from "@/config/limits";

export default function JpgToPng() {
  return <ImageConverter rule={JPG_RULE} to="image/png" id="jpg2png" />;
}
