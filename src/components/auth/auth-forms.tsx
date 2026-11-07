"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Field } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { friendlyAuthError } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/client";

const MIN_PASSWORD = 8;

function FormError({ message }: { message: string | null }) {
  return message ? <p role="alert" className="text-sm font-medium text-destructive">{message}</p> : null;
}
function Notice({ children }: { children: React.ReactNode }) {
  return <p role="status" className="rounded-lg border bg-muted/50 p-3 text-sm">{children}</p>;
}

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
    if (err) {
      setError(friendlyAuthError(err));
      setBusy(false);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
      {notice && <Notice>{notice}</Notice>}
      <Field label="Email" htmlFor="login-email">
        <Input id="login-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Password" htmlFor="login-password">
        <Input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <FormError message={error} />
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Logging in..." : "Log in"}</Button>
      <div className="flex justify-between text-sm text-muted-foreground">
        <Link href="/forgot-password" className="hover:text-foreground">Forgot password?</Link>
        <Link href="/signup" className="hover:text-foreground">Create an account</Link>
      </div>
    </form>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < MIN_PASSWORD) {
      setError(`Use at least ${MIN_PASSWORD} characters for your password.`);
      return;
    }
    setBusy(true);
    const { data, error: err } = await createClient().auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: name.trim().slice(0, 80) },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    setBusy(false);
    if (err) {
      setError(friendlyAuthError(err));
      return;
    }
    if (data.session) {
      router.replace("/dashboard");
      router.refresh();
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Notice>
        Check your inbox. If this email can be used for a new account, we have sent a link to confirm it. After confirming, you can{" "}
        <Link href="/login" className="underline">log in</Link>.
      </Notice>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Name (optional)" htmlFor="signup-name">
        <Input id="signup-name" autoComplete="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Email" htmlFor="signup-email">
        <Input id="signup-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Password" htmlFor="signup-password" hint={`At least ${MIN_PASSWORD} characters. A long phrase is best.`}>
        <Input id="signup-password" type="password" autoComplete="new-password" required minLength={MIN_PASSWORD} value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <FormError message={error} />
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Creating account..." : "Create account"}</Button>
      <p className="text-center text-xs text-muted-foreground">
        By creating an account you agree to the <Link href="/terms-and-conditions" className="underline">Terms</Link> and the <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
      </p>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="text-foreground underline">Log in</Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setBusy(false);
    // Always show the same message so nobody can find out which emails have accounts.
    if (err && /rate|too many/i.test(`${err.code ?? ""} ${err.message}`)) {
      setError(friendlyAuthError(err));
      return;
    }
    setSent(true);
  }

  if (sent) return <Notice>If an account exists for that email, we have sent a link to reset the password. It can take a few minutes to arrive.</Notice>;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Email" htmlFor="forgot-email">
        <Input id="forgot-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <FormError message={error} />
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Sending..." : "Send reset link"}</Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="hover:text-foreground">Back to log in</Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (loading) return <p className="text-sm text-muted-foreground">Checking your link...</p>;
  if (!user) {
    return (
      <Notice>
        This reset link is invalid or has expired. <Link href="/forgot-password" className="underline">Request a new one</Link>.
      </Notice>
    );
  }
  if (done) {
    return (
      <Notice>
        Your password has been updated. <Link href="/dashboard" className="underline">Go to your dashboard</Link>.
      </Notice>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < MIN_PASSWORD) return setError(`Use at least ${MIN_PASSWORD} characters for your password.`);
    if (password !== confirm) return setError("The two passwords do not match.");
    setBusy(true);
    const { error: err } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (err) return setError(friendlyAuthError(err));
    setDone(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="New password" htmlFor="reset-password" hint={`At least ${MIN_PASSWORD} characters.`}>
        <Input id="reset-password" type="password" autoComplete="new-password" required minLength={MIN_PASSWORD} value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <Field label="Confirm new password" htmlFor="reset-confirm">
        <Input id="reset-confirm" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </Field>
      <FormError message={error} />
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Saving..." : "Update password"}</Button>
    </form>
  );
}
