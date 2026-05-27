/**
 * database.types.ts
 *
 * טייפים אלה נוצרו בהתאמה לסכמה ב- supabase/schema.sql
 *
 * לאחר הרצת הסכמה ב-Supabase, עדכן אוטומטית:
 *
 *   npx supabase gen types typescript \
 *     --project-id <YOUR_PROJECT_ID> \
 *     > src/types/database.types.ts
 *
 * או עם CLI מקומי:
 *
 *   npx supabase gen types typescript \
 *     --local \
 *     > src/types/database.types.ts
 */

/* ─── Enums ─────────────────────────────────────────────────────────────── */

export type LeadStatus =
  | "new"
  | "contacted"
  | "meeting"
  | "proposal"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

export type LeadPriority = "low" | "medium" | "high";

export type CallType =
  | "call_outbound"
  | "call_inbound"
  | "meeting"
  | "video"
  | "email"
  | "whatsapp"
  | "other";

export type CallOutcome =
  | "no_answer"
  | "left_message"
  | "callback"
  | "interested"
  | "not_interested"
  | "meeting_set"
  | "deal_closed"
  | "other";

export type TaskStatus   = "pending" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

/* ─── Row types ─────────────────────────────────────────────────────────── */

export interface LeadRow {
  id:                string;
  user_id:           string;
  first_name:        string;
  last_name:         string;
  email:             string | null;
  phone:             string | null;
  company:           string | null;
  position:          string | null;
  website:           string | null;
  status:            LeadStatus;
  priority:          LeadPriority;
  source:            string | null;
  deal_value:        number | null;
  notes:             string | null;
  next_follow_up_at: string | null;
  closed_at:         string | null;
  created_at:        string;
  updated_at:        string;
  is_favorite:       boolean;
  is_irrelevant:     boolean;
}

export interface CallRow {
  id:               string;
  user_id:          string;
  lead_id:          string;
  type:             CallType;
  outcome:          CallOutcome | null;
  duration_seconds: number | null;
  called_at:        string;
  summary:          string | null;
  notes:            string | null;
  follow_up_at:     string | null;
  created_at:       string;
  updated_at:       string;
}

export interface TaskRow {
  id:          string;
  user_id:     string;
  lead_id:     string | null;
  title:       string;
  description: string | null;
  status:      TaskStatus;
  priority:    TaskPriority;
  due_at:      string | null;
  done_at:     string | null;
  created_at:  string;
  updated_at:  string;
}

export interface TagRow {
  id:         string;
  user_id:    string;
  name:       string;
  color:      string;
  created_at: string;
  updated_at: string;
}

export interface LeadTagRow {
  lead_id:    string;
  tag_id:     string;
  created_at: string;
}

/* ─── View types ────────────────────────────────────────────────────────── */

export interface LeadSummaryRow extends LeadRow {
  full_name:           string;
  calls_count:         number;
  last_call_at:        string | null;
  pending_tasks_count: number;
}

/* ─── Insert types ──────────────────────────────────────────────────────── */

export type LeadInsert = Omit<LeadRow, "id" | "created_at" | "updated_at">;
export type CallInsert = Omit<CallRow, "id" | "created_at" | "updated_at">;
export type TaskInsert = Omit<TaskRow, "id" | "created_at" | "updated_at">;
export type TagInsert  = Omit<TagRow,  "id" | "created_at" | "updated_at">;

/* ─── Update types ──────────────────────────────────────────────────────── */

export type LeadUpdate = Partial<LeadInsert>;
export type CallUpdate = Partial<CallInsert>;
export type TaskUpdate = Partial<TaskInsert>;
export type TagUpdate  = Partial<TagInsert>;

/* ─── Database shape ────────────────────────────────────────────────────── */

export type Database = {
  public: {
    Tables: {
      leads: {
        Row:           LeadRow;
        Insert:        LeadInsert;
        Update:        LeadUpdate;
        Relationships: [];
      };
      calls: {
        Row:           CallRow;
        Insert:        CallInsert;
        Update:        CallUpdate;
        Relationships: [];
      };
      tasks: {
        Row:           TaskRow;
        Insert:        TaskInsert;
        Update:        TaskUpdate;
        Relationships: [];
      };
      tags: {
        Row:           TagRow;
        Insert:        TagInsert;
        Update:        TagUpdate;
        Relationships: [];
      };
      lead_tags: {
        Row:           LeadTagRow;
        Insert:        Omit<LeadTagRow, "created_at">;
        Update:        Partial<Omit<LeadTagRow, "created_at">>;
        Relationships: [];
      };
    };
    Views: {
      leads_summary: {
        Row:           LeadSummaryRow;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    /* eslint-disable-next-line @typescript-eslint/no-empty-object-type */
    Enums: {
      lead_status:   LeadStatus;
      lead_priority: LeadPriority;
      call_type:     CallType;
      call_outcome:  CallOutcome;
      task_status:   TaskStatus;
      task_priority: TaskPriority;
    };
  };
};
