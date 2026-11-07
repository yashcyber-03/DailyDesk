import type { Metadata } from "next";
import { Info } from "lucide-react";
import { ContactForm } from "@/components/legal/contact-form";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Contact DailyDesk to report a bug, suggest a tool, ask a question or make a privacy request.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="container max-w-2xl py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
      <p className="mb-8 mt-2 text-muted-foreground">Report a bug, suggest a tool, ask a question or make a privacy request.</p>
      <Card className="p-5 sm:p-6">
        {siteConfig.contactEmail ? (
          <ContactForm email={siteConfig.contactEmail} />
        ) : (
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p>Contact details have not been set up on this site yet. The site owner needs to set <code>NEXT_PUBLIC_CONTACT_EMAIL</code>.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
