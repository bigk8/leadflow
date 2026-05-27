import { z } from "zod";

/* ─── Login ─────────────────────────────────────────────────────────────── */

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "אימייל הוא שדה חובה")
    .email("כתובת האימייל אינה תקינה"),
  password: z
    .string()
    .min(1, "סיסמה היא שדה חובה")
    .min(6, "הסיסמה חייבת להכיל לפחות 6 תווים"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/* ─── Register ──────────────────────────────────────────────────────────── */

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "שם מלא חייב להכיל לפחות 2 תווים")
      .max(50, "שם מלא לא יכול לעלות על 50 תווים")
      .regex(/\S+\s+\S+/, "יש להזין שם פרטי ושם משפחה"),
    email: z
      .string()
      .min(1, "אימייל הוא שדה חובה")
      .email("כתובת האימייל אינה תקינה"),
    password: z
      .string()
      .min(8, "הסיסמה חייבת להכיל לפחות 8 תווים")
      .regex(/[A-Z]/, "הסיסמה חייבת להכיל לפחות אות גדולה אחת באנגלית")
      .regex(/[0-9]/, "הסיסמה חייבת להכיל לפחות ספרה אחת"),
    confirmPassword: z.string().min(1, "אישור סיסמה הוא שדה חובה"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

/* ─── Forgot password ───────────────────────────────────────────────────── */

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "אימייל הוא שדה חובה")
    .email("כתובת האימייל אינה תקינה"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/* ─── Reset password ────────────────────────────────────────────────────── */

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "הסיסמה חייבת להכיל לפחות 8 תווים")
      .regex(/[A-Z]/, "הסיסמה חייבת להכיל לפחות אות גדולה אחת באנגלית")
      .regex(/[0-9]/, "הסיסמה חייבת להכיל לפחות ספרה אחת"),
    confirmPassword: z.string().min(1, "אישור סיסמה הוא שדה חובה"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
