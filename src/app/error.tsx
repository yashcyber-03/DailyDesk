"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

// Shown when something unexpected breaks while a page renders. The error details are not shown to visitors.
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">An unexpected error occurred. You can try again, or go back to the home page.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/" className="inline-flex h-10 items-center rounded-lg border px-4 text-sm font-medium hover:bg-accent">Go home</Link>
      </div>
    </div>
  );
}
