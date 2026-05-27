"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Bell, BellOff, CheckCircle2, Clock, AlertTriangle, CalendarDays,
  Phone, Building2, ChevronLeft,
} from "lucide-react";
import {
  isPast, isToday, isTomorrow, format, formatDistanceToNow,
} from "date-fns";
import { he } from "date-fns/locale";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_DOT } from "@/lib/constants/leads";
import type { LeadRow } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Badge }  from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* ─── Types ─────────────────────────────────────────────────────────────── */

export interface ReminderLead extends LeadRow {
  calls_count: number;
}

/* ─── Date helpers ───────────────────────────────────────────────────────── */

function dateCategory(dateStr: string): "overdue" | "today" | "tomorrow" | "upcoming" {
  const d = new Date(dateStr);
  if (isToday(d))    return "today";
  if (isTomorrow(d)) return "tomorrow";
  if (isPast(d))     return "overdue";
  return "upcoming";
}

function formatFollowUp(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d))    return `היום, ${format(d, "HH:mm")}`;
  if (isTomorrow(d)) return `מחר, ${format(d, "HH:mm")}`;
  if (isPast(d))     return `פג תוקף — ${formatDistanceToNow(d, { addSuffix: true, locale: he })}`;
  return format(d, "d בMMMM, HH:mm", { locale: he });
}

/* ─── Category config ────────────────────────────────────────────────────── */

const CAT_CFG = {
  overdue:  { label: "באיחור",    icon: AlertTriangle, color: "text-red-500",    bg: "bg-red-50    dark:bg-red-950/20",    border: "border-red-200    dark:border-red-900"    },
  today:    { label: "היום",      icon: Bell,          color: "text-amber-500",  bg: "bg-amber-50  dark:bg-amber-950/20",  border: "border-amber-200  dark:border-amber-900"  },
  tomorrow: { label: "מחר",       icon: CalendarDays,  color: "text-blue-500",   bg: "bg-blue-50   dark:bg-blue-950/20",   border: "border-blue-200   dark:border-blue-900"   },
  upcoming: { label: "הבא",       icon: Clock,         color: "text-slate-500",  bg: "bg-slate-50  dark:bg-slate-900/20",  border: "border-slate-200  dark:border-slate-800"  },
};

/* ─── Reminder card ──────────────────────────────────────────────────────── */

function ReminderCard({
  lead,
  onDone,
}: {
  lead:   ReminderLead;
  onDone: (id: string) => void;
}) {
  const [marking, setMarking] = useState(false);
  const cat    = dateCategory(lead.next_follow_up_at!);
  const catCfg = CAT_CFG[cat];

  const handleDone = async () => {
    setMarking(true);
    onDone(lead.id);
  };

  return (
    <div
      className={cn(
        "p-4 rounded-xl border transition-all",
        cat === "overdue"
          ? "border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/10"
          : "border-border/60 bg-card"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Priority dot */}
        <span
          className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5", PRIORITY_DOT[lead.priority])}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <Link
              href={`/leads/${lead.id}`}
              className="font-semibold text-sm hover:text-primary transition-colors flex items-center gap-1"
            >
              {lead.first_name} {lead.last_name}
              <ChevronLeft className="w-3.5 h-3.5 opacity-50" />
            </Link>
            <Badge className={cn("text-[11px] px-2 py-0 h-5", STATUS_COLORS[lead.status])}>
              {STATUS_LABELS[lead.status]}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
            {lead.company && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {lead.company}
              </span>
            )}
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Phone className="w-3 h-3" />
                {lead.phone}
              </a>
            )}
            {lead.calls_count > 0 && (
              <span>{lead.calls_count} שיחות קודמות</span>
            )}
          </div>

          <div
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium",
              cat === "overdue"  ? "text-red-600    dark:text-red-400"    :
              cat === "today"    ? "text-amber-600  dark:text-amber-400"  :
              cat === "tomorrow" ? "text-blue-600   dark:text-blue-400"   :
                                   "text-muted-foreground"
            )}
          >
            <catCfg.icon className="w-3.5 h-3.5 flex-shrink-0" />
            {formatFollowUp(lead.next_follow_up_at!)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 h-8 text-xs"
            onClick={handleDone}
            disabled={marking}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            בוצע
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-xs" asChild>
            <Link href={`/leads/${lead.id}`}>פרטים</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Section ────────────────────────────────────────────────────────────── */

function ReminderSection({
  category,
  leads,
  onDone,
}: {
  category: keyof typeof CAT_CFG;
  leads:    ReminderLead[];
  onDone:   (id: string) => void;
}) {
  if (leads.length === 0) return null;
  const cfg = CAT_CFG[category];

  return (
    <Card className="border-border/50">
      <CardHeader className={cn("flex flex-row items-center gap-3 py-3 px-4 rounded-t-xl", cfg.bg, cfg.border, "border-b")}>
        <div className={cn("p-1.5 rounded-lg bg-white/60 dark:bg-black/20")}>
          <cfg.icon className={cn("w-4 h-4", cfg.color)} />
        </div>
        <CardTitle className={cn("text-sm font-semibold", cfg.color)}>
          {cfg.label}
        </CardTitle>
        <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 ms-auto">
          {leads.length}
        </Badge>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        {leads.map((lead) => (
          <ReminderCard key={lead.id} lead={lead} onDone={onDone} />
        ))}
      </CardContent>
    </Card>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */

export function RemindersClient({ initialLeads }: { initialLeads: ReminderLead[] }) {
  const supabase = createClient();
  const [leads, setLeads] = useState<ReminderLead[]>(initialLeads);

  const handleDone = async (id: string) => {
    // Optimistic: remove from list
    setLeads((prev) => prev.filter((l) => l.id !== id));

    const { error } = await (supabase.from("leads") as any)
      .update({ next_follow_up_at: null })
      .eq("id", id);

    if (error) {
      toast.error("שגיאה בעדכון המעקב");
      setLeads(initialLeads);
      return;
    }
    toast.success("המעקב סומן כבוצע");
  };

  // Group by category
  const overdue  = leads.filter((l) => dateCategory(l.next_follow_up_at!) === "overdue");
  const today    = leads.filter((l) => dateCategory(l.next_follow_up_at!) === "today");
  const tomorrow = leads.filter((l) => dateCategory(l.next_follow_up_at!) === "tomorrow");
  const upcoming = leads.filter((l) => dateCategory(l.next_follow_up_at!) === "upcoming");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">תזכורות מעקב</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {leads.length > 0
              ? `${leads.length} לידים מחכים למעקב`
              : "אין מעקבים פתוחים"}
          </p>
        </div>
        {overdue.length > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-red-500 font-medium">
            <AlertTriangle className="w-4 h-4" />
            {overdue.length} באיחור
          </div>
        )}
      </div>

      {/* Empty state */}
      {leads.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BellOff className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">אין תזכורות פתוחות</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              כשתגדיר מועד מעקב לליד הוא יופיע כאן
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/leads">צפה בלידים</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sections */}
      <ReminderSection category="overdue"  leads={overdue}  onDone={handleDone} />
      <ReminderSection category="today"    leads={today}    onDone={handleDone} />
      <ReminderSection category="tomorrow" leads={tomorrow} onDone={handleDone} />
      <ReminderSection category="upcoming" leads={upcoming} onDone={handleDone} />
    </div>
  );
}
