"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CheckCircle2, Circle, Calendar, ArrowLeft,
  ClipboardList, Flag,
} from "lucide-react";
import { cn, formatDateShort } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { TaskRow } from "@/types/database.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* ─── Config ─────────────────────────────────────────────────────────────── */

const PRIORITY_CONFIG = {
  urgent: { label: "דחופה", color: "text-red-500",    bg: "bg-red-100    dark:bg-red-950/40"    },
  high:   { label: "גבוהה", color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-950/40" },
  medium: { label: "בינונית",color: "text-amber-500", bg: "bg-amber-100  dark:bg-amber-950/40"  },
  low:    { label: "נמוכה", color: "text-slate-500",  bg: "bg-slate-100  dark:bg-slate-800"     },
};

/* ─── Types ─────────────────────────────────────────────────────────────── */

export type PendingTask = Pick<
  TaskRow,
  "id" | "title" | "priority" | "due_at" | "lead_id"
> & {
  lead_name?: string | null; // joined from leads table
};

/* ─── Task item ─────────────────────────────────────────────────────────── */

function TaskItem({
  task,
  onDone,
}: {
  task:   PendingTask;
  onDone: (id: string) => void;
}) {
  const [checking, setChecking] = useState(false);
  const isOverdue = task.due_at && new Date(task.due_at) < new Date();
  const cfg       = PRIORITY_CONFIG[task.priority];

  const handleCheck = async () => {
    setChecking(true);
    onDone(task.id); // optimistic
  };

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-xl border transition-all",
      "bg-card border-border hover:border-border/80",
      checking && "opacity-40 pointer-events-none"
    )}>
      {/* Checkbox */}
      <button
        onClick={handleCheck}
        className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-green-500 transition-colors"
        title="סמן כבוצע"
      >
        {checking
          ? <CheckCircle2 className="w-5 h-5 text-green-500" />
          : <Circle className="w-5 h-5" />
        }
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight line-clamp-1">{task.title}</p>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {/* Priority badge */}
          <span className={cn(
            "inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full",
            cfg.bg, cfg.color
          )}>
            <Flag className="w-2.5 h-2.5" />
            {cfg.label}
          </span>

          {/* Due date */}
          {task.due_at && (
            <span className={cn(
              "text-xs flex items-center gap-1",
              isOverdue ? "text-destructive font-semibold" : "text-muted-foreground"
            )}>
              <Calendar className="w-3 h-3" />
              {formatDateShort(task.due_at)}
              {isOverdue && " · באיחור!"}
            </span>
          )}

          {/* Lead link */}
          {task.lead_id && (
            <Link
              href={`/leads/${task.lead_id}`}
              className="text-xs text-primary hover:underline truncate max-w-[120px]"
              onClick={(e) => e.stopPropagation()}
            >
              {task.lead_name ?? "עבור ליד"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function PendingTasks({ tasks: initialTasks }: { tasks: PendingTask[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const supabase = createClient();

  const handleDone = async (taskId: string) => {
    // Optimistic remove
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("tasks")
      .update({ status: "done", done_at: now } as unknown as never)
      .eq("id", taskId);

    if (error) {
      toast.error("שגיאה בעדכון המשימה");
      // Rollback — refetch or restore would be ideal; for now just show error
    } else {
      toast.success("משימה הושלמה! ✓");
    }
  };

  // Sort: overdue first, then by priority, then by due_at
  const sorted = [...tasks].sort((a, b) => {
    const aOverdue = a.due_at && new Date(a.due_at) < new Date() ? 0 : 1;
    const bOverdue = b.due_at && new Date(b.due_at) < new Date() ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;

    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const pd = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pd !== 0) return pd;

    if (a.due_at && b.due_at) return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    return 0;
  });

  const overdueCount = sorted.filter(
    (t) => t.due_at && new Date(t.due_at) < new Date()
  ).length;

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            משימות פתוחות
            {tasks.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center">
                {tasks.length}
              </span>
            )}
          </CardTitle>
          <CardDescription>
            {overdueCount > 0
              ? <span className="text-destructive">{overdueCount} משימות באיחור</span>
              : "משימות הממתינות לביצוע"}
          </CardDescription>
        </div>
        <Link
          href="/tasks"
          className="text-xs text-primary hover:underline flex items-center gap-1 mt-1 flex-shrink-0"
        >
          כל המשימות
          <ArrowLeft className="w-3 h-3" />
        </Link>
      </CardHeader>

      <CardContent className="px-3 pb-3">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
              <ClipboardList className="w-5 h-5 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium">כל המשימות הושלמו 🎉</p>
            <p className="text-xs text-muted-foreground mt-1">
              אין משימות פתוחות כרגע
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.slice(0, 6).map((task) => (
              <TaskItem key={task.id} task={task} onDone={handleDone} />
            ))}
            {tasks.length > 6 && (
              <div className="pt-1 text-center">
                <Link
                  href="/tasks"
                  className="text-xs text-primary hover:underline"
                >
                  ועוד {tasks.length - 6} משימות...
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
