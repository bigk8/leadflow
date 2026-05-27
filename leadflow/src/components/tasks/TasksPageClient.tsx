"use client";

import { useState, useTransition, useOptimistic } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Plus, CheckCircle2, Circle, XCircle, Flag, Loader2,
  CalendarClock, Link2, CheckSquare,
} from "lucide-react";
import { formatDistanceToNow, isPast, isToday, format } from "date-fns";
import { he } from "date-fns/locale";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { TaskRow, TaskPriority, TaskStatus, LeadRow } from "@/types/database.types";

import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label }    from "@/components/ui/label";
import { Badge }    from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

/* ─── Types ─────────────────────────────────────────────────────────────── */

export interface EnrichedTask extends TaskRow {
  lead_name: string | null;
}

/* ─── Constants ─────────────────────────────────────────────────────────── */

const PRIORITY_CFG: Record<TaskPriority, { label: string; color: string; bg: string; dot: string }> = {
  low:    { label: "נמוכה",  color: "text-slate-600  dark:text-slate-400", bg: "bg-slate-100  dark:bg-slate-800",    dot: "bg-slate-400"  },
  medium: { label: "בינונית",color: "text-amber-600  dark:text-amber-400", bg: "bg-amber-50   dark:bg-amber-950/40", dot: "bg-amber-400"  },
  high:   { label: "גבוהה",  color: "text-orange-600 dark:text-orange-400",bg: "bg-orange-50  dark:bg-orange-950/40",dot: "bg-orange-500" },
  urgent: { label: "דחופה",  color: "text-red-600    dark:text-red-400",   bg: "bg-red-50     dark:bg-red-950/40",   dot: "bg-red-500"    },
};

const STATUS_FILTERS: { value: "all" | TaskStatus; label: string }[] = [
  { value: "all",       label: "הכל"    },
  { value: "pending",   label: "ממתין"  },
  { value: "done",      label: "בוצע"   },
  { value: "cancelled", label: "בוטל"   },
];

/* ─── Schema ─────────────────────────────────────────────────────────────── */

const taskSchema = z.object({
  title:       z.string().min(2, "כותרת חייבת להכיל לפחות 2 תווים").max(200),
  description: z.string().max(1000).optional(),
  priority:    z.enum(["low","medium","high","urgent"]).default("medium"),
  due_at:      z.string().optional().nullable(),
  lead_id:     z.string().optional().nullable(),
});
type TaskFormData = z.infer<typeof taskSchema>;

/* ─── New Task Dialog ────────────────────────────────────────────────────── */

function NewTaskDialog({
  open,
  onClose,
  userId,
  leads,
  onCreated,
}: {
  open:      boolean;
  onClose:   () => void;
  userId:    string;
  leads:     Pick<LeadRow, "id" | "first_name" | "last_name">[];
  onCreated: (task: EnrichedTask) => void;
}) {
  const supabase = createClient();
  const { register, handleSubmit, setValue, watch, reset,
    formState: { isSubmitting, errors } } = useForm<TaskFormData>({
    resolver:      zodResolver(taskSchema),
    defaultValues: { priority: "medium" },
  });

  const selectedPriority = watch("priority");

  const onSubmit = async (data: TaskFormData) => {
    const { data: created, error } = await supabase
      .from("tasks")
      .insert([{
        user_id:     userId,
        title:       data.title.trim(),
        description: data.description?.trim() || null,
        priority:    data.priority,
        status:      "pending",
        due_at:      data.due_at ? new Date(data.due_at).toISOString() : null,
        lead_id:     data.lead_id || null,
      }] as any)
      .select()
      .single() as unknown as { data: TaskRow | null; error: unknown };

    if (error || !created) { toast.error("שגיאה ביצירת המשימה"); return; }

    const foundLead = data.lead_id ? leads.find((l) => l.id === data.lead_id) : undefined;
    const leadName  = foundLead ? `${foundLead.first_name} ${foundLead.last_name}` : null;

    onCreated({ ...(created as TaskRow), lead_name: leadName });
    toast.success("המשימה נוצרה!");
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-primary" />
            </div>
            משימה חדשה
          </DialogTitle>
          <DialogDescription>הוסף משימה חדשה לרשימה שלך</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">כותרת *</Label>
            <Input
              id="title"
              placeholder="לדוגמה: שלח הצעת מחיר..."
              className={cn("h-10", errors.title && "border-destructive")}
              autoFocus
              {...register("title")}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-muted-foreground" />
              עדיפות
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(PRIORITY_CFG) as TaskPriority[]).map((p) => {
                const cfg = PRIORITY_CFG[p];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setValue("priority", p, { shouldDirty: true })}
                    className={cn(
                      "py-2 px-1 rounded-lg border-2 text-xs font-semibold transition-all",
                      selectedPriority === p
                        ? `border-current ${cfg.color} ${cfg.bg}`
                        : "border-border text-muted-foreground hover:bg-muted/40"
                    )}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <Label htmlFor="due_at">
              מועד יעד
              <span className="text-muted-foreground font-normal ms-1 text-xs">אופציונלי</span>
            </Label>
            <Input id="due_at" type="datetime-local" dir="ltr" className="h-9 text-sm" {...register("due_at")} />
          </div>

          {/* Lead link */}
          {leads.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="lead_id">
                קשור לליד
                <span className="text-muted-foreground font-normal ms-1 text-xs">אופציונלי</span>
              </Label>
              <select
                id="lead_id"
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                {...register("lead_id")}
              >
                <option value="">ללא קשר לליד</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.first_name} {l.last_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">
              תיאור
              <span className="text-muted-foreground font-normal ms-1 text-xs">אופציונלי</span>
            </Label>
            <Textarea id="description" placeholder="פרטים נוספים..." rows={3} className="resize-none text-sm" {...register("description")} />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" disabled={isSubmitting} className="gap-2 flex-1">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
              {isSubmitting ? "יוצר..." : "צור משימה"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>ביטול</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Due label ─────────────────────────────────────────────────────────── */

function DueLabel({ due_at, status }: { due_at: string | null; status: TaskStatus }) {
  if (!due_at) return null;
  const d = new Date(due_at);
  const done = status !== "pending";
  const overdue = !done && isPast(d) && !isToday(d);
  const today   = !done && isToday(d);

  return (
    <span
      className={cn(
        "flex items-center gap-1 text-xs",
        done     ? "text-muted-foreground/50 line-through" :
        overdue  ? "text-red-600 dark:text-red-400 font-medium" :
        today    ? "text-amber-600 dark:text-amber-400 font-medium" :
                   "text-muted-foreground"
      )}
    >
      <CalendarClock className="w-3 h-3 flex-shrink-0" />
      {overdue
        ? `פג תוקף — ${formatDistanceToNow(d, { addSuffix: true, locale: he })}`
        : today
        ? `היום, ${format(d, "HH:mm")}`
        : format(d, "d/M/yy HH:mm")}
    </span>
  );
}

/* ─── Task row ───────────────────────────────────────────────────────────── */

function TaskRow({
  task,
  onToggleDone,
  onCancel,
}: {
  task:         EnrichedTask;
  onToggleDone: (id: string, current: TaskStatus) => void;
  onCancel:     (id: string) => void;
}) {
  const cfg     = PRIORITY_CFG[task.priority];
  const isDone  = task.status === "done";
  const isCancelled = task.status === "cancelled";

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border transition-colors",
        isDone || isCancelled
          ? "border-border/30 bg-muted/20 opacity-60"
          : "border-border/60 bg-card hover:bg-muted/20"
      )}
    >
      {/* Toggle button */}
      <button
        onClick={() => !isCancelled && onToggleDone(task.id, task.status)}
        disabled={isCancelled}
        className={cn(
          "mt-0.5 flex-shrink-0 transition-colors",
          isDone
            ? "text-green-500 hover:text-green-600"
            : isCancelled
            ? "text-muted-foreground/30 cursor-not-allowed"
            : "text-muted-foreground hover:text-green-500"
        )}
        title={isDone ? "סמן כממתין" : "סמן כבוצע"}
      >
        {isDone ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : isCancelled ? (
          <XCircle className="w-5 h-5" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className={cn("text-sm font-medium leading-snug", isDone && "line-through text-muted-foreground")}>
          {task.title}
        </p>

        {task.description && (
          <p className="text-xs text-muted-foreground truncate">{task.description}</p>
        )}

        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 pt-0.5">
          <DueLabel due_at={task.due_at} status={task.status} />
          {task.lead_name && (
            <Link
              href={`/leads/${task.lead_id}`}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Link2 className="w-3 h-3" />
              {task.lead_name}
            </Link>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", cfg.bg, cfg.color)}>
          {cfg.label}
        </span>
        {task.status === "pending" && (
          <button
            onClick={() => onCancel(task.id)}
            className="text-muted-foreground/40 hover:text-destructive transition-colors"
            title="בטל משימה"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */

export function TasksPageClient({
  initialTasks,
  userId,
  leads,
}: {
  initialTasks: EnrichedTask[];
  userId:       string;
  leads:        Pick<LeadRow, "id" | "first_name" | "last_name">[];
}) {
  const supabase = createClient();
  const router   = useRouter();

  const [tasks,      setTasks]      = useState<EnrichedTask[]>(initialTasks);
  const [filter,     setFilter]     = useState<"all" | TaskStatus>("pending");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [,           startTransition] = useTransition();

  /* ── filtered list ────────────────────────────────────────────────────── */

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  const pendingCount   = tasks.filter((t) => t.status === "pending").length;
  const overdueCount   = tasks.filter(
    (t) => t.status === "pending" && t.due_at && isPast(new Date(t.due_at)) && !isToday(new Date(t.due_at))
  ).length;

  /* ── actions ──────────────────────────────────────────────────────────── */

  const toggleDone = async (id: string, current: TaskStatus) => {
    const next: TaskStatus = current === "done" ? "pending" : "done";

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: next, done_at: next === "done" ? new Date().toISOString() : null } : t
      )
    );

    const { error } = await (supabase.from("tasks") as any)
      .update({ status: next, done_at: next === "done" ? new Date().toISOString() : null })
      .eq("id", id);

    if (error) {
      toast.error("שגיאה בעדכון המשימה");
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: current } : t))
      );
    }
  };

  const cancelTask = async (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "cancelled" } : t)));
    const { error } = await (supabase.from("tasks") as any).update({ status: "cancelled" }).eq("id", id);
    if (error) {
      toast.error("שגיאה בביטול המשימה");
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "pending" } : t)));
    }
  };

  const handleCreated = (task: EnrichedTask) => {
    setTasks((prev) => [task, ...prev]);
    startTransition(() => router.refresh());
  };

  /* ── sort: pending (overdue first) → done → cancelled ────────────────── */

  const sorted = [...filtered].sort((a, b) => {
    if (a.status !== b.status) {
      const order = { pending: 0, done: 1, cancelled: 2 };
      return order[a.status] - order[b.status];
    }
    if (a.status === "pending") {
      if (a.due_at && b.due_at) return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
      if (a.due_at) return -1;
      if (b.due_at) return  1;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  /* ── render ─────────────────────────────────────────────────────────────── */

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">משימות</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {pendingCount} ממתינות
            {overdueCount > 0 && (
              <span className="text-red-500 font-medium"> · {overdueCount} באיחור</span>
            )}
          </p>
        </div>
        <Button className="gap-2 flex-shrink-0" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          משימה חדשה
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-border/60 pb-0">
        {STATUS_FILTERS.map(({ value, label }) => {
          const count = value === "all" ? tasks.length : tasks.filter((t) => t.status === value).length;
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
                filter === value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
              <Badge
                variant={filter === value ? "default" : "secondary"}
                className="text-[10px] px-1.5 py-0 h-4"
              >
                {count}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* List */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-2">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">
                {filter === "pending" ? "אין משימות ממתינות" : "אין משימות"}
              </p>
              {filter === "pending" && (
                <Button
                  variant="link"
                  className="mt-1 text-sm"
                  onClick={() => setDialogOpen(true)}
                >
                  + הוסף משימה ראשונה
                </Button>
              )}
            </div>
          ) : (
            sorted.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggleDone={toggleDone}
                onCancel={cancelTask}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <NewTaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        userId={userId}
        leads={leads}
        onCreated={handleCreated}
      />
    </>
  );
}
