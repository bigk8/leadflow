import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { he } from "date-fns/locale";

/* ─── Tailwind class merger ─────────────────────────────────────────────── */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ─── String helpers ────────────────────────────────────────────────────── */

/** מחזיר ראשי תיבות משם מלא — "ישראל ישראלי" → "יי" */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** קיצור מחרוזת ארוכה */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + "…";
}

/* ─── Date helpers (Hebrew locale) ─────────────────────────────────────── */

/** 12 ביוני 2025 */
export function formatDateHe(date: Date | string): string {
  return format(new Date(date), "d בMMMM yyyy", { locale: he });
}

/** 12/06/25 */
export function formatDateShort(date: Date | string): string {
  return format(new Date(date), "dd/MM/yy");
}

/** 14:30 */
export function formatTime(date: Date | string): string {
  return format(new Date(date), "HH:mm");
}

/**
 * "היום", "אתמול", "לפני 3 ימים", "12 ביוני"
 * — הפורמט שמוצג בטבלת לידים / ציר שיחות
 */
export function formatRelative(date: Date | string): string {
  const d = new Date(date);
  if (isToday(d))     return `היום, ${formatTime(d)}`;
  if (isYesterday(d)) return `אתמול, ${formatTime(d)}`;
  return formatDistanceToNow(d, { addSuffix: true, locale: he });
}

/* ─── Number helpers ────────────────────────────────────────────────────── */

/** ₪ 1,250 */
export function formatCurrency(
  amount: number,
  currency: string = "ILS"
): string {
  return new Intl.NumberFormat("he-IL", {
    style:    "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** 1234 → "1,234" */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("he-IL").format(n);
}

/* ─── URL helpers ───────────────────────────────────────────────────────── */

/** בנה URL עם query params — מנקה ערכים ריקים */
export function buildUrl(
  base: string,
  params: Record<string, string | number | undefined | null>
): string {
  const url = new URL(base, "http://localhost");
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") url.searchParams.set(k, String(v));
  });
  return url.pathname + url.search;
}
