"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";

import { loginSchema, type LoginFormData } from "@/lib/validations/auth.schema";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

/* ─── Supabase error → Hebrew message ──────────────────────────────────── */

function toHebrewError(message: string): string {
  if (message.includes("Invalid login credentials"))
    return "אימייל או סיסמה שגויים";
  if (message.includes("Email not confirmed"))
    return "עליך לאשר את האימייל לפני הכניסה — בדוק את תיבת הדואר";
  if (message.includes("Too many requests"))
    return "יותר מדי ניסיונות — נסה שוב בעוד מספר דקות";
  if (message.includes("User not found"))
    return "לא נמצא חשבון עם אימייל זה";
  return "שגיאה בהתחברות — נסה שוב";
}

/* ─── Google button ─────────────────────────────────────────────────────── */

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

/* ─── Divider ───────────────────────────────────────────────────────────── */

function OrDivider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-card px-3 text-muted-foreground">או המשך עם אימייל</span>
      </div>
    </div>
  );
}

/* ─── Props ─────────────────────────────────────────────────────────────── */

interface LoginFormProps {
  redirectTo?:  string;
  errorParam?:  string;
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function LoginForm({ redirectTo, errorParam }: LoginFormProps) {
  const router   = useRouter();
  const supabase = createClient();

  const [showPassword,    setShowPassword]    = useState(false);
  const [googleLoading,   setGoogleLoading]   = useState(false);
  const [serverError,     setServerError]     = useState<string | null>(
    errorParam ? "אירעה שגיאה בהתחברות — נסה שוב" : null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const isLoading = isSubmitting || googleLoading;

  /* ── Email / password submit ─────────────────────────────────────────── */

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email:    data.email,
      password: data.password,
    });

    if (error) {
      setServerError(toHebrewError(error.message));
      return;
    }

    toast.success("התחברת בהצלחה!");
    router.push(redirectTo ?? "/");
    router.refresh();
  };

  /* ── Google OAuth ────────────────────────────────────────────────────── */

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setServerError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo ?? "/"}`,
        queryParams: { prompt: "select_account" },
      },
    });

    if (error) {
      setServerError("שגיאה בהתחברות עם Google — נסה שוב");
      setGoogleLoading(false);
    }
    // אם הצליח — Supabase מפנה לגוגל, הדף יעזוב
  };

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="pt-6 pb-6 px-6 space-y-4">

        {/* Server / URL error banner */}
        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive"
          >
            <span className="mt-px leading-tight">{serverError}</span>
          </div>
        )}

        {/* Google */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 gap-3 font-medium"
          onClick={handleGoogle}
          disabled={isLoading}
        >
          {googleLoading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <GoogleIcon />
          }
          המשך עם Google
        </Button>

        <OrDivider />

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              dir="ltr"
              autoComplete="email"
              autoFocus
              disabled={isLoading}
              className={cn("h-11", errors.email && "border-destructive focus-visible:ring-destructive")}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">סיסמה</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
                tabIndex={-1}
              >
                שכחת סיסמה?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                dir="ltr"
                autoComplete="current-password"
                disabled={isLoading}
                className={cn(
                  "h-11 pl-10",
                  errors.password && "border-destructive focus-visible:ring-destructive"
                )}
                {...register("password")}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
              >
                {showPassword
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye    className="w-4 h-4" />
                }
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 gap-2 mt-2"
            disabled={isLoading}
          >
            {isSubmitting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <LogIn   className="w-4 h-4" />
            }
            {isSubmitting ? "מתחבר..." : "כניסה למערכת"}
          </Button>
        </form>

        {/* Register link */}
        <p className="text-center text-sm text-muted-foreground pt-1">
          אין לך חשבון עדיין?{" "}
          <Link
            href="/register"
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            הירשם בחינם
          </Link>
        </p>

      </CardContent>
    </Card>
  );
}
