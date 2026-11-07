import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { termsSections, termsSummary } from "@/content/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms and Conditions",
  description: "The terms for using DailyDesk, including acceptable use, AI features and disclaimers.",
  path: "/terms-and-conditions",
});

export default function TermsPage() {
  return <LegalPage title="Terms and Conditions" summary={termsSummary} sections={termsSections} />;
}
