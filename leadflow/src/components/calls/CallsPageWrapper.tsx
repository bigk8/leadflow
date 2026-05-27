"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Phone, PhoneCall, Clock, TrendingUp, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { CallType, CallOutcome } from "@/types/database.types";
import type { EnrichedCall } from "@/components/calls/CallsTable";

import { CallsTable }  from "@/components/calls/CallsTable";
import { Button }      from "@/components/ui/button";
import { Input }       from "@/components/ui/input";
import { Label }       from "@/components/ui/label";
import { Textarea }    from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

/* ─── Quick Log dialog (with lead selector) ─────────────────────────────── */

const quickLogSchema = z.object({
  lead_id:          z.string().min(1, "יש לבחור ליד"),
  type:             z.enum(["call_outbound","call_inbound","meeting","video","email","whatsapp","other"]),
  outcome:          z.enum(["no_answer","left_message","callback","interested","not_interested","meeting_set","deal_closed","other"]).optional(),
  duration_minutes: z.coerce.number().min(0).optional().nullable(),
  summary:          z.string().max(500).optional(),
  called_at:        z.string(),
});
type QuickLogData = z.infer<typeof quickLogSchema>;

const CALL_TYPE_OPTIONS: { value: CallType; label: string }[] = [
  { value: "call_outbound", label: "שיחה יוצאת"  },
  { value: "call_inbound",  label: "שיחה נכנסת"  },
  { value: "meeting",       label: "פגישה"        },
  { value: "video",         label: "וידאו"         },
  { value: "email",         label: "אימייל"       },
  { value: "whatsapp",      label: "וואטסאפ"      },
  { value: "other",         label: "אחר"           },
];

const OUTCOME_OPTIONS: { value: CallOutcome; label: string }[] = [
  { value: "interested",     label: "מעוניין"       },
  { value: "meeting_set",    label: "נקבעה פגישה"   },
  { value: "deal_closed",    label: "עסקה נסגרה"    },
  { value: "callback",       label: "ביקש חזרה"     },
  { value: "left_message",   label: "השארתי הודעה"  },
  { value: "no_answer",      label: "לא ענה"        },
  { value: "not_interested", label: "לא מעוניין"    },
  { value: "other",          label: "אחר"            },
];

interface LeadOption {
  id: string;
  first_name: string;
  last_name:  string;
  company:    string | null;
}

interface QuickLogDialogProps {
  open:   boolean;
  onClose: () => void;
  onSuccess: (newCall: EnrichedCall) => void;
  userId:  string;
  leads:   LeadOption[];
}

function QuickLogDialog({ open, onClose, onSuccess, userId, leads }: QuickLogDialogProps) {
  const supabase = createClient();
  const now = new Date();
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString().slice(0, 16);

  const { register, handleSubmit, setValue, watch, reset,
    formState: { isSubmitting, errors } } = useForm<QuickLogData>({
    resolver: zodResolver(quickLogSchema),
    defaultValues: { type: "call_outbound", called_at: localNow },
  });

  const selectedLeadId = watch("lead_id");

  const onSubmit = async (data: QuickLogData) => {
    const lead = leads.find((l) => l.id === data.lead_id);

    const { data: inserted, error } = await supabase
      .from("calls")
      .insert([{
        lead_id:          data.lead_id,
        user_id:          userId,
        type:             data.type,
        outcome:          data.outcome ?? null,
        duration_seconds: data.duration_minutes ? Math.round(data.duration_minutes * 60) : null,
        called_at:        new Date(data.called_at).toISOString(),
        summary:          data.summary?.trim() || null,
      }] as any)
      .select()
      .single();

    if (error || !inserted) { toast.error("שגיאה בשמירת השיחה"); return; }

    const enriched: EnrichedCall = {
      ...(inserted as any),
      lead_first_name: lead?.first_name ?? "",
      lead_last_name:  lead?.last_name  ?? "",
      lead_company:    lead?.company    ?? null,
    };

    toast.success("השיחה נשמרה!");
    onSuccess(enriched);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Phone className="w-4 h-4 text-primary" />
            </div>
            תיעוד שיחה חדשה
          </DialogTitle>
          <DialogDescription>בחר ליד ותעד את האינטראקציה</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Lead selector */}
          <div className="space-y-1.5">
            <Label>ליד *</Label>
            <Select onValueChange={(v) => setValue("lead_id", v, { shouldValidate: true })}>
              <SelectTrigger className={cn("h-10", errors.lead_id && "border-destructive")}>
                <SelectValue placeholder="בחר ליד..." />
              </SelectTrigger>
              <SelectContent>
                {leads.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    <span className="font-medium">{l.first_name} {l.last_name}</span>
                    {l.company && <span className="text-muted-foreground"> · {l.company}</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.lead_id && <p className="text-xs text-destructive">{errors.lead_id.message}</p>}
          </div>

          {/* Type + Outcome */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>סוג</Label>
              <Select defaultValue="call_outbound"
                onValueChange={(v) => setValue("type", v as CallType)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CALL_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>תוצאה</Label>
              <Select onValueChange={(v) => setValue("outcome", v as CallOutcome)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="אופציונלי" />
                </SelectTrigger>
                <SelectContent>
                  {OUTCOME_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>מועד</Label>
              <Input type="datetime-local" dir="ltr" className="h-9 text-sm"
                {...register("called_at")} />
            </div>
            <div className="space-y-1.5">
              <Label>אורך (דק׳)</Label>
              <Input type="number" min="0" step="1" placeholder="15" dir="ltr"
                className="h-9 text-sm" {...register("duration_minutes")} />
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-1.5">
            <Label>תקציר</Label>
            <Input placeholder="תקציר קצר..." className="h-9 text-sm" {...register("summary")} />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="submit" disabled={isSubmitting} className="flex-1 gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
              {isSubmitting ? "שומר..." : "שמור שיחה"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>ביטול</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Stats strip ─────────────────────────────────────────────────────────── */

function CallsStats({ calls }: { calls: EnrichedCall[] }) {
  const total    = calls.length;
  const weekAgo  = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const thisWeek = calls.filter((c) => new Date(c.called_at) >= weekAgo).length;
  const avgSecs  = calls.filter((c) => c.duration_seconds)
    .reduce((s, c, _, a) => s + (c.duration_seconds! / a.length), 0);
  const avgMins  = Math.round(avgSecs / 60);
  const conversion = calls.length > 0
    ? Math.round(calls.filter((c) =>
        ["interested","meeting_set","deal_closed"].includes(c.outcome ?? "")
      ).length / calls.length * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "סה״כ שיחות",       value: String(total),        icon: Phone,      color: "text-blue-500",   bg: "bg-blue-100 dark:bg-blue-950/40"   },
        { label: "השבוע",             value: String(thisWeek),     icon: PhoneCall,  color: "text-green-500",  bg: "bg-green-100 dark:bg-green-950/40" },
        { label: "משך ממוצע (דק׳)",  value: `${avgMins}′`,        icon: Clock,      color: "text-amber-500",  bg: "bg-amber-100 dark:bg-amber-950/40" },
        { label: "אחוז המרה",         value: `${conversion}%`,     icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-100 dark:bg-violet-950/40" },
      ].map((s) => (
        <Card key={s.label} className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            <div className={`p-2 rounded-lg ${s.bg}`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ─── Main wrapper ────────────────────────────────────────────────────────── */

interface CallsPageWrapperProps {
  calls:              EnrichedCall[];
  userId:             string;
  leadsForSelector:   LeadOption[];
}

export function CallsPageWrapper({ calls: initialCalls, userId, leadsForSelector }: CallsPageWrapperProps) {
  const [calls,   setCalls]   = useState<EnrichedCall[]>(initialCalls);
  const [logOpen, setLogOpen] = useState(false);

  const handleNewCall = (call: EnrichedCall) => {
    setCalls((prev) => [call, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">שיחות</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            היסטוריית כל השיחות והאינטראקציות
          </p>
        </div>
        <Button className="gap-2 flex-shrink-0" onClick={() => setLogOpen(true)}>
          <Phone className="w-4 h-4" />
          תעד שיחה חדשה
        </Button>
      </div>

      <CallsStats calls={calls} />

      <Card className="border-border/50">
        <CardContent className="pt-6">
          <CallsTable initialData={calls} />
        </CardContent>
      </Card>

      <QuickLogDialog
        open={logOpen}
        onClose={() => setLogOpen(false)}
        onSuccess={handleNewCall}
        userId={userId}
        leads={leadsForSelector}
      />
    </div>
  );
}
