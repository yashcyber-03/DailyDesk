import type { Metadata } from "next";
import { Check } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AI_LIMITS } from "@/config/ai";
import { IMAGE_RULE, PDF_RULE } from "@/config/limits";
import { PLANS } from "@/config/plans";
import { formatBytes } from "@/lib/files";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Pricing",
  description: "DailyDesk is free to use. See the current limits and what a future Pro plan may include.",
  path: "/pricing",
});

const plans = [PLANS.free, PLANS.pro];

export default function PricingPage() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">DailyDesk is free to use today. There is no payment feature, and nothing you use now is locked behind one.</p>

      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <li key={plan.id}>
            <Card className="flex h-full flex-col p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">{plan.name}</h2>
                {plan.available ? <Badge>Available now</Badge> : <Badge>Planned</Badge>}
              </div>
              <p className="mt-3 text-3xl font-semibold">{plan.priceLabel}</p>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {plan.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{h}</li>
                ))}
              </ul>
              <div className="mt-6">
                {plan.available ? (
                  <Link href="/tools" className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">Start using tools</Link>
                ) : (
                  <p className="text-sm text-muted-foreground">Pro is not on sale yet. Features may change before it launches.</p>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-xl font-semibold tracking-tight">Current limits</h2>
      <div className="mt-4 overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="bg-muted/50">
            <tr><th scope="col" className="p-3 font-medium">Limit</th><th scope="col" className="p-3 font-medium">Visitors</th><th scope="col" className="p-3 font-medium">Free account</th></tr>
          </thead>
          <tbody className="divide-y">
            <tr><th scope="row" className="p-3 font-normal text-muted-foreground">AI requests per day</th><td className="p-3">{AI_LIMITS.perDay}</td><td className="p-3">{PLANS.free.aiRequestsPerDay}</td></tr>
            <tr><th scope="row" className="p-3 font-normal text-muted-foreground">AI requests per minute</th><td className="p-3">{AI_LIMITS.perMinute}</td><td className="p-3">{AI_LIMITS.perMinute}</td></tr>
            <tr><th scope="row" className="p-3 font-normal text-muted-foreground">Largest PDF</th><td className="p-3">{formatBytes(PDF_RULE.maxBytes)}</td><td className="p-3">{formatBytes(PDF_RULE.maxBytes)}</td></tr>
            <tr><th scope="row" className="p-3 font-normal text-muted-foreground">Largest image</th><td className="p-3">{formatBytes(IMAGE_RULE.maxBytes)}</td><td className="p-3">{formatBytes(IMAGE_RULE.maxBytes)}</td></tr>
            <tr><th scope="row" className="p-3 font-normal text-muted-foreground">Saved data (notes, tasks, habits)</th><td className="p-3">This browser only</td><td className="p-3">Synced to your account</td></tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Limits exist to keep the service fair and affordable and may change. AI request limits reset daily at midnight UTC.</p>
    </div>
  );
}
