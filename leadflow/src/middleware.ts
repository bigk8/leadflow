import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// ─── Routes ────────────────────────────────────────────────────────────────

/** כל route שלא מצריך login */
const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
];

/** Routes שמשתמש מחובר לא צריך לראות (נשלח ל-dashboard) */
const AUTH_ROUTES = ["/login", "/register"];

// ─── Middleware ─────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. רענן session + קבל user — חייב להיות ראשון תמיד
  const { user, supabaseResponse } = await updateSession(request);

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // 2. לא מחובר + מנסה לגשת ל-protected route → login
  if (!user && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    // שמור את ה-URL המקורי לאחר login
    if (pathname !== "/") {
      loginUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 3. מחובר + מנסה לגשת ל-login/register → dashboard
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 4. המשך רגיל — חשוב להחזיר את supabaseResponse (מכיל cookies מרועננים)
  return supabaseResponse;
}

// ─── Matcher ────────────────────────────────────────────────────────────────
// הפעל middleware על כל route חוץ מ: static files, images, favicon

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
