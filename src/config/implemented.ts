/** Tools that have a working interface. Keep in sync with tool-renderer.tsx (enforced by its types). */
export const implementedSlugs = [
  // calculators
  "age-calculator",
  "percentage-calculator",
  "emi-calculator",
  "gst-calculator",
  "discount-calculator",
  "bmi-calculator",
  "unit-converter",
  // PDF tools
  "merge-pdf",
  "split-pdf",
  "compress-pdf",
  "pdf-to-images",
  "images-to-pdf",
  "extract-pdf-pages",
  "rotate-pdf",
  // productivity tools
  "todo-list",
  "notes-manager",
  "pomodoro-timer",
  "daily-planner",
  "habit-tracker",
  "password-generator",
  // AI tools
  "ai-summarizer",
  "ai-email-writer",
  "ai-grammar-checker",
  "ai-text-rewriter",
  "ai-notes-generator",
  "ai-explainer",
  // image tools
  "image-compressor",
  "image-resizer",
  "jpg-to-png",
  "png-to-jpg",
  "image-cropper",
  "qr-generator",
  "color-palette-generator",
] as const;

export type ImplementedSlug = (typeof implementedSlugs)[number];

export const isImplemented = (slug: string): slug is ImplementedSlug =>
  (implementedSlugs as readonly string[]).includes(slug);
