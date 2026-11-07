/**
 * Builds the Content-Security-Policy header value.
 * Inline scripts are allowed because Next.js needs them for hydration without per-request nonces.
 * @param {{ supabaseUrl?: string, isDev?: boolean }} [options]
 */
export function buildCsp({ supabaseUrl, isDev = false } = {}) {
  const connect = ["'self'"];
  if (supabaseUrl) {
    try {
      const u = new URL(supabaseUrl);
      connect.push(u.origin, `wss://${u.host}`);
    } catch {
      // invalid URL: leave Supabase out
    }
  }
  if (isDev) connect.push("ws:", "wss:");
  const script = ["'self'", "'unsafe-inline'"];
  if (isDev) script.push("'unsafe-eval'");

  const directives = {
    "default-src": ["'self'"],
    "script-src": script,
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'", "data:"],
    "connect-src": connect,
    "worker-src": ["'self'", "blob:"],
    "media-src": ["'self'"],
    "frame-src": ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'self'"],
  };
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
}
