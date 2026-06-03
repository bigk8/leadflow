"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Phone, Plus, Pencil, Globe, Mail, Building2,
  Briefcase, Calendar, DollarSign, ArrowLeft,
  PhoneOutgoing, PhoneIncoming, Video, Users as UsersIcon,
  MessageSquare, MoreHorizontal, CheckSquare, Clock,
  CheckCircle2, XCircle, Trash2, Star,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

import { createClient } from "@/lib/supabase/client";
import { cn, formatCurrency, formatDateHe, formatDateShort, formatTime } from "@/lib/utils";
import {
  STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_DOT,
} from "@/lib/constants/leads";
import type { LeadRow, CallRow, TaskRow, LeadStatus, LeadPriority, CallType, TaskStatus } from "@/types/database.types";

import { Button }   from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LogCallDialog }     from "@/components/calls/LogCallDialog";
import { NewTaskDialog }     from "@/components/tasks/NewTaskDialog";
import { useRealtimeCalls }  from "@/hooks/useRealtimeCalls";
import { useRealtimeTasks }  from "@/hooks/useRealtimeTasks";

/* ─── Call type icon map ─────────────────────────────────────────────────── */

const CALL_TYPE_ICON: Record<CallType, React.ElementType> = {
  call_outbound: PhoneOutgoing,
  call_inbound:  PhoneIncoming,
  meeting:       UsersIcon,
  video:         Video,
  email:         Mail,
  whatsapp:      MessageSquare,
  other:         Phone,
};

const CALL_TYPE_LABEL: Record<CallType, string> = {
  call_outbound: "שיחה יוצאת",
  call_inbound:  "שיחה נכנסת",
  meeting:       "פגישה",
  video:         "וידאו",
  email:         "אימייל",
  whatsapp:      "וואטסאפ",
  other:         "אחר",
};

const CALL_TYPE_COLOR: Record<CallType, string> = {
  call_outbound: "bg-blue-100   text-blue-600   dark:bg-blue-950/40   dark:text-blue-400",
  call_inbound:  "bg-green-100  text-green-600  dark:bg-green-950/40  dark:text-green-400",
  meeting:       "bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
  video:         "bg-cyan-100   text-cyan-600   dark:bg-cyan-950/40   dark:text-cyan-400",
  email:         "bg-amber-100  text-amber-600  dark:bg-amber-950/40  dark:text-amber-400",
  whatsapp:      "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  other:         "bg-slate-100  text-slate-600  dark:bg-slate-800     dark:text-slate-400",
};

const OUTCOME_LABELS: Record<string, string> = {
  no_answer:      "לא ענה",
  left_message:   "השארתי הודעה",
  callback:       "ביקש חזרה",
  interested:     "מעוניין",
  not_interested: "לא מעוניין",
  meeting_set:    "נקבעה פגישה",
  deal_closed:    "עסקה נסגרה",
  other:          "אחר",
};

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function InfoRow({
  icon: Icon, label, value, href,
}: {
  icon:   React.ElementType;
  label:  string;
  value:  string | null | undefined;
  href?:  string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {href ? (
          <a
            href={href}
            className="text-sm font-medium hover:text-primary transition-colors truncate block"
            dir={href.startsWith("http") ? "ltr" : undefined}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium truncate">{value}</p>
        )}
      </div>
    </div>
  );
}

function CallCard({ call, onDelete }: { call: CallRow; onDelete: (id: string) => void }) {
  const Icon = CALL_TYPE_ICON[call.type];
  const ago  = formatDistanceToNow(new Date(call.called_at), { addSuffix: true, locale: he });

  return (
    <div className="flex gap-4 group">
      {/* Icon + line */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
          CALL_TYPE_COLOR[call.type]
        )}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="w-px flex-1 bg-border min-h-[16px]" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold">{CALL_TYPE_LABEL[call.type]}</span>
              {call.outcome && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {OUTCOME_LABELS[call.outcome] ?? call.outcome}
                </span>
              )}
              {call.duration_seconds && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.round(call.duration_seconds / 60)}′
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDateShort(call.called_at)} · {formatTime(call.called_at)} · {ago}
            </p>
          </div>

          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"
                className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(call.id)}
              >
                <Trash2 className="w-3.5 h-3.5 me-2" />
                מחק
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {call.summary && (
          <p className="text-sm font-medium mt-2">{call.summary}</p>
        )}
        {call.notes && (
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed whitespace-pre-line">
            {call.notes}
          </p>
        )}
        {call.follow_up_at && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-primary">
            <Calendar className="w-3 h-3" />
            מעקב נקבע ל-{formatDateHe(call.follow_up_at)}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({
  task, onToggle, onDelete,
}: {
  task:     TaskRow;
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const isDone     = task.status === "done";
  const isOverdue  = task.due_at && !isDone && new Date(task.due_at) < new Date();
  const PRIORITY_COLOR: Record<string, string> = {
    low:    "bg-slate-100  text-slate-600  dark:bg-slate-800 dark:text-slate-400",
    medium: "bg-amber-100  text-amber-700  dark:bg-amber-900/40 dark:text-amber-400",
    high:   "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
    urgent: "bg-red-100    text-red-700    dark:bg-red-900/40 dark:text-red-400",
  };
  const PRIORITY_LABEL: Record<string, string> = {
    low: "נמוכה", medium: "בינונית", high: "גבוהה", urgent: "דחופה",
  };

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-xl border transition-all group",
      isDone
        ? "bg-muted/20 border-border/50 opacity-60"
        : "bg-card border-border hover:border-border/80"
    )}>
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id, !isDone)}
        className="mt-0.5 flex-shrink-0"
        title={isDone ? "סמן כממתין" : "סמן כבוצע"}
      >
        {isDone
          ? <CheckCircle2 className="w-5 h-5 text-green-500" />
          : <div className="w-5 h-5 rounded-full border-2 border-border hover:border-primary transition-colors" />
        }
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium leading-tight",
          isDone && "line-through text-muted-foreground"
        )}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", PRIORITY_COLOR[task.priority])}>
            {PRIORITY_LABEL[task.priority]}
          </span>
          {task.due_at && (
            <span className={cn(
              "text-xs flex items-center gap-1",
              isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
            )}>
              <Calendar className="w-3 h-3" />
              {formatDateShort(task.due_at)}
              {isOverdue && " · באיחור"}
            </span>
          )}
          {task.done_at && (
            <span className="text-xs text-muted-foreground">
              בוצע {formatDistanceToNow(new Date(task.done_at), { addSuffix: true, locale: he })}
            </span>
          )}
        </div>
      </div>

      <DropdownMenu dir="rtl">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon"
            className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="w-3.5 h-3.5 me-2" />
            מחק
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/* ─── Props ─────────────────────────────────────────────────────────────── */

interface LeadDetailProps {
  lead:   LeadRow;
  calls:  CallRow[];
  tasks:  TaskRow[];
  userId: string;
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export function LeadDetail({
  lead: initialLead,
  calls: initialCalls,
  tasks: initialTasks,
  userId,
}: LeadDetailProps) {
  const router   = useRouter();
  const supabase = createClient();

  const [lead,  setLead]  = useState(initialLead);
  const [calls, setCalls] = useState(initialCalls);
  const [tasks, setTasks] = useState(initialTasks);

  const [logCallOpen,  setLogCallOpen]  = useState(false);
  const [newTaskOpen,  setNewTaskOpen]  = useState(false);
  const [isPending,    startTransition] = useTransition();

  /* ── Realtime — calls for this lead ─────────────────────────────────── */

  useRealtimeCalls({
    leadId:   lead.id,
    onInsert: (call) => setCalls((prev) => [call, ...prev]),
    onUpdate: (call) => setCalls((prev) => prev.map((c) => c.id === call.id ? call : c)),
    onDelete: (id)   => setCalls((prev) => prev.filter((c) => c.id !== id)),
  });

  /* ── Realtime — tasks for this lead ─────────────────────────────────── */

  useRealtimeTasks({
    leadId:   lead.id,
    onInsert: (task) => setTasks((prev) => [task, ...prev]),
    onUpdate: (task) => setTasks((prev) => prev.map((t) => t.id === task.id ? task as TaskRow : t)),
    onDelete: (id)   => setTasks((prev) => prev.filter((t) => t.id !== id)),
  });

  const displayName = `${lead.first_name} ${lead.last_name}`;

  /* ── Status / Priority quick-update ─────────────────────────────────── */

  const updateField = async <K extends "status" | "priority">(
    field: K,
    value: LeadRow[K]
  ) => {
    const { error } = await supabase
      .from("leads")
      .update({ [field]: value } as unknown as never)
      .eq("id", lead.id);

    if (error) { toast.error("שגיאה בעדכון"); return; }
    setLead((prev) => ({ ...prev, [field]: value }));
    toast.success("עודכן!");
  };

  /* ── Toggle favorite ──────────────────────────────────────────────────── */

  const handleToggleFavorite = async (isFavorite: boolean) => {
    const { error } = await supabase
      .from("leads")
      .update({ is_favorite: isFavorite } as unknown as never)
      .eq("id", lead.id);

    if (error) { toast.error("שגיאה בעדכון"); return; }
    setLead((prev) => ({ ...prev, is_favorite: isFavorite }));
    toast.success(isFavorite ? "נוסף להועדפים ⭐" : "הוסר מהעדפים");
  };

  /* ── Delete call ─────────────────────────────────────────────────────── */

  const deleteCall = async (callId: string) => {
    const { error } = await supabase.from("calls").delete().eq("id", callId);
    if (error) { toast.error("שגיאה במחיקה"); return; }
    setCalls((prev) => prev.filter((c) => c.id !== callId));
    toast.success("השיחה נמחקה");
  };

  /* ── Toggle task ─────────────────────────────────────────────────────── */

  const toggleTask = async (taskId: string, done: boolean) => {
    const now = done ? new Date().toISOString() : null;
    const { error } = await supabase
      .from("tasks")
      .update({ status: done ? "done" : "pending", done_at: now } as unknown as never)
      .eq("id", taskId);

    if (error) { toast.error("שגיאה בעדכון המשימה"); return; }
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: done ? "done" : "pending" as TaskStatus, done_at: now }
          : t
      )
    );
  };

  /* ── Delete task ─────────────────────────────────────────────────────── */

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) { toast.error("שגיאה במחיקה"); return; }
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    toast.success("המשימה נמחקה");
  };

  /* ── After log-call / new-task: refresh lists ────────────────────────── */

  const refreshCalls = async () => {
    const { data } = await supabase
      .from("calls")
      .select("*")
      .eq("lead_id", lead.id)
      .order("called_at", { ascending: false });
    if (data) setCalls(data as CallRow[]);
    // also refresh lead (follow_up_at may have changed)
    const { data: updated } = await supabase
      .from("leads").select("*").eq("id", lead.id).single();
    if (updated) setLead(updated as LeadRow);
  };

  const refreshTasks = async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false });
    if (data) setTasks(data as TaskRow[]);
  };

  const pendingTasksCount = tasks.filter((t) => t.status === "pending").length;

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Avatar + name */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-xl font-bold text-primary">
            {lead.first_name[0]}{lead.last_name[0]}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold truncate">{displayName}</h1>
            {(lead.position || lead.company) && (
              <p className="text-muted-foreground mt-0.5 text-sm">
                {[lead.position, lead.company].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>

        {/* Status + Priority quick select */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={lead.status}
            onValueChange={(v) => updateField("status", v as LeadStatus)}
          >
            <SelectTrigger className={cn(
              "h-9 w-auto min-w-[140px] text-xs font-semibold border-0 rounded-full px-3",
              STATUS_COLORS[lead.status]
            )}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(STATUS_LABELS) as [LeadStatus, string][]).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={lead.priority}
            onValueChange={(v) => updateField("priority", v as LeadPriority)}
          >
            <SelectTrigger className="h-9 w-auto min-w-[120px] text-xs font-medium">
              <span className={cn("w-2 h-2 rounded-full me-1.5", PRIORITY_DOT[lead.priority])} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["low","medium","high"] as LeadPriority[]).map((v) => (
                <SelectItem key={v} value={v}>
                  <span className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", PRIORITY_DOT[v])} />
                    {PRIORITY_LABELS[v]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Edit */}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/leads/${lead.id}/edit`}>
              <Pencil className="w-3.5 h-3.5 me-1.5" />
              עריכה
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Primary CTA ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button
          className="gap-2 shadow-sm"
          onClick={() => setLogCallOpen(true)}
        >
          <Phone className="w-4 h-4" />
          תעד שיחה / אינטראקציה
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setNewTaskOpen(true)}
        >
          <Plus className="w-4 h-4" />
          משימה חדשה
        </Button>
        {lead.phone && (
          <Button variant="outline" size="icon" asChild title="חייג">
            <a href={`tel:${lead.phone}`}>
              <Phone className="w-4 h-4" />
            </a>
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          title={lead.is_favorite ? "הסר מהעדפים" : "הוסף להעדפים"}
          onClick={() => handleToggleFavorite(!lead.is_favorite)}
        >
          <Star
            className="w-4 h-4"
            fill={lead.is_favorite ? "currentColor" : "none"}
          />
        </Button>
      </div>

      {/* ── Main content: 2-col ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: info card ─────────────────────────────────────────── */}
        <Card className="lg:col-span-1 h-fit border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              פרטי קשר
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow icon={Mail}      label="אימייל"  value={lead.email}    href={`mailto:${lead.email}`} />
            <InfoRow icon={Phone}     label="טלפון"   value={lead.phone}    href={`tel:${lead.phone}`} />
            <InfoRow icon={Building2} label="חברה"    value={lead.company} />
            <InfoRow icon={Briefcase} label="תפקיד"   value={lead.position} />
            <InfoRow icon={Globe}     label="אתר"     value={lead.website}  href={lead.website ?? undefined} />

            {(lead.email || lead.phone || lead.company || lead.position || lead.website) && (
              <Separator />
            )}

            {lead.deal_value && (
              <InfoRow
                icon={DollarSign}
                label="ערך עסקה"
                value={formatCurrency(lead.deal_value)}
              />
            )}
            {lead.source && (
              <InfoRow icon={ArrowLeft} label="מקור" value={lead.source} />
            )}
            {lead.next_follow_up_at && (
              <InfoRow
                icon={Calendar}
                label="מעקב הבא"
                value={formatDateHe(lead.next_follow_up_at)}
              />
            )}

            {lead.notes && (
              <>
                <Separator />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">הערות</p>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{lead.notes}</p>
                </div>
              </>
            )}

            <Separator />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>נוצר {formatDateHe(lead.created_at)}</p>
              <p>עודכן {formatDistanceToNow(new Date(lead.updated_at), { addSuffix: true, locale: he })}</p>
            </div>
          </CardContent>
        </Card>

        {/* ── Right: Tabs ──────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="calls" dir="rtl">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="calls" className="gap-2">
                <Phone className="w-3.5 h-3.5" />
                שיחות ({calls.length})
              </TabsTrigger>
              <TabsTrigger value="tasks" className="gap-2">
                <CheckSquare className="w-3.5 h-3.5" />
                משימות
                {pendingTasksCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {pendingTasksCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Calls tab */}
            <TabsContent value="calls" className="mt-0">
              {calls.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Phone className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                  <p className="font-medium">אין שיחות עדיין</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    תעד את השיחה הראשונה עם {lead.first_name}
                  </p>
                  <Button size="sm" className="gap-2" onClick={() => setLogCallOpen(true)}>
                    <Phone className="w-4 h-4" />
                    תעד שיחה ראשונה
                  </Button>
                </div>
              ) : (
                <div className="space-y-0">
                  {calls.map((call) => (
                    <CallCard key={call.id} call={call} onDelete={deleteCall} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tasks tab */}
            <TabsContent value="tasks" className="mt-0 space-y-2">
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <CheckSquare className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                  <p className="font-medium">אין משימות עדיין</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    צור משימה ראשונה עבור {lead.first_name}
                  </p>
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => setNewTaskOpen(true)}>
                    <Plus className="w-4 h-4" />
                    צור משימה
                  </Button>
                </div>
              ) : (
                <>
                  {/* Pending tasks first */}
                  {tasks.filter((t) => t.status === "pending").map((task) => (
                    <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                  ))}
                  {/* Divider if both */}
                  {tasks.some((t) => t.status === "pending") && tasks.some((t) => t.status !== "pending") && (
                    <div className="flex items-center gap-3 py-2">
                      <Separator className="flex-1" />
                      <span className="text-xs text-muted-foreground">הושלמו</span>
                      <Separator className="flex-1" />
                    </div>
                  )}
                  {/* Done tasks */}
                  {tasks.filter((t) => t.status !== "pending").map((task) => (
                    <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                  ))}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ── Dialogs ────────────────────────────────────────────────────── */}
      <LogCallDialog
        open={logCallOpen}
        onClose={() => setLogCallOpen(false)}
        onSuccess={refreshCalls}
        leadId={lead.id}
        userId={userId}
        leadName={displayName}
      />
      <NewTaskDialog
        open={newTaskOpen}
        onClose={() => setNewTaskOpen(false)}
        onSuccess={refreshTasks}
        leadId={lead.id}
        userId={userId}
        leadName={displayName}
      />
    </div>
  );
}
