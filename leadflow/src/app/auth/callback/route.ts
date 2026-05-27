import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/callback
 *
 * Supabase מפנה לכאן אחרי:
 *   - Google OAuth
 *   - אימות אימייל (הרשמה)
 *   - איפוס סיסמה
 *
 * הפרמטר `code` מומר ל-session ע"י exchangeCodeForSession.
 * הפרמטר `next` קובע לאן להפנות לאחר הצלחה (ברירת מחדל: "/").
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code  = searchParams.get("code");
  const next  = searchParams.get("next")  ?? "/";
  const error = searchParams.get("error");

  // Supabase החזיר שגיאה ב-OAuth flow
  if (error) {
    console.error("[auth/callback] OAuth error:", error);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("[auth/callback] Exchange error:", exchangeError.message);
      return NextResponse.redirect(
        `${origin}/login?error=auth_callback_failed`
      );
    }

    // הצלחה — הפנה לדף המבוקש
    const redirectTo = next.startsWith("/") ? next : "/";
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // אין code ואין error — מצב בלתי צפוי
  return NextResponse.redirect(`${origin}/login?error=missing_code`);
}
