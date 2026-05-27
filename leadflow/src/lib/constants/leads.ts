import type { LeadStatus, LeadPriority } from "@/types/database.types";

/* ─── Status ─────────────────────────────────────────────────────────────── */

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new:          "חדש",
  contacted:    "יצרנו קשר",
  meeting:      "פגישה",
  proposal:     "הצעת מחיר",
  negotiation:  "משא ומתן",
  closed_won:   "נסגר ✅",
  closed_lost:  "אבד ❌",
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  new:          "bg-slate-100  text-slate-700  dark:bg-slate-800  dark:text-slate-300",
  contacted:    "bg-blue-100   text-blue-700   dark:bg-blue-900/40  dark:text-blue-300",
  meeting:      "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  proposal:     "bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300",
  negotiation:  "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  closed_won:   "bg-green-100  text-green-700  dark:bg-green-900/40  dark:text-green-300",
  closed_lost:  "bg-red-100    text-red-700    dark:bg-red-900/40    dark:text-red-300",
};

/* ─── Priority ───────────────────────────────────────────────────────────── */

export const PRIORITY_LABELS: Record<LeadPriority, string> = {
  low:    "נמוכה",
  medium: "בינונית",
  high:   "גבוהה",
};

export const PRIORITY_COLORS: Record<LeadPriority, string> = {
  low:    "text-slate-500",
  medium: "text-amber-500",
  high:   "text-red-500",
};

export const PRIORITY_DOT: Record<LeadPriority, string> = {
  low:    "bg-slate-400",
  medium: "bg-amber-400",
  high:   "bg-red-500",
};

/* ─── Sources list ───────────────────────────────────────────────────────── */

export const LEAD_SOURCES = [
  "פייסבוק",
  "גוגל",
  "אינסטגרם",
  "לינקדאין",
  "המלצה",
  "אתר האינטרנט",
  "תערוכה / אירוע",
  "שיחה קרה",
  "אחר",
] as const;

/* ─── Pipeline order (for kanban / sorting) ─────────────────────────────── */

export const PIPELINE_ORDER: LeadStatus[] = [
  "new",
  "contacted",
  "meeting",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
];
