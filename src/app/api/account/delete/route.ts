import { createClient as createAdminClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseUrl } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const reply = (status: number, message: string) =>
  new Response(JSON.stringify({ ok: status === 200, message }), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

// Permanently deletes the signed-in user's account. All their rows are removed by ON DELETE CASCADE.
export async function POST(request: Request) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!isSupabaseConfigured() || !secret) return reply(503, "Account deletion is not enabled on this site yet.");

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return reply(403, "Request not allowed.");
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) return reply(400, "Invalid request.");
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return reply(400, "Invalid request.");
  }
  if ((body as { confirm?: unknown } | null)?.confirm !== "DELETE") return reply(400, "Please type DELETE to confirm.");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return reply(401, "Please log in again.");

  const admin = createAdminClient(supabaseUrl!, secret, { auth: { autoRefreshToken: false, persistSession: false } });
  const { error: deleteError } = await admin.auth.admin.deleteUser(data.user.id);
  if (deleteError) return reply(500, "Could not delete the account. Please try again later.");

  await supabase.auth.signOut().catch(() => undefined);
  return reply(200, "Your account has been deleted.");
}
