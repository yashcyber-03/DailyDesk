"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";

const base = "inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors";

export function AuthNav({ onNavigate, stacked = false }: { onNavigate?: () => void; stacked?: boolean }) {
  const { user, loading, configured } = useAuth();
  if (!configured || loading) return null;
  const wrap = stacked ? "grid gap-1" : "flex items-center gap-1";
  const link = stacked ? "rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent" : `${base} hover:bg-accent`;
  return (
    <div className={wrap}>
      {user ? (
        <Link href="/dashboard" onClick={onNavigate} className={link}>Dashboard</Link>
      ) : (
        <>
          <Link href="/login" onClick={onNavigate} className={link}>Log in</Link>
          <Link href="/signup" onClick={onNavigate} className={stacked ? link : `${base} bg-primary text-primary-foreground hover:opacity-90`}>Sign up</Link>
        </>
      )}
    </div>
  );
}
