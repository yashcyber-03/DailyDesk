import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "./config";

/** For Client Components. */
export function createClient() {
  return createBrowserClient(supabaseUrl!, supabaseKey!);
}
