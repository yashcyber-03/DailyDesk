import type { Metadata } from "next";
import { AuthShell, NotConfigured } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/auth-forms";
import { safeNext } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Log in", robots: { index: false, follow: true }, alternates: { canonical: "/login" } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  if (!isSupabaseConfigured()) return <NotConfigured />;
  const { next, error } = await searchParams;
  return (
    <AuthShell title="Log in" description="Welcome back. Log in to sync your notes, tasks and favourites.">
      <LoginForm next={safeNext(next)} notice={error === "link" ? "That link is invalid or has expired. Please try again." : undefined} />
    </AuthShell>
  );
}
