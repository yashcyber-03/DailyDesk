"use client";

import { useCallback, useEffect, useState } from "react";
import { UserError } from "@/lib/errors";
import { loadImage, type LoadedImage } from "@/lib/image-ops";

export function useImageFile() {
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => (previewUrl ? URL.revokeObjectURL(previewUrl) : undefined), [previewUrl]);
  useEffect(() => () => image?.bitmap.close(), [image]);

  const select = useCallback(async (next: File | null) => {
    setFile(null);
    setImage(null);
    setPreviewUrl(null);
    setError(null);
    if (!next) return;
    try {
      const loaded = await loadImage(next);
      setImage(loaded);
      setFile(next);
      setPreviewUrl(URL.createObjectURL(next));
    } catch (e) {
      setError(e instanceof UserError ? e.message : "Could not open this image.");
    }
  }, []);

  return { file, image, previewUrl, error, select };
}
export type ImageFileState = ReturnType<typeof useImageFile>;
