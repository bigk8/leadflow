import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

/* ─── Metadata ──────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title:       { default: "LeadFlow", template: "%s | LeadFlow" },
  description: "מערכת CRM לניהול לידים ומעקב שיחות",
  icons:       { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
};

/* ─── Root Layout ───────────────────────────────────────────────────────── */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /*
     * suppressHydrationWarning — next-themes מוסיף את class="dark"
     * ל-<html> בצד לקוח אחרי hydration, מה שגורם למשתנה hydration mismatch.
     * הפרופ הזה מדכא את האזהרה ל-html בלבד.
     */
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"       /* מוסיף class="dark" ל-<html> */
          defaultTheme="light"
          enableSystem={false}    /* לא תלוי ב-OS preference — CRM ידני */
          disableTransitionOnChange={false}
          storageKey="leadflow-theme"
        >
          {children}

          <Toaster
            position="top-center"
            dir="rtl"
            richColors
            closeButton
            toastOptions={{
              style:        { fontFamily: "inherit" },
              classNames: {
                toast:       "font-sans",
                title:       "font-semibold",
                description: "text-sm",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
