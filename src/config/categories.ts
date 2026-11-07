import { Calculator, CheckSquare, FileText, Image as ImageIcon, Sparkles } from "lucide-react";
import type { Category } from "@/types/tool";

export const categories: Category[] = [
  {
    slug: "pdf-tools",
    name: "PDF Tools",
    description: "Merge, split, compress, rotate and convert PDFs right in your browser.",
    icon: FileText,
    href: "/pdf-tools",
  },
  {
    slug: "image-tools",
    name: "Image Tools",
    description: "Compress, resize, convert and crop images, plus QR codes and color palettes.",
    icon: ImageIcon,
    href: "/image-tools",
  },
  {
    slug: "ai-tools",
    name: "AI Tools",
    description: "Summarize, rewrite, explain and write with Gemini-powered assistants.",
    icon: Sparkles,
    href: "/ai-tools",
  },
  {
    slug: "calculators",
    name: "Calculators",
    description: "EMI, GST, BMI, age, percentage, discount and unit conversions.",
    icon: Calculator,
    href: "/calculators",
  },
  {
    slug: "productivity",
    name: "Productivity",
    description: "To-dos, notes, Pomodoro timer, planner, habit tracker and passwords.",
    icon: CheckSquare,
    href: "/productivity",
  },
];
