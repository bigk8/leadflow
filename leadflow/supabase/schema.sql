-- =============================================================
-- LeadFlow CRM — Database Schema
-- PostgreSQL / Supabase
-- =============================================================
-- סדר יצירה:
--   1. Extensions + Helpers
--   2. Enums
--   3. Core tables (leads, calls, tasks, tags, lead_tags)
--   4. Indexes
--   5. Row Level Security
--   6. Triggers (updated_at)
-- =============================================================


-- ─────────────────────────────────────────────────────────────
-- 0. Extensions
-- ─────────────────────────────────────────────────────────────

-- UUID generation (כבר קיים ב-Supabase, אבל מוסיפים למקרה)
create extension if not exists "pgcrypto";

-- full-text search בעברית ואנגלית
create extension if not exists "unaccent";


-- ─────────────────────────────────────────────────────────────
-- 1. Helper: auto-update updated_at
-- ─────────────────────────────────────────────────────────────

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ─────────────────────────────────────────────────────────────
-- 2. Enums
-- ─────────────────────────────────────────────────────────────

-- סטטוס ליד בפייפליין המכירה
create type public.lead_status as enum (
  'new',          -- ליד חדש, טרם טופל
  'contacted',    -- יצרנו קשר ראשוני
  'meeting',      -- נקבעה פגישה / בתהליך פגישות
  'proposal',     -- הצעת מחיר נשלחה
  'negotiation',  -- בשלב משא ומתן
  'closed_won',   -- עסקה נסגרה בהצלחה
  'closed_lost'   -- עסקה אבדה
);

-- עדיפות ליד
create type public.lead_priority as enum (
  'low',
  'medium',
  'high'
);

-- סוג אינטראקציה בשיחה / פגישה
create type public.call_type as enum (
  'call_outbound',   -- שיחה יוצאת
  'call_inbound',    -- שיחה נכנסת
  'meeting',         -- פגישה פיזית
  'video',           -- שיחת וידאו
  'email',           -- מייל
  'whatsapp',        -- וואטסאפ
  'other'            -- אחר
);

-- תוצאת שיחה
create type public.call_outcome as enum (
  'no_answer',       -- לא ענה
  'left_message',    -- השארתי הודעה
  'callback',        -- ביקש להתקשר בחזרה
  'interested',      -- מעוניין
  'not_interested',  -- לא מעוניין
  'meeting_set',     -- נקבעה פגישה
  'deal_closed',     -- עסקה נסגרה
  'other'
);

-- סטטוס משימה
create type public.task_status as enum (
  'pending',     -- ממתינה
  'done',        -- בוצעה
  'cancelled'    -- בוטלה
);

-- עדיפות משימה
create type public.task_priority as enum (
  'low',
  'medium',
  'high',
  'urgent'
);


-- ─────────────────────────────────────────────────────────────
-- 3. Tables
-- ─────────────────────────────────────────────────────────────

-- ── 3.1  leads ───────────────────────────────────────────────

create table public.leads (
  -- identity
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,

  -- contact info
  first_name  text        not null,
  last_name   text        not null,
  email       text,
  phone       text,
  company     text,
  position    text,                          -- תפקיד בחברה
  website     text,

  -- pipeline
  status      public.lead_status    not null default 'new',
  priority    public.lead_priority  not null default 'medium',
  source      text,                          -- מקור הליד: פייסבוק, המלצה, אתר...
  deal_value  numeric(12, 2),               -- ערך עסקה משוער (₪)

  -- content
  notes       text,                          -- הערות חופשיות

  -- dates
  next_follow_up_at  timestamptz,           -- מועד מעקב הבא
  closed_at          timestamptz,           -- מועד סגירת עסקה (won/lost)

  -- meta
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- favorites
  is_favorite boolean     not null default false,
  is_irrelevant boolean   not null default false,

  -- constraints
  constraint leads_email_format
    check (email is null or email ~* '^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$'),
  constraint leads_deal_value_positive
    check (deal_value is null or deal_value >= 0)
);

comment on table  public.leads              is 'טבלת הלידים הראשית של המערכת';
comment on column public.leads.user_id      is 'המשתמש הבעלים של הליד';
comment on column public.leads.first_name   is 'שם פרטי';
comment on column public.leads.last_name    is 'שם משפחה';
comment on column public.leads.email        is 'כתובת אימייל';
comment on column public.leads.phone        is 'מספר טלפון';
comment on column public.leads.company      is 'שם החברה';
comment on column public.leads.position     is 'תפקיד בחברה';
comment on column public.leads.website      is 'אתר האינטרנט';
comment on column public.leads.status       is 'סטטוס הליד בפייפליין';
comment on column public.leads.priority     is 'עדיפות טיפול בליד';
comment on column public.leads.source       is 'מקור הגעת הליד (פייסבוק, המלצה, אתר וכו)';
comment on column public.leads.deal_value   is 'שווי משוער של העסקה בשקלים';
comment on column public.leads.notes        is 'הערות חופשיות על הליד';
comment on column public.leads.next_follow_up_at is 'מועד המעקב הבא המתוכנן';
comment on column public.leads.closed_at    is 'מועד סגירת העסקה (ניצחון או הפסד)';


-- ── 3.2  calls ───────────────────────────────────────────────

create table public.calls (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  lead_id     uuid        not null references public.leads(id) on delete cascade,

  -- call details
  type        public.call_type     not null default 'call_outbound',
  outcome     public.call_outcome,
  duration_seconds  integer,                -- אורך השיחה בשניות
  called_at   timestamptz not null default now(),  -- מועד השיחה/אינטראקציה

  -- content
  summary     text,                          -- תקציר השיחה
  notes       text,                          -- הערות נוספות

  -- follow-up שנוצר מהשיחה
  follow_up_at  timestamptz,               -- האם נקבע מעקב?

  -- meta
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint calls_duration_positive
    check (duration_seconds is null or duration_seconds >= 0)
);

comment on table  public.calls                    is 'היסטוריית שיחות ואינטראקציות עם לידים';
comment on column public.calls.lead_id            is 'הליד שאיתו התבצעה האינטראקציה';
comment on column public.calls.type               is 'סוג האינטראקציה (שיחה, פגישה, מייל...)';
comment on column public.calls.outcome            is 'תוצאת האינטראקציה';
comment on column public.calls.duration_seconds   is 'אורך השיחה בשניות';
comment on column public.calls.called_at          is 'מועד ביצוע האינטראקציה';
comment on column public.calls.summary            is 'תקציר קצר של השיחה';
comment on column public.calls.notes              is 'הערות מפורטות';
comment on column public.calls.follow_up_at       is 'מועד מעקב שנקבע כתוצאה מהשיחה';


-- ── 3.3  tasks ───────────────────────────────────────────────

create table public.tasks (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  lead_id     uuid        references public.leads(id) on delete set null,  -- אופציונלי

  -- task info
  title       text        not null,
  description text,
  status      public.task_status    not null default 'pending',
  priority    public.task_priority  not null default 'medium',

  -- timing
  due_at      timestamptz,                   -- מועד יעד לסיום
  done_at     timestamptz,                   -- מועד ביצוע בפועל

  -- meta
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint tasks_title_not_empty
    check (trim(title) <> '')
);

comment on table  public.tasks             is 'משימות ומעקבים (follow-ups)';
comment on column public.tasks.lead_id     is 'הליד הקשור למשימה (אופציונלי)';
comment on column public.tasks.title       is 'כותרת המשימה';
comment on column public.tasks.description is 'תיאור מפורט של המשימה';
comment on column public.tasks.status      is 'סטטוס המשימה';
comment on column public.tasks.priority    is 'עדיפות המשימה';
comment on column public.tasks.due_at      is 'מועד יעד לסיום המשימה';
comment on column public.tasks.done_at     is 'מועד הסיום בפועל';


-- ── 3.4  tags ────────────────────────────────────────────────

create table public.tags (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,

  name        text        not null,
  color       text        not null default '#6366f1', -- hex color לתצוגה

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint tags_name_not_empty
    check (trim(name) <> ''),
  constraint tags_color_format
    check (color ~* '^#[0-9a-f]{6}$'),
  constraint tags_unique_name_per_user
    unique (user_id, name)
);

comment on table  public.tags        is 'תגיות לסיווג לידים';
comment on column public.tags.name   is 'שם התגית (ייחודי למשתמש)';
comment on column public.tags.color  is 'צבע התגית בפורמט hex (#rrggbb)';


-- ── 3.5  lead_tags  (junction table) ─────────────────────────

create table public.lead_tags (
  lead_id  uuid not null references public.leads(id) on delete cascade,
  tag_id   uuid not null references public.tags(id)  on delete cascade,

  created_at timestamptz not null default now(),

  primary key (lead_id, tag_id)
);

comment on table public.lead_tags is 'קשר רב-לרב בין לידים לתגיות';


-- ─────────────────────────────────────────────────────────────
-- 4. Triggers — auto updated_at
-- ─────────────────────────────────────────────────────────────

create trigger leads_updated_at
  before update on public.leads
  for each row execute function public.handle_updated_at();

create trigger calls_updated_at
  before update on public.calls
  for each row execute function public.handle_updated_at();

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();

create trigger tags_updated_at
  before update on public.tags
  for each row execute function public.handle_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 5. Indexes
-- ─────────────────────────────────────────────────────────────

-- leads
create index idx_leads_user_id         on public.leads(user_id);
create index idx_leads_status          on public.leads(user_id, status);
create index idx_leads_priority        on public.leads(user_id, priority);
create index idx_leads_is_favorite     on public.leads(user_id, is_favorite) where is_favorite = true;
create index idx_leads_next_follow_up  on public.leads(user_id, next_follow_up_at)
  where next_follow_up_at is not null;
create index idx_leads_created_at      on public.leads(user_id, created_at desc);
create index idx_leads_deal_value      on public.leads(user_id, deal_value desc)
  where deal_value is not null;

-- full-text search על שם + חברה
create index idx_leads_fts on public.leads
  using gin (
    to_tsvector('simple',
      coalesce(first_name, '') || ' ' ||
      coalesce(last_name,  '') || ' ' ||
      coalesce(company,    '') || ' ' ||
      coalesce(email,      '') || ' ' ||
      coalesce(phone,      '')
    )
  );

-- calls
create index idx_calls_lead_id    on public.calls(lead_id);
create index idx_calls_user_id    on public.calls(user_id);
create index idx_calls_called_at  on public.calls(lead_id, called_at desc);

-- tasks
create index idx_tasks_user_id  on public.tasks(user_id);
create index idx_tasks_lead_id  on public.tasks(lead_id) where lead_id is not null;
create index idx_tasks_due_at   on public.tasks(user_id, due_at)
  where status = 'pending' and due_at is not null;
create index idx_tasks_status   on public.tasks(user_id, status);

-- tags
create index idx_tags_user_id on public.tags(user_id);

-- lead_tags
create index idx_lead_tags_tag_id  on public.lead_tags(tag_id);
create index idx_lead_tags_lead_id on public.lead_tags(lead_id);


-- ─────────────────────────────────────────────────────────────
-- 6. Row Level Security (RLS)
-- ─────────────────────────────────────────────────────────────

-- הפעל RLS על כל הטבלאות
alter table public.leads     enable row level security;
alter table public.calls     enable row level security;
alter table public.tasks     enable row level security;
alter table public.tags      enable row level security;
alter table public.lead_tags enable row level security;


-- ── 6.1 leads policies ───────────────────────────────────────

create policy "leads: select own"
  on public.leads for select
  using (auth.uid() = user_id);

create policy "leads: insert own"
  on public.leads for insert
  with check (auth.uid() = user_id);

create policy "leads: update own"
  on public.leads for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "leads: delete own"
  on public.leads for delete
  using (auth.uid() = user_id);


-- ── 6.2 calls policies ───────────────────────────────────────

create policy "calls: select own"
  on public.calls for select
  using (auth.uid() = user_id);

create policy "calls: insert own"
  on public.calls for insert
  with check (auth.uid() = user_id);

create policy "calls: update own"
  on public.calls for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "calls: delete own"
  on public.calls for delete
  using (auth.uid() = user_id);


-- ── 6.3 tasks policies ───────────────────────────────────────

create policy "tasks: select own"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "tasks: insert own"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "tasks: update own"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tasks: delete own"
  on public.tasks for delete
  using (auth.uid() = user_id);


-- ── 6.4 tags policies ────────────────────────────────────────

create policy "tags: select own"
  on public.tags for select
  using (auth.uid() = user_id);

create policy "tags: insert own"
  on public.tags for insert
  with check (auth.uid() = user_id);

create policy "tags: update own"
  on public.tags for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tags: delete own"
  on public.tags for delete
  using (auth.uid() = user_id);


-- ── 6.5 lead_tags policies ───────────────────────────────────
-- lead_tags אין עמודת user_id — מוודאים דרך leads

create policy "lead_tags: select own"
  on public.lead_tags for select
  using (
    exists (
      select 1 from public.leads
      where id = lead_tags.lead_id and user_id = auth.uid()
    )
  );

create policy "lead_tags: insert own"
  on public.lead_tags for insert
  with check (
    exists (
      select 1 from public.leads
      where id = lead_tags.lead_id and user_id = auth.uid()
    )
  );

create policy "lead_tags: delete own"
  on public.lead_tags for delete
  using (
    exists (
      select 1 from public.leads
      where id = lead_tags.lead_id and user_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────────────────────────
-- 7. Helper Views (אופציונלי — נוח לשאילתות)
-- ─────────────────────────────────────────────────────────────

-- תצוגה: ליד + מספר שיחות + שיחה אחרונה
create or replace view public.leads_summary as
select
  l.*,
  l.first_name || ' ' || l.last_name as full_name,
  count(distinct c.id)               as calls_count,
  max(c.called_at)                   as last_call_at,
  count(distinct t.id) filter (
    where t.status = 'pending'
  )                                  as pending_tasks_count
from public.leads l
left join public.calls c on c.lead_id = l.id
left join public.tasks t on t.lead_id = l.id
group by l.id;

comment on view public.leads_summary is 'תצוגת לידים מורחבת עם סטטיסטיקות שיחות ומשימות';


-- ─────────────────────────────────────────────────────────────
-- 8. Seed Data — ערכי דוגמה (אופציונלי, למחיקה בפרודקשן)
-- ─────────────────────────────────────────────────────────────

-- ביטול הסימון להרצה:
/*
insert into public.tags (user_id, name, color)
values
  (auth.uid(), 'VIP',        '#f59e0b'),
  (auth.uid(), 'קר',          '#6366f1'),
  (auth.uid(), 'חם',          '#ef4444'),
  (auth.uid(), 'ממתין',       '#8b5cf6'),
  (auth.uid(), 'המלצה',       '#10b981');
*/
