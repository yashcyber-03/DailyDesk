"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { ImplementedSlug } from "@/config/implemented";

const registry: Record<ImplementedSlug, ComponentType> = {
  "age-calculator": dynamic(() => import("./implementations/age-calculator")),
  "percentage-calculator": dynamic(() => import("./implementations/percentage-calculator")),
  "emi-calculator": dynamic(() => import("./implementations/emi-calculator")),
  "gst-calculator": dynamic(() => import("./implementations/gst-calculator")),
  "discount-calculator": dynamic(() => import("./implementations/discount-calculator")),
  "bmi-calculator": dynamic(() => import("./implementations/bmi-calculator")),
  "unit-converter": dynamic(() => import("./implementations/unit-converter")),
  "todo-list": dynamic(() => import("./implementations/todo-list")),
  "notes-manager": dynamic(() => import("./implementations/notes-manager")),
  "pomodoro-timer": dynamic(() => import("./implementations/pomodoro-timer")),
  "daily-planner": dynamic(() => import("./implementations/daily-planner")),
  "habit-tracker": dynamic(() => import("./implementations/habit-tracker")),
  "password-generator": dynamic(() => import("./implementations/password-generator")),
  "ai-summarizer": dynamic(() => import("./implementations/ai-summarizer")),
  "ai-email-writer": dynamic(() => import("./implementations/ai-email-writer")),
  "ai-grammar-checker": dynamic(() => import("./implementations/ai-grammar-checker")),
  "ai-text-rewriter": dynamic(() => import("./implementations/ai-text-rewriter")),
  "ai-notes-generator": dynamic(() => import("./implementations/ai-notes-generator")),
  "ai-explainer": dynamic(() => import("./implementations/ai-explainer")),
  "merge-pdf": dynamic(() => import("./implementations/merge-pdf")),
  "split-pdf": dynamic(() => import("./implementations/split-pdf")),
  "compress-pdf": dynamic(() => import("./implementations/compress-pdf")),
  "pdf-to-images": dynamic(() => import("./implementations/pdf-to-images")),
  "images-to-pdf": dynamic(() => import("./implementations/images-to-pdf")),
  "extract-pdf-pages": dynamic(() => import("./implementations/extract-pdf-pages")),
  "rotate-pdf": dynamic(() => import("./implementations/rotate-pdf")),
  "image-compressor": dynamic(() => import("./implementations/image-compressor")),
  "image-resizer": dynamic(() => import("./implementations/image-resizer")),
  "jpg-to-png": dynamic(() => import("./implementations/jpg-to-png")),
  "png-to-jpg": dynamic(() => import("./implementations/png-to-jpg")),
  "image-cropper": dynamic(() => import("./implementations/image-cropper")),
  "qr-generator": dynamic(() => import("./implementations/qr-generator")),
  "color-palette-generator": dynamic(() => import("./implementations/color-palette-generator")),
};

export function ToolRenderer({ slug }: { slug: ImplementedSlug }) {
  const Component = registry[slug];
  return <Component />;
}
