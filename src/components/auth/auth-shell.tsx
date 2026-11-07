import Link from "next/link";
import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function AuthShell({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="container flex justify-center py-16">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
        <div className="mt-6">{children}</div>
      </Card>
    </div>
  );
}

export function NotConfigured() {
  return (
    <AuthShell title="Accounts are not set up yet">
      <div className="flex items-start gap-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p>
          The site owner still needs to connect Supabase. Meanwhile, every tool works without an account.{" "}
          <Link href="/tools" className="text-foreground underline">Browse tools</Link>
        </p>
      </div>
    </AuthShell>
  );
}
