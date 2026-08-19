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
    supabase.from("calls").select("id,type,outcome,called_at,duration_seconds,lead_id").order("called_at", { ascending: false }),
  ]);

  const allLeads = (leadsRes.data ?? []) as LeadRow[];
  const calls = (callsRes.data ?? []) as CallRow[];

  // Filter out irrelevant leads for reporting
  const leads = allLeads.filter((l) => !l.is_irrelevant);

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

  /* ── ניתוח שיחות קרות: לפי שעה, יום ותחום ────────────────────────────── */

  const SUCCESS_OUTCOMES = new Set(["interested", "meeting_set", "deal_closed"]);
  const isSuccess = (c: CallRow) => !!c.outcome && SUCCESS_OUTCOMES.has(c.outcome);

  const hourOf = (iso: string) =>
    parseInt(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: "Asia/Jerusalem" }).format(new Date(iso)), 10);
  const dayOf = (iso: string) =>
    new Intl.DateTimeFormat("he-IL", { weekday: "long", timeZone: "Asia/Jerusalem" }).format(new Date(iso));

  // לפי שעה (רק שעות עם שיחות)
  const byHour: Record<number, { calls: number; success: number }> = {};
  for (const c of calls) {
    const h = hourOf(c.called_at);
    byHour[h] ??= { calls: 0, success: 0 };
    byHour[h].calls++;
    if (isSuccess(c)) byHour[h].success++;
  }
  const hourRows = Object.entries(byHour)
    .map(([h, v]) => ({ h: +h, ...v, rate: Math.round((v.success / v.calls) * 100) }))
    .sort((a, b) => a.h - b.h);

  // לפי יום בשבוע
  const DAY_ORDER = ["יום ראשון","יום שני","יום שלישי","יום רביעי","יום חמישי","יום שישי","שבת"];
  const byDay: Record<string, { calls: number; success: number }> = {};
  for (const c of calls) {
    const d = dayOf(c.called_at);
    byDay[d] ??= { calls: 0, success: 0 };
    byDay[d].calls++;
    if (isSuccess(c)) byDay[d].success++;
  }
  const dayRows = DAY_ORDER.filter((d) => byDay[d])
    .map((d) => ({ d, ...byDay[d], rate: Math.round((byDay[d].success / byDay[d].calls) * 100) }));

  // לפי תחום העסק
  const leadIndustry = new Map(allLeads.map((l) => [l.id, l.industry ?? "לא צוין"]));
  const byIndustry: Record<string, { calls: number; success: number }> = {};
  for (const c of calls) {
    const ind = leadIndustry.get(c.lead_id) ?? "לא צוין";
    byIndustry[ind] ??= { calls: 0, success: 0 };
    byIndustry[ind].calls++;
    if (isSuccess(c)) byIndustry[ind].success++;
  }
  const industryRows = Object.entries(byIndustry)
    .map(([ind, v]) => ({ ind, ...v, rate: Math.round((v.success / v.calls) * 100) }))
    .sort((a, b) => b.rate - a.rate || b.calls - a.calls)
    .slice(0, 10);

  const rateColor = (r: number) => r >= 30 ? "bg-green-500" : r >= 15 ? "bg-amber-400" : "bg-red-400";

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

      {/* ── ניתוח שיחות קרות ─────────────────────────────────────────────── */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">מתי הכי כדאי לחייג?</CardTitle>
          <CardDescription>
            אחוז שיחות מוצלחות (מעוניין / נקבעה פגישה / נסגרה עסקה) לפי שעה, יום ותחום
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalCalls === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              עוד אין שיחות מתועדות. התחל לתעד כל שיחה (כולל שעה ותוצאה) — ואחרי כ־30 שיחות
              הדוח הזה יגיד לך בדיוק מתי ולמי הכי משתלם לחייג.
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* לפי שעה */}
              <div className="space-y-3">
                <p className="text-sm font-semibold">לפי שעת חיוג</p>
                {hourRows.map((r) => (
                  <div key={r.h} className="flex items-center gap-3">
                    <span className="text-sm tabular-nums w-14 text-start" dir="ltr">{String(r.h).padStart(2,"0")}:00</span>
                    <Bar pct={r.rate} color={rateColor(r.rate)} />
                    <span className="text-sm font-bold tabular-nums w-10 text-start">{r.rate}%</span>
                    <span className="text-xs text-muted-foreground w-12 text-start">{r.calls} שיחות</span>
                  </div>
                ))}
              </div>
              {/* לפי יום */}
              <div className="space-y-3">
                <p className="text-sm font-semibold">לפי יום בשבוע</p>
                {dayRows.map((r) => (
                  <div key={r.d} className="flex items-center gap-3">
                    <span className="text-sm w-20 text-start truncate">{r.d}</span>
                    <Bar pct={r.rate} color={rateColor(r.rate)} />
                    <span className="text-sm font-bold tabular-nums w-10 text-start">{r.rate}%</span>
                    <span className="text-xs text-muted-foreground w-12 text-start">{r.calls} שיחות</span>
                  </div>
                ))}
              </div>
              {/* לפי תחום */}
              <div className="space-y-3">
                <p className="text-sm font-semibold">לפי תחום העסק</p>
                {industryRows.map((r) => (
                  <div key={r.ind} className="flex items-center gap-3">
                    <span className="text-sm w-24 text-start truncate">{r.ind}</span>
                    <Bar pct={r.rate} color={rateColor(r.rate)} />
                    <span className="text-sm font-bold tabular-nums w-10 text-start">{r.rate}%</span>
                    <span className="text-xs text-muted-foreground w-12 text-start">{r.calls} שיחות</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
