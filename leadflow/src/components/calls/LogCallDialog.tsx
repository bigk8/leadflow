"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Phone, PhoneIncoming, PhoneOutgoing, Video,
  Mail, MessageSquare, Users, Loader2, CheckCircle2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { CallType, CallOutcome } from "@/types/database.types";

import { Button }   from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label }    from "@/components/ui/label";
import { Input }    from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

/* ─── Schema ─────────────────────────────────────────────────────────────── */

const logCallSchema = z.object({
  type:             z.enum(["call_outbound","call_inbound","meeting","video","email","whatsapp","other"]),
  outcome:          z.enum(["no_answer","left_message","callback","interested","not_interested","meeting_set","deal_closed","other"]).optional(),
  duration_minutes: z.coerce.number().min(0).max(600).optional().nullable(),
  summary:          z.string().max(1000).optional(),
  notes:            z.string().max(2000).optional(),
  follow_up_at:     z.string().optional().nullable(),
  called_at:        z.string(),
});

type LogCallFormData = z.infer<typeof logCallSchema>;

/* ─── Config maps ─────────────────────────────────────────────────────────── */

const CALL_TYPES: { value: CallType; label: string; icon: React.ElementType; color: string }[] = [
  { value: "call_outbound", label: "שיחה יוצאת",  icon: PhoneOutgoing, color: "text-blue-500"   },
  { value: "call_inbound",  label: "שיחה נכנסת",  icon: PhoneIncoming, color: "text-green-500"  },
  { value: "meeting",       label: "פגישה",        icon: Users,         color: "text-violet-500" },
  { value: "video",         label: "וידאו",         icon: Video,         color: "text-cyan-500"   },
  { value: "email",         label: "אימייל",       icon: Mail,          color: "text-amber-500"  },
  { value: "whatsapp",      label: "וואטסאפ",      icon: MessageSquare, color: "text-emerald-500"},
];

const OUTCOMES: { value: CallOutcome; label: string; sentiment: "positive" | "neutral" | "negative" }[] = [
  { value: "interested",     label: "מעוניין",           sentiment: "positive" },
  { value: "meeting_set",    label: "נקבעה פגישה",       sentiment: "positive" },
  { value: "deal_closed",    label: "עסקה נסגרה ✅",     sentiment: "positive" },
  { value: "callback",       label: "ביקש חזרה",         sentiment: "neutral"  },
  { value: "left_message",   label: "השארתי הודעה",      sentiment: "neutral"  },
  { value: "no_answer",      label: "לא ענה",            sentiment: "neutral"  },
  { value: "not_interested", label: "לא מעוניין",        sentiment: "negative" },
  { value: "other",          label: "אחר",               sentiment: "neutral"  },
];

const SENTIMENT_COLORS = {
  positive: "border-green-200  bg-green-50  text-green-700  dark:border-green-800  dark:bg-green-950/30  dark:text-green-300",
  neutral:  "border-slate-200  bg-slate-50  text-slate-700  dark:border-slate-700  dark:bg-slate-800/30  dark:text-slate-300",
  negative: "border-red-200    bg-red-50    text-red-700    dark:border-red-800    dark:bg-red-950/30    dark:text-red-300",
};

/* ─── Props ─────────────────────────────────────────────────────────────── */

interface LogCallDialogProps {
  open:       boolean;
  onClose:    () => void;
  onSuccess?: () => void;
  leadId:     string;
  userId:     string;
  leadName:   string;
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function LogCallDialog({
  open, onClose, onSuccess,
  leadId, userId, leadName,
}: LogCallDialogProps) {
  const supabase = createClient();
  const [selectedType,    setSelectedType]    = useState<CallType>("call_outbound");
  const [selectedOutcome, setSelectedOutcome] = useState<CallOutcome | null>(null);

  const now = new Date();
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const { register, handleSubmit, setValue, reset, watch,
    formState: { isSubmitting, errors } } = useForm<LogCallFormData>({
    resolver: zodResolver(logCallSchema),
    defaultValues: { type: "call_outbound", called_at: localNow },
  });

  const onSubmit = async (data: LogCallFormData) => {
    const payload = {
      lead_id:          leadId,
      user_id:          userId,
      type:             selectedType,
      outcome:          selectedOutcome ?? null,
      duration_seconds: data.duration_minutes
        ? Math.round(data.duration_minutes * 60) : null,
      called_at:        new Date(data.called_at).toISOString(),
      summary:          data.summary?.trim() || null,
      notes:            data.notes?.trim()   || null,
      follow_up_at:     data.follow_up_at
        ? new Date(data.follow_up_at).toISOString() : null,
    };

    const { error } = await supabase.from("calls").insert([payload] as any);

    if (error) { toast.error("שגיאה בשמירת השיחה"); return; }

    // If follow-up set, also update lead's next_follow_up_at
    if (payload.follow_up_at) {
      await (supabase.from("leads") as any)
        .update({ next_follow_up_at: payload.follow_up_at })
        .eq("id", leadId);
    }

    toast.success("השיחה נשמרה בהצלחה!");
    reset();
    setSelectedType("call_outbound");
    setSelectedOutcome(null);
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Phone className="w-4 h-4 text-primary" />
            </div>
            תיעוד אינטראקציה
          </DialogTitle>
          <DialogDescription>
            תיעוד שיחה / פגישה עם{" "}
            <span className="font-medium text-foreground">{leadName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">

          {/* ── Call type grid ──────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label>סוג אינטראקציה</Label>
            <div className="grid grid-cols-3 gap-2">
              {CALL_TYPES.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setSelectedType(value); setValue("type", value); }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all",
                    selectedType === value
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border bg-transparent text-muted-foreground hover:border-border/80 hover:bg-muted/30"
                  )}
                >
                  <Icon className={cn("w-5 h-5", selectedType === value ? color : "")} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Outcome grid ─────────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label>
              תוצאה
              <span className="text-muted-foreground font-normal me-1 text-xs">(אופציונלי)</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {OUTCOMES.map(({ value, label, sentiment }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedOutcome(
                    selectedOutcome === value ? null : value
                  )}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    selectedOutcome === value
                      ? SENTIMENT_COLORS[sentiment]
                      : "border-border text-muted-foreground hover:border-border/60 hover:bg-muted/30"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Row: Date + Duration ─────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="called_at">מועד</Label>
              <Input
                id="called_at"
                type="datetime-local"
                dir="ltr"
                className="h-9 text-sm"
                {...register("called_at")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duration_minutes">
                אורך (דקות)
                <span className="text-muted-foreground font-normal ms-1 text-xs">אופציונלי</span>
              </Label>
              <Input
                id="duration_minutes"
                type="number"
                min="0"
                max="600"
                step="1"
                placeholder="15"
                dir="ltr"
                className="h-9 text-sm"
                {...register("duration_minutes")}
              />
            </div>
          </div>

          {/* ── Summary ─────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label htmlFor="summary">
              תקציר
              <span className="text-muted-foreground font-normal ms-1 text-xs">אופציונלי</span>
            </Label>
            <Input
              id="summary"
              placeholder="תקציר קצר בשורה אחת..."
              className="h-9 text-sm"
              {...register("summary")}
            />
          </div>

          {/* ── Notes ────────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">
              הערות מפורטות
              <span className="text-muted-foreground font-normal ms-1 text-xs">אופציונלי</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="פרטים נוספים על השיחה, דברים שנאמרו, נקודות חשובות..."
              rows={3}
              className="resize-none text-sm"
              {...register("notes")}
            />
          </div>

          {/* ── Follow-up ────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label htmlFor="follow_up_at" className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              קבע מעקב הבא
              <span className="text-muted-foreground font-normal text-xs">אופציונלי</span>
            </Label>
            <Input
              id="follow_up_at"
              type="datetime-local"
              dir="ltr"
              className="h-9 text-sm"
              {...register("follow_up_at")}
            />
            <p className="text-xs text-muted-foreground">
              אם תמלא תאריך — יעודכן גם מועד המעקב בכרטיס הליד
            </p>
          </div>

          {/* ── Actions ──────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" disabled={isSubmitting} className="gap-2 flex-1">
              {isSubmitting
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Phone   className="w-4 h-4" />
              }
              {isSubmitting ? "שומר..." : "שמור שיחה"}
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
