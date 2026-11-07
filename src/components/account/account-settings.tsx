"use client";

import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ErrorMessage, Field } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { friendlyAuthError } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/client";

type Theme = "system" | "light" | "dark";
interface Props {
  userId: string;
  email: string;
  initialName: string;
  initialTheme: Theme;
}

function Status({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return ok ? <p role="status" className="text-sm text-muted-foreground">{children}</p> : <ErrorMessage>{children}</ErrorMessage>;
}

export function AccountSettings({ userId, email, initialName, initialTheme }: Props) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [name, setName] = useState(initialName);
  const [nameMsg, setNameMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [histMsg, setHistMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirm, setConfirm] = useState("");
  const [delMsg, setDelMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Apply the theme saved in the account once when the dashboard opens.
  useEffect(() => setTheme(initialTheme), [initialTheme, setTheme]);

  async function saveName(e: FormEvent) {
    e.preventDefault();
    const value = name.trim().slice(0, 80);
    const { error } = await createClient().from("profiles").update({ display_name: value || null }).eq("id", userId);
    setNameMsg(error ? { ok: false, text: "Could not save your name. Please try again." } : { ok: true, text: "Saved." });
    if (!error) router.refresh();
  }

  async function changeTheme(value: Theme) {
    setThemeState(value);
    setTheme(value);
    await createClient().from("user_settings").upsert({ user_id: userId, theme: value });
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return setPwMsg({ ok: false, text: "Use at least 8 characters." });
    if (pw !== pw2) return setPwMsg({ ok: false, text: "The two passwords do not match." });
    const { error } = await createClient().auth.updateUser({ password: pw });
    if (error) return setPwMsg({ ok: false, text: friendlyAuthError(error) });
    setPw("");
    setPw2("");
    setPwMsg({ ok: true, text: "Password updated." });
  }

  async function clearHistory() {
    const { error } = await createClient().from("tool_history").delete().eq("user_id", userId);
    setHistMsg(error ? { ok: false, text: "Could not clear your history." } : { ok: true, text: "Activity history cleared." });
    if (!error) router.refresh();
  }

  async function signOut() {
    setBusy(true);
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  }

  async function deleteAccount() {
    setBusy(true);
    setDelMsg(null);
    try {
      const res = await fetch("/api/account/delete", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ confirm }) });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok) {
        setDelMsg(data.message ?? "Could not delete the account.");
        setBusy(false);
        return;
      }
      await createClient().auth.signOut({ scope: "local" });
      router.replace("/");
      router.refresh();
    } catch {
      setDelMsg("Could not reach the server. Please try again.");
      setBusy(false);
    }
  }

  return (
    <Card className="divide-y">
      <form onSubmit={saveName} className="space-y-3 p-5 sm:p-6">
        <h3 className="font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">Signed in as {email}</p>
        <Field label="Display name" htmlFor="set-name"><Input id="set-name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Button type="submit" size="sm">Save name</Button>
        {nameMsg && <Status ok={nameMsg.ok}>{nameMsg.text}</Status>}
      </form>

      <div className="space-y-3 p-5 sm:p-6">
        <h3 className="font-medium">Appearance</h3>
        <Field label="Theme" htmlFor="set-theme">
          <Select id="set-theme" value={theme} onChange={(e) => void changeTheme(e.target.value as Theme)}>
            <option value="system">Match my device</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </Select>
        </Field>
      </div>

      <form onSubmit={changePassword} className="space-y-3 p-5 sm:p-6">
        <h3 className="font-medium">Change password</h3>
        <Field label="New password" htmlFor="set-pw"><Input id="set-pw" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
        <Field label="Confirm new password" htmlFor="set-pw2"><Input id="set-pw2" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></Field>
        <Button type="submit" size="sm">Update password</Button>
        {pwMsg && <Status ok={pwMsg.ok}>{pwMsg.text}</Status>}
      </form>

      <div className="space-y-3 p-5 sm:p-6">
        <h3 className="font-medium">Privacy</h3>
        <p className="text-sm text-muted-foreground">DailyDesk keeps a count of which tools you use so it can show your recent tools. You can erase it at any time.</p>
        <Button variant="outline" size="sm" onClick={clearHistory}>Clear activity history</Button>
        {histMsg && <Status ok={histMsg.ok}>{histMsg.text}</Status>}
      </div>

      <div className="space-y-3 p-5 sm:p-6">
        <h3 className="font-medium">Session</h3>
        <Button variant="outline" size="sm" onClick={signOut} disabled={busy}>Log out</Button>
      </div>

      <div className="space-y-3 p-5 sm:p-6">
        <h3 className="font-medium text-destructive">Delete account</h3>
        <p className="text-sm text-muted-foreground">Permanently deletes your account, notes, tasks, habits, planner entries and favourites. This cannot be undone.</p>
        <Field label="Type DELETE to confirm" htmlFor="set-delete"><Input id="set-delete" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" /></Field>
        <Button variant="destructive" size="sm" disabled={confirm !== "DELETE" || busy} onClick={deleteAccount}>Delete my account</Button>
        {delMsg && <ErrorMessage>{delMsg}</ErrorMessage>}
      </div>
    </Card>
  );
}
