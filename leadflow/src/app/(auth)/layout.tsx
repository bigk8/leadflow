import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default:  "כניסה",
    template: "%s | LeadFlow",
  },
};

/**
 * Auth layout — עוטף את דפי login ו-register.
 * לא כולל Sidebar/TopBar.
 * הגנת routes מטופלת ב-middleware.ts — משתמש מחובר מועבר ל-"/" אוטומטית.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
