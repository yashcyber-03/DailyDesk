import type { Metadata } from "next";
import { AuthShell, NotConfigured } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false, follow: true }, alternates: { canonical: "/forgot-password" } };

export default function ForgotPasswordPage() {
  if (!isSupabaseConfigured()) return <NotConfigured />;
  return (
    <AuthShell title="Reset your password" description="Enter your email and we will send you a reset link.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
