import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { categories } from "@/config/categories";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Free Online Tools",
  description: "Use free PDF, image, calculator and productivity tools in your browser. No sign-up or paid plans.",
  path: "/",
});

export default function HomePage() {
  return (
    <div className="container space-y-12 py-16">
      <section className="max-w-3xl">
        <p className="text-sm font-medium text-primary">Free online tools</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Everything you need, all in one desk.</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Use every available tool without creating an account. There are no paid plans, and your files and saved productivity data stay in your browser.
        </p>
        <Link href="/tools" className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90">
          Browse all tools
        </Link>
      </section>

      <section aria-labelledby="categories">
        <h2 id="categories" className="mb-4 text-2xl font-semibold tracking-tight">Explore tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.slug} href={category.href} className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Card className="h-full p-5 transition-colors hover:bg-accent">
                  <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  <h3 className="mt-3 font-semibold">{category.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
