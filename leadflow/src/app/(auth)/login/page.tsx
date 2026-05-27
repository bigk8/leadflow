import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { Zap } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "כניסה למערכת" };

interface LoginPageProps {
  searchParams: Promise<{
    next?:  string;
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, error } = await searchParams;

  return (
    <div className="min-h-screen flex">

      {/* ── Left branding panel (hidden on mobile) ──────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] bg-sidebar flex-col justify-between p-12 relative overflow-hidden">

        {/* Decorative blobs */}
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-sidebar-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-2xl font-bold text-sidebar-foreground">LeadFlow</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl font-bold text-sidebar-foreground leading-tight">
            נהל לידים בצורה
            <br />
            <span className="text-sidebar-primary">חכמה ויעילה</span>
          </h1>
          <p className="text-sidebar-foreground/60 text-lg leading-relaxed">
            מעקב שיחות, ניהול לקוחות, תזכורות חכמות — הכל במקום אחד.
          </p>
        </div>

        {/* Feature chips */}
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {[
            { emoji: "🎯", label: "ניהול לידים"      },
            { emoji: "📞", label: "מעקב שיחות"       },
            { emoji: "🔔", label: "תזכורות חכמות"    },
            { emoji: "📊", label: "דוחות ואנליטיקה"  },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-2.5 bg-sidebar-accent/60 rounded-xl px-4 py-3 border border-sidebar-border"
            >
              <span className="text-lg">{f.emoji}</span>
              <span className="text-sm font-medium text-sidebar-foreground/80">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold">LeadFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">ברוך הבא 👋</h2>
            <p className="text-muted-foreground mt-2">
              הכנס את פרטיך כדי להתחבר למערכת
            </p>
          </div>

          <LoginForm redirectTo={next} errorParam={error} />
        </div>
      </div>

    </div>
  );
}
