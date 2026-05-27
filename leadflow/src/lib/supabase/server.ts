import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * Supabase Client — צד שרת (Server Components, Route Handlers, Server Actions)
 *
 * חייב להיות async כי cookies() מחזיר Promise ב-Next.js 15.
 *
 * שימוש ב-Server Component:
 *   const supabase = await createClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 *
 * שימוש ב-Route Handler:
 *   const supabase = await createClient()
 *   const { data } = await supabase.from("leads").select()
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            );
          } catch {
            // Server Component — read-only cookies.
            // session refresh יטופל ע"י middleware.ts
          }
        },
      },
    }
  );
}
