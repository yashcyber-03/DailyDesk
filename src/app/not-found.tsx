import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <div className="container py-24 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">The page you are looking for does not exist or may have moved.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">Go home</Link>
        <Link href="/tools" className="inline-flex h-10 items-center rounded-lg border px-4 text-sm font-medium hover:bg-accent">Browse tools</Link>
      </div>
    </div>
  );
}
