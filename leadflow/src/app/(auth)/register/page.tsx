import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Zap } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "הרשמה" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-2xl font-bold">LeadFlow</span>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">צור חשבון חדש</h2>
          <p className="text-muted-foreground mt-2">
            הירשם בחינם ותתחיל לנהל לידים כבר היום
          </p>
        </div>

        <RegisterForm />

        <p className="text-center text-sm text-muted-foreground mt-6">
          כבר יש לך חשבון?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            התחבר כאן
          </Link>
        </p>
      </div>
    </div>
  );
}
