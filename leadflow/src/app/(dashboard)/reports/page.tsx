import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { he } from "date-fns/locale";
import {
  TrendingUp, Target, XCircle, Users,
  Phone, BarChart3, CircleDollarSign,
} from "lucide-react";

import { createClient }   from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { STATUS_LABELS, PIPELINE_ORDER } from "@/lib/constants/leads";
import type { LeadRow, CallRow }         from "@/types/database.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = { title: "דוחות" };

/* ─── Stat card ─────────────────────────────────────────────────────────── */

function StatCard({
  label, value, sub, icon: Icon, iconColor, iconBg,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; iconColor: string; iconBg: string;
}) {
  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

/* ─── Bar ────────────────────────────────────────────────────────────────── */

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${Math.max(pct, pct > 0 ? 3 : 0)}%` }}
      />
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [leadsRes, callsRes] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    supabase.from("calls").select("id,type,outcome,called_at,duration_seconds").order("called_at", { ascending: false }),
  ]);

  const leads = (leadsRes.data ?? []) as LeadRow[];
  const calls = (callsRes.data ?? []) as CallRow[];

  /* ── Core metrics ─────────────────────────────────────────────────────── */

  const total       = leads.length;
  const active      = leads.filter((l) => !["closed_won","closed_lost"].includes(l.status)).length;
  const won         = leads.filter((l) => l.status === "closed_won").length;
  const lost        = leads.filter((l) => l.status === "closed_lost").length;
  const convRate    = total === 0 ? 0 : Math.round((won / total) * 100);
  const wonValue    = leads.filter((l) => l.status === "closed_won").reduce((s,l) => s+(l.deal_value??0),0);
  const pipeValue   = leads.filter((l) => !["closed_won","closed_lost"].includes(l.status)).reduce((s,l) => s+(l.deal_value??0),0);
  const totalCalls  = calls.length;
  const avgDuration = calls.filter((c) => c.duration_seconds).length
    ? Math.round(calls.filter((c) => c.duration_seconds).reduce((s,c) => s+(c.duration_seconds??0),0) / calls.filter((c) => c.duration_seconds).length)
    : 0;

  /* ── Pipeline breakdown ───────────────────────────────────────────────── */

  const statusCount  = Object.fromEntries(PIPELINE_ORDER.map((s) => [s, 0]));
  const statusValue  = Object.fromEntries(PIPELINE_ORDER.map((s) => [s, 0]));
  for (const l of leads) {
    statusCount[l.status] = (statusCount[l.status] ?? 0) + 1;
    statusValue[l.status] = (statusValue[l.status] ?? 0) + (l.deal_value ?? 0);
  }
  const maxCount = Math.max(...Object.values(statusCount), 1);

  const PIPELINE_COLORS: Record<string, string> = {
    new: "bg-slate-400", contacted: "bg-blue-400", meeting: "bg-violet-400",
    proposal: "bg-amber-400", negotiation: "bg-orange-400",
    closed_won: "bg-green-500", closed_lost: "bg-red-400",
  };

  /* ── Source breakdown ─────────────────────────────────────────────────── */

  const sourceMap: Record<string, number> = {};
  for (const l of leads) {
    const s = l.source ?? "לא צוין";
    sourceMap[s] = (sourceMap[s] ?? 0) + 1;
  }
  const sources = Object.entries(sourceMap)
    .sort((a,b) => b[1]-a[1])
    .slice(0, 8);
  const maxSource = Math.max(...sources.map(([,n]) => n), 1);

  /* ── Monthly trend (last 6 months) ───────────────────────────────────── */

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i);
    const start = startOfMonth(d).toISOString();
    const end   = endOfMonth(d).toISOString();
    const count = leads.filter((l) => l.created_at >= start && l.created_at <= end).length;
    const wonM  = leads.filter((l) => l.status === "closed_won" && l.closed_at && l.closed_at >= start && l.closed_at <= end).length;
    return { label: format(d, "MMM", { locale: he }), count, won: wonM };
  });
  const maxMonthCount = Math.max(...months.map((m) => m.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">דוחות וניתוח</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          סטטיסטיקות ומגמות של עסק המכירות שלך
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="סה״כ לידים"      value={total}     icon={Users}             iconColor="text-blue-500"   iconBg="bg-blue-50   dark:bg-blue-950/30"   />
        <StatCard label="עסקאות שנסגרו"   value={won}       sub={`${convRate}% המרה`} icon={Target}          iconColor="text-green-500"  iconBg="bg-green-50  dark:bg-green-950/30"  />
        <StatCard label="הכנסות שנסגרו"   value={formatCurrency(wonValue)} icon={CircleDollarSign} iconColor="text-emerald-500" iconBg="bg-emerald-50 dark:bg-emerald-950/30" />
        <StatCard label="שווי פייפליין"   value={formatCurrency(pipeValue)} sub={`${active} לידים פעילים`} icon={TrendingUp} iconColor="text-violet-500" iconBg="bg-violet-50 dark:bg-violet-950/30" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="לידים פעילים"   value={active}      icon={TrendingUp}    iconColor="text-amber-500"  iconBg="bg-amber-50  dark:bg-amber-950/30"  />
        <StatCard label="לידים שאבדו"    value={lost}        icon={XCircle}       iconColor="text-red-500"    iconBg="bg-red-50    dark:bg-red-950/30"    />
        <StatCard label="שיחות שתועדו"   value={totalCalls}  icon={Phone}         iconColor="text-sky-500"    iconBg="bg-sky-50    dark:bg-sky-950/30"    />
        <StatCard
          label="ממוצע שיחה"
          value={avgDuration > 0 ? `${Math.floor(avgDuration/60)}:${String(avgDuration%60).padStart(2,"0")}` : "—"}
          sub="דקות:שניות"
          icon={BarChart3}
          iconColor="text-indigo-500"
          iconBg="bg-indigo-50 dark:bg-indigo-950/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline funnel */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">פילוח לפי שלב</CardTitle>
            <CardDescription>{total} לידים סה״כ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {PIPELINE_ORDER.map((status) => {
              const count = statusCount[status];
              const val   = statusValue[status];
              const pct   = (count / maxCount) * 100;
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{STATUS_LABELS[status]}</span>
                    <div className="flex items-center gap-3">
                      {val > 0 && <span className="text-xs text-muted-foreground">{formatCurrency(val)}</span>}
                      <span className="font-bold tabular-nums w-6 text-start">{count}</span>
                    </div>
                  </div>
                  <Bar pct={pct} color={PIPELINE_COLORS[status]} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Monthly trend */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">לידים לפי חודש</CardTitle>
            <CardDescription>6 חודשים אחרונים</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-36 pt-2">
              {months.map((m) => {
                const barH = maxMonthCount === 0 ? 0 : Math.round((m.count / maxMonthCount) * 100);
                return (
                  <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-foreground/80">
                      {m.count > 0 ? m.count : ""}
                    </span>
                    <div className="w-full flex flex-col justify-end h-24 gap-0.5">
                      <div
                        className="w-full bg-primary/70 rounded-t-sm transition-all"
                        style={{ height: `${barH}%`, minHeight: m.count > 0 ? "4px" : "0" }}
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground capitalize">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Source breakdown */}
      {sources.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">פילוח לפי מקור</CardTitle>
            <CardDescription>מאיפה מגיעים הלידים שלך</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sources.map(([source, count]) => (
              <div key={source} className="flex items-center gap-3">
                <span className="text-sm font-medium w-28 truncate text-start">{source}</span>
                <Bar pct={(count / maxSource) * 100} color="bg-primary/60" />
                <span className="text-sm font-bold tabular-nums w-8 text-start">{count}</span>
                <span className="text-xs text-muted-foreground w-10 text-start">
                  {Math.round((count / total) * 100)}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
