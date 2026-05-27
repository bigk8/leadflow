import type { ExportColumn } from "@/components/ui/export-button";
import type { LeadRow, LeadStatus, LeadPriority } from "@/types/database.types";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants/leads";
import { formatDateShort, formatCurrency } from "@/lib/utils";

export const LEADS_EXPORT_COLUMNS: ExportColumn<LeadRow>[] = [
  { header: "שם פרטי",           key: "first_name",        width: 14 },
  { header: "שם משפחה",          key: "last_name",         width: 14 },
  { header: "חברה",              key: "company",            width: 20 },
  { header: "תפקיד",             key: "position",           width: 18 },
  { header: "אימייל",            key: "email",              width: 26 },
  { header: "טלפון",             key: "phone",              width: 16 },
  { header: "אתר",               key: "website",            width: 24 },
  {
    header: "סטטוס",
    key:    "status",
    width:  16,
    format: (v) => STATUS_LABELS[v as LeadStatus] ?? String(v),
  },
  {
    header: "עדיפות",
    key:    "priority",
    width:  12,
    format: (v) => PRIORITY_LABELS[v as LeadPriority] ?? String(v),
  },
  { header: "מקור",              key: "source",             width: 16 },
  {
    header: "ערך עסקה (₪)",
    key:    "deal_value",
    width:  16,
    format: (v) => (v != null ? Number(v) : ""),
  },
  { header: "הערות",             key: "notes",              width: 40 },
  {
    header: "מעקב הבא",
    key:    "next_follow_up_at",
    width:  16,
    format: (v) => (v ? formatDateShort(v as string) : ""),
  },
  {
    header: "תאריך יצירה",
    key:    "created_at",
    width:  14,
    format: (v) => formatDateShort(v as string),
  },
];
