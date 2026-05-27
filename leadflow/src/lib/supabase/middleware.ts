import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database.types";

/**
 * updateSession — מרענן את ה-session ב-cookies בכל request.
 *
 * חשוב: חייב לרוץ לפני כל בדיקת auth, אחרת ה-access token
 * לא יתחדש ו-getUser() תחזיר null גם למשתמש מחובר.
 *
 * נקרא מתוך middleware.ts הראשי בלבד — לא מ-components.
 */
export async function updateSession(request: NextRequest) {
  // מתחילים עם response "עבור הלאה"
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          // עדכן את ה-request cookies
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // צור response חדש עם ה-cookies המעודכנים
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          );
        },
      },
    }
  );

  // IMPORTANT: אל תוסיף קוד בין createServerClient ל-getUser.
  // שגיאה נפוצה שגורמת לבאגים עם session refresh.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, supabaseResponse };
}
