import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/**
 * Supabase Client — צד לקוח (Client Components בלבד)
 *
 * שימוש:
 *   const supabase = createClient()
 *   const { data } = await supabase.from("leads").select()
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
