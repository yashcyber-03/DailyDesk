import { Gauge, Layers, ShieldCheck, Wallet } from "lucide-react";

export const whyChoose = [
  { icon: Layers, title: "Everything in one place", text: "PDF, image, calculator, productivity and AI tools under one roof, with one search." },
  { icon: ShieldCheck, title: "Privacy-minded by design", text: "PDF and image tools are built to run in your browser, so your files are not uploaded to our servers." },
  { icon: Gauge, title: "Fast and focused", text: "Clean pages with no clutter, so you can finish the task and move on." },
  { icon: Wallet, title: "Free to start", text: "Core tools are free to use. Optional extras may come later in a Pro plan." },
] as const;

// Clearly identified sample content, not real user reviews.
export const sampleTestimonials = [
  { quote: "Sample text: a single place for the small tasks that come up every day would save me a lot of tab-hopping.", who: "Sample persona: Student" },
  { quote: "Sample text: quick calculators and a clean PDF toolset are what I would want while freelancing.", who: "Sample persona: Freelancer" },
  { quote: "Sample text: a simple, fast interface matters more to me than a long feature list.", who: "Sample persona: Small business owner" },
] as const;

export const faqs = [
  { q: "Is DailyDesk free to use?", a: "The core tools are intended to be free. A paid Pro plan with higher limits may be added later." },
  { q: "Do I need an account?", a: "Basic tools will work without signing up. An account will be needed for saving notes, favourites, tasks and history." },
  { q: "Are my files uploaded to a server?", a: "PDF and image tools are being built to process files in your browser. Only AI tools send the text you enter to a server, so it can be passed to the AI model." },
  { q: "Which tools are available right now?", a: "The directory lists all planned tools. Their working interfaces are being added step by step, and each tool page shows whether it is ready." },
] as const;
