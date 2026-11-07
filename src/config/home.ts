import { Gauge, Layers, ShieldCheck, Wallet } from "lucide-react";

export const whyChoose = [
  { icon: Layers, title: "Everything in one place", text: "PDF, image, calculator and productivity tools under one roof, with one search." },
  { icon: ShieldCheck, title: "Privacy-minded by design", text: "Tools run in your browser, so your files and saved productivity data stay on your device." },
  { icon: Gauge, title: "Fast and focused", text: "Clean pages with no clutter, so you can finish the task and move on." },
  { icon: Wallet, title: "Free to use", text: "All available tools are free. There are no accounts or paid plans." },
] as const;

// Clearly identified sample content, not real user reviews.
export const sampleTestimonials = [
  { quote: "Sample text: a single place for the small tasks that come up every day would save me a lot of tab-hopping.", who: "Sample persona: Student" },
  { quote: "Sample text: quick calculators and a clean PDF toolset are what I would want while freelancing.", who: "Sample persona: Freelancer" },
  { quote: "Sample text: a simple, fast interface matters more to me than a long feature list.", who: "Sample persona: Small business owner" },
] as const;

export const faqs = [
  { q: "Is DailyDesk free to use?", a: "Yes. All available tools are free to use. There are no paid plans." },
  { q: "Do I need an account?", a: "No. The website and its tools are available without signing in. Notes, tasks, favourites and other saved data stay in this browser." },
  { q: "Are my files uploaded to a server?", a: "PDF and image tools process files in your browser. Saved productivity data is stored locally in your browser." },
  { q: "Which tools are available right now?", a: "The directory lists all planned tools. Their working interfaces are being added step by step, and each tool page shows whether it is ready." },
] as const;
