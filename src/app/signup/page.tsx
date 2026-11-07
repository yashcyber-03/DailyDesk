import type { Metadata } from "next";
import { AuthShell, NotConfigured } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/auth-forms";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Create an account", robots: { index: false, follow: true }, alternates: { canonical: "/signup" } };

export default function SignupPage() {
  if (!isSupabaseConfigured()) return <NotConfigured />;
  return (
    <AuthShell title="Create your account" description="Free. Save notes, tasks and favourites and use them on any device. Tools still work without an account.">
      <SignupForm />
    </AuthShell>
  );
}
