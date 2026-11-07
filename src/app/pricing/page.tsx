import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Free Tools",
  description: "All DailyDesk tools are free to use. No account or paid plan is required.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Free tools, no account required</h1>
      <p className="mt-3 text-muted-foreground">
        Every available tool on DailyDesk is free to use. There are no Pro plans, subscriptions or sign-up requirements.
      </p>
      <Card className="mt-8 space-y-3 p-6">
        <h2 className="text-xl font-semibold tracking-tight">Your data stays in your browser</h2>
        <p className="text-sm text-muted-foreground">
          Files are processed on your device. Notes, tasks, favourites and other saved productivity data are stored locally in this browser and are not synced to other devices.
        </p>
        <Link href="/tools" className="inline-flex text-sm font-medium text-primary underline">Browse all tools</Link>
      </Card>
    </div>
  );
}
