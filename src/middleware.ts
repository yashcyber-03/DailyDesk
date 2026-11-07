import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/update-session";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// Only the pages that need the session. Tool and marketing pages stay static and fast.
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
