"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckSquare, Loader2, Flag } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { TaskPriority } from "@/types/database.types";

import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label }    from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

/* ─── Schema ─────────────────────────────────────────────────────────────── */

const taskSchema = z.object({
  title:       z.string().min(2, "כותרת חייבת להכיל לפחות 2 תווים").max(200),
  description: z.string().max(1000).optional(),
  priority:    z.enum(["low","medium","high","urgent"]).default("medium"),
  due_at:      z.string().optional().nullable(),
});

type TaskFormData = z.infer<typeof taskSchema>;

/* ─── Priority options ───────────────────────────────────────────────────── */

const PRIORITIES: { value: TaskPriority; label: string; color: string; bg: string }[] = [
  { value: "low",    label: "נמוכה", color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800" },
  { value: "medium", label: "בינונית",color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50  dark:bg-amber-950/40" },
  { value: "high",   label: "גבוהה", color: "text-orange-600 dark:text-orange-400",bg: "bg-orange-50 dark:bg-orange-950/40" },
  { value: "urgent", label: "דחופה", color: "text-red-600   dark:text-red-400",   bg: "bg-red-50   dark:bg-red-950/40" },
];

/* ─── Props ─────────────────────────────────────────────────────────────── */

interface NewTaskDialogProps {
  open:       boolean;
  onClose:    () => void;
  onSuccess?: () => void;
  leadId:     string;
  userId:     string;
  leadName:   string;
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function NewTaskDialog({
  open, onClose, onSuccess,
  leadId, userId, leadName,
}: NewTaskDialogProps) {
  const supabase = createClient();

  const { register, handleSubmit, setValue, watch, reset,
    formState: { isSubmitting, errors } } = useForm<TaskFormData>({
    resolver:      zodResolver(taskSchema),
    defaultValues: { priority: "medium" },
  });

  const selectedPriority = watch("priority");

  const onSubmit = async (data: TaskFormData) => {
    const { error } = await supabase.from("tasks").insert([{
      lead_id:     leadId,
      user_id:     userId,
      title:       data.title.trim(),
      description: data.description?.trim() || null,
      priority:    data.priority,
      status:      "pending",
      due_at:      data.due_at ? new Date(data.due_at).toISOString() : null,
    }] as any);

    if (error) { toast.error("שגיאה ביצירת המשימה"); return; }
    toast.success("המשימה נוצרה!");
    reset();
    onSuccess?.();
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
          <DialogDescription>
            הוסף משימה עבור{" "}
            <span className="font-medium text-foreground">{leadName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">כותרת המשימה *</Label>
            <Input
              id="title"
              placeholder="לדוגמה: שלח הצעת מחיר..."
              className={cn("h-10", errors.title && "border-destructive")}
              autoFocus
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Priority selector */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-muted-foreground" />
              עדיפות
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITIES.map(({ value, label, color, bg }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("priority", value, { shouldDirty: true })}
                  className={cn(
                    "py-2 px-3 rounded-lg border-2 text-xs font-semibold transition-all",
                    selectedPriority === value
                      ? `border-current ${color} ${bg}`
                      : "border-border text-muted-foreground hover:bg-muted/40"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <Label htmlFor="due_at">
              מועד יעד
              <span className="text-muted-foreground font-normal ms-1 text-xs">אופציונלי</span>
            </Label>
            <Input
              id="due_at"
              type="datetime-local"
              dir="ltr"
              className="h-9 text-sm"
              {...register("due_at")}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">
              תיאור
              <span className="text-muted-foreground font-normal ms-1 text-xs">אופציונלי</span>
            </Label>
            <Textarea
              id="description"
              placeholder="פרטים נוספים על המשימה..."
              rows={3}
              className="resize-none text-sm"
              {...register("description")}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" disabled={isSubmitting} className="gap-2 flex-1">
              {isSubmitting
                ? <Loader2      className="w-4 h-4 animate-spin" />
                : <CheckSquare  className="w-4 h-4" />
              }
              {isSubmitting ? "יוצר..." : "צור משימה"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
