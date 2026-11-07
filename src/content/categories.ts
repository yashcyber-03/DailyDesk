import type { CategorySlug } from "@/types/tool";

/** Short, original introductions shown on category pages (useful text for visitors and search engines). */
export const categoryIntros: Record<CategorySlug, string[]> = {
  "pdf-tools": [
    "These PDF tools cover the jobs people do most often: joining several files into one, pulling out the pages they need, splitting a long document, turning pages into pictures and shrinking files for email.",
    "Everything runs inside your browser, so your documents are not uploaded to a server. Large files depend on your device's memory, so very big PDFs may take a little longer.",
  ],
  "image-tools": [
    "Resize, compress, crop and convert pictures without installing software. Photos are processed in your browser, and the results can be downloaded straight away.",
    "You will also find a QR code generator for links and text, and a colour palette generator that builds matching colour schemes from a single colour.",
  ],
  calculators: [
    "Quick calculators for money, dates, health and units. Results appear as you type, and each calculator explains the formula or rule behind the number.",
    "They are meant for estimates. For loans, taxes and health decisions, confirm the final figures with your bank, an accountant or a doctor.",
  ],
  productivity: [
    "Simple tools to stay organized: a to-do list, notes, a daily planner, a habit tracker, a Pomodoro focus timer and a secure password generator.",
    "Your notes, tasks, plans and habits are saved only in this browser. They are not synced to an account or another device.",
  ],
};
