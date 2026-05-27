import type { ExportColumn } from "@/components/ui/export-button";
import type { CallType, CallOutcome } from "@/types/database.types";
import type { EnrichedCall } from "@/components/calls/CallsTable";
import { formatDateShort, formatTime } from "@/lib/utils";

const CALL_TYPE_LABELS: Record<CallType, string> = {
  call_outbound: "שיחה יוצאת",
  call_inbound:  "שיחה נכנסת",
  meeting:       "פגישה",
  video:         "וידאו",
  email:         "אימייל",
  whatsapp:      "וואטסאפ",
  other:         "אחר",
};

const OUTCOME_LABELS: Record<CallOutcome, string> = {
  no_answer:      "לא ענה",
  left_message:   "השארתי הודעה",
  callback:       "ביקש חזרה",
  interested:     "מעוניין",
  not_interested: "לא מעוניין",
  meeting_set:    "נקבעה פגישה",
  deal_closed:    "עסקה נסגרה",
  other:          "אחר",
};

export const CALLS_EXPORT_COLUMNS: ExportColumn<EnrichedCall>[] = [
  {
    header: "תאריך",
    key:    "called_at",
    width:  12,
    format: (v) => formatDateShort(v as string),
  },
  {
    header: "שעה",
    key:    "called_at",
    width:  8,
    format: (v) => formatTime(v as string),
  },
  { header: "שם פרטי",  key: "lead_first_name", width: 14 },
  { header: "שם משפחה", key: "lead_last_name",  width: 14 },
  { header: "חברה",     key: "lead_company",    width: 20 },
  {
    header: "סוג שיחה",
    key:    "type",
    width:  14,
    format: (v) => CALL_TYPE_LABELS[v as CallType] ?? String(v),
  },
  {
    header: "תוצאה",
    key:    "outcome",
    width:  16,
    format: (v) => (v ? OUTCOME_LABELS[v as CallOutcome] ?? String(v) : ""),
  },
  {
    header: "אורך (דקות)",
    key:    "duration_seconds",
    width:  12,
    format: (v) => (v != null ? Math.round(Number(v) / 60) : ""),
  },
  { header: "תקציר",   key: "summary",      width: 35 },
  { header: "הערות",   key: "notes",        width: 40 },
  {
    header: "מעקב נקבע",
    key:    "follow_up_at",
    width:  14,
    format: (v) => (v ? formatDateShort(v as string) : ""),
  },
];
