import type { Metadata } from "next";
import { AuthShell, NotConfigured } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/auth-forms";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false, follow: false }, alternates: { canonical: "/reset-password" } };

export default function ResetPasswordPage() {
  if (!isSupabaseConfigured()) return <NotConfigured />;
  return (
    <AuthShell title="Choose a new password">
      <ResetPasswordForm />
    </AuthShell>
  );
}
