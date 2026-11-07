/** Only allow redirects to paths on this site. Anything else falls back to a safe default. */
export function safeNext(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f]/.test(value)) {
    return fallback;
  }
  try {
    const url = new URL(value, "http://localhost");
    if (url.origin !== "http://localhost") return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}

/** Turns Supabase Auth errors into short, safe messages. */
export function friendlyAuthError(error: { message?: string; code?: string } | null | undefined): string {
  const text = `${error?.code ?? ""} ${error?.message ?? ""}`.toLowerCase();
  if (text.includes("invalid login") || text.includes("invalid_credentials")) return "Incorrect email or password.";
  if (text.includes("email not confirmed") || text.includes("email_not_confirmed")) return "Please confirm your email address first. Check your inbox for the link.";
  if (text.includes("rate limit") || text.includes("rate_limit") || text.includes("too many")) return "Too many attempts. Please wait a few minutes and try again.";
  if (text.includes("weak_password") || text.includes("password should") || text.includes("weak password")) return "Please choose a stronger password (at least 8 characters, not a common one).";
  if (text.includes("same_password") || text.includes("different from the old")) return "Your new password must be different from the old one.";
  if (text.includes("network") || text.includes("fetch")) return "Could not reach the server. Check your connection and try again.";
  return "Something went wrong. Please try again.";
}
