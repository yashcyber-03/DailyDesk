import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { categories } from "@/config/categories";
import { tools } from "@/config/tools";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About DailyDesk",
  description: "DailyDesk is a free, privacy-minded online toolkit that brings everyday PDF, image, calculator and productivity tools into one place.",
  path: "/about",
});

const principles = [
  { title: "Useful first", text: "Each tool does one job well, explains how it works and tells you its limits." },
  { title: "Private by design", text: "Tools run in your browser. Files and productivity data are not uploaded to DailyDesk." },
  { title: "Honest", text: "Calculator results are aids, not professional advice. We explain limits and do not invent reviews or claims." },
  { title: "Works without sign-in", text: "Every available tool is accessible without an account. There is no account or sync service." },
];

export default function AboutPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-semibold tracking-tight">About DailyDesk</h1>
      <p className="mt-4 text-muted-foreground">
        DailyDesk is an independent online toolkit. Instead of searching for a different website every time you need to merge a PDF, shrink a photo, work out an EMI or organize your day, you can find
        {" "}{tools.length} tools in {categories.length} categories in one clean place.
      </p>
      <p className="mt-4 text-muted-foreground">
        It is made for students, professionals, freelancers, business owners and anyone who wants quick, dependable help with everyday digital tasks.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">What we care about</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {principles.map((p) => (
          <li key={p.title}>
            <Card className="h-full p-5">
              <h3 className="font-medium">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
            </Card>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">What is inside</h2>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-muted-foreground">
        {categories.map((c) => (
          <li key={c.slug}><Link href={c.href} className="text-foreground underline">{c.name}</Link>: {c.description}</li>
        ))}
      </ul>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">Get in touch</h2>
      <p className="mt-2 text-muted-foreground">
        Found a bug or have an idea for a tool? Visit the <Link href="/contact" className="text-foreground underline">contact page</Link>. You can also read how we handle data in the{" "}
        <Link href="/privacy-policy" className="text-foreground underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}
