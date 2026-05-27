"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, UserPlus, CheckCircle2, XCircle } from "lucide-react";

import { registerSchema, type RegisterFormData } from "@/lib/validations/auth.schema";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import { Button }            from "@/components/ui/button";
import { Input }             from "@/components/ui/input";
import { Label }             from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

/* ─── Supabase error → Hebrew ───────────────────────────────────────────── */

function toHebrewError(message: string): string {
  if (message.includes("already registered") || message.includes("User already registered"))
    return "כתובת אימייל זו כבר רשומה במערכת — נסה להתחבר";
  if (message.includes("Password should be"))
    return "הסיסמה אינה עומדת בדרישות האבטחה";
  if (message.includes("Unable to validate"))
    return "כתובת האימייל אינה תקינה";
  return "שגיאה בהרשמה — נסה שוב";
}

/* ─── Password strength ─────────────────────────────────────────────────── */

interface StrengthRule {
  label: string;
  test:  (v: string) => boolean;
}

const STRENGTH_RULES: StrengthRule[] = [
  { label: "לפחות 8 תווים",              test: (v) => v.length >= 8        },
  { label: "אות גדולה באנגלית (A-Z)",    test: (v) => /[A-Z]/.test(v)     },
  { label: "ספרה (0-9)",                 test: (v) => /[0-9]/.test(v)     },
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const passed = STRENGTH_RULES.filter((r) => r.test(password)).length;
  const colors = ["bg-destructive", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  const barColor = colors[passed] ?? "bg-muted";

  return (
    <div className="mt-2 space-y-2">
      {/* Progress bar */}
      <div className="flex gap-1">
        {STRENGTH_RULES.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i < passed ? barColor : "bg-muted"
            )}
          />
        ))}
      </div>
      {/* Rules list */}
      <ul className="space-y-1">
        {STRENGTH_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <li key={rule.label} className="flex items-center gap-1.5 text-xs">
              {ok
                ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                : <XCircle      className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
              }
              <span className={ok ? "text-foreground" : "text-muted-foreground"}>
                {rule.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─── Google icon ───────────────────────────────────────────────────────── */

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
        <span className="bg-card px-3 text-muted-foreground">או הירשם עם אימייל</span>
      </div>
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function RegisterForm() {
  const router   = useRouter();
  const supabase = createClient();

  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [googleLoading,   setGoogleLoading]   = useState(false);
  const [serverError,     setServerError]     = useState<string | null>(null);
  const [emailSent,       setEmailSent]       = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password", "");
  const isLoading     = isSubmitting || googleLoading;

  /* ── Email register ──────────────────────────────────────────────────── */

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);

    const { error } = await supabase.auth.signUp({
      email:    data.email,
      password: data.password,
      options: {
        data:            { full_name: data.fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setServerError(toHebrewError(error.message));
      return;
    }

    setEmailSent(true);
  };

  /* ── Google OAuth ────────────────────────────────────────────────────── */

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setServerError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });

    if (error) {
      setServerError("שגיאה בהרשמה עם Google — נסה שוב");
      setGoogleLoading(false);
    }
  };

  /* ── Email sent state ────────────────────────────────────────────────── */

  if (emailSent) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardContent className="pt-8 pb-8 px-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold">בדוק את האימייל שלך</h3>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
              שלחנו לך קישור לאימות. לחץ עליו כדי להשלים את ההרשמה ולהיכנס למערכת.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/login")}
          >
            חזרה לדף הכניסה
          </Button>
        </CardContent>
      </Card>
    );
  }

  /* ── Form ────────────────────────────────────────────────────────────── */

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="pt-6 pb-6 px-6 space-y-4">

        {/* Error banner */}
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
          הירשם עם Google
        </Button>

        <OrDivider />

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

          {/* Full name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName">שם מלא</Label>
            <Input
              id="fullName"
              placeholder="ישראל ישראלי"
              autoComplete="name"
              autoFocus
              disabled={isLoading}
              className={cn("h-11", errors.fullName && "border-destructive focus-visible:ring-destructive")}
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              dir="ltr"
              autoComplete="email"
              disabled={isLoading}
              className={cn("h-11", errors.email && "border-destructive focus-visible:ring-destructive")}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">סיסמה</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="לפחות 8 תווים"
                dir="ltr"
                autoComplete="new-password"
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
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password
              ? <p className="text-xs text-destructive">{errors.password.message}</p>
              : <PasswordStrength password={passwordValue} />
            }
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">אישור סיסמה</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="הזן שוב את הסיסמה"
                dir="ltr"
                autoComplete="new-password"
                disabled={isLoading}
                className={cn(
                  "h-11 pl-10",
                  errors.confirmPassword && "border-destructive focus-visible:ring-destructive"
                )}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirm ? "הסתר סיסמה" : "הצג סיסמה"}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Terms note */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            בלחיצה על "צור חשבון" אתה מסכים לתנאי השימוש ומדיניות הפרטיות שלנו.
          </p>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 gap-2"
            disabled={isLoading}
          >
            {isSubmitting
              ? <Loader2   className="w-4 h-4 animate-spin" />
              : <UserPlus  className="w-4 h-4" />
            }
            {isSubmitting ? "יוצר חשבון..." : "צור חשבון"}
          </Button>
        </form>

      </CardContent>
    </Card>
  );
}
