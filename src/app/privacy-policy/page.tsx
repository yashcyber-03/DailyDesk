import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { privacySections, privacySummary } from "@/content/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How DailyDesk handles your files, text, account details and saved data.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return <LegalPage title="Privacy Policy" summary={privacySummary} sections={privacySections} />;
}
