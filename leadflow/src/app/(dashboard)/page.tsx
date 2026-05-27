import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { format } from "date-fns";
import { he } from "date-fns/locale";

import { createClient } from "@/lib/supabase/server";
import type { LeadRow, TaskRow } from "@/types/database.types";
import type { PendingTask } from "@/components/dashboard/PendingTasks";
import type { PipelineRow } from "@/components/dashboard/PipelineOverview";

import { PipelineOverview } from "@/components/dashboard/PipelineOverview";
import { DashboardRealtime } from "@/components/dashboard/DashboardRealtime";

export const metadata: Metadata = { title: "דאשבורד" };

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "בוקר טוב";
  if (h < 17) return "צהריים טובים";
  if (h < 21) return "ערב טוב";
  return "לילה טוב";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const firstName = (user.user_metadata?.full_name as string | undefined)
    ?.split(" ")[0] ?? "שם";

  /* ── Parallel fetch ─────────────────────────────────────────────────── */
  const [leadsRes, tasksRes] = await Promise.all([
    supabase
      .from("leads")
      .select("id,first_name,last_name,company,status,priority,deal_value,created_at,phone")
      .order("created_at", { ascending: false }),
    supabase
      .from("tasks")
      .select("id,title,priority,due_at,lead_id,status")
      .eq("status", "pending")
      .order("due_at", { ascending: true, nullsFirst: false }),
  ]);

  const allLeads = (leadsRes.data ?? []) as LeadRow[];
  const allTasks = (tasksRes.data ?? []) as TaskRow[];

  /* ── Pipeline (static — no realtime needed for this chart) ─────────── */
  const statusMap = new Map<string, { count: number; totalValue: number }>();
  for (const lead of allLeads) {
    const e = statusMap.get(lead.status) ?? { count: 0, totalValue: 0 };
    e.count++;
    e.totalValue += lead.deal_value ?? 0;
    statusMap.set(lead.status, e);
  }
  const pipelineData: PipelineRow[] = Array.from(statusMap.entries()).map(
    ([status, d]) => ({ status: status as PipelineRow["status"], ...d })
  );

  /* ── Enrich tasks with lead names ───────────────────────────────────── */
  const taskLeadIds = [...new Set(allTasks.map((t) => t.lead_id).filter(Boolean))];
  let leadNamesMap: Record<string, string> = {};
  if (taskLeadIds.length > 0) {
    const { data: taskLeads } = await supabase
      .from("leads")
      .select("id,first_name,last_name")
      .in("id", taskLeadIds as string[]) as unknown as
        { data: { id: string; first_name: string; last_name: string }[] | null; error: unknown };
    leadNamesMap = Object.fromEntries(
      (taskLeads ?? []).map((l) => [l.id, `${l.first_name} ${l.last_name}`])
    );
  }

  const pendingTasks: PendingTask[] = allTasks.map((t) => ({
    id:        t.id,
    title:     t.title,
    priority:  t.priority,
    due_at:    t.due_at,
    lead_id:   t.lead_id,
    lead_name: t.lead_id ? (leadNamesMap[t.lead_id] ?? null) : null,
  }));

  const todayLabel = format(new Date(), "EEEE, d בMMMM yyyy", { locale: he });

  return (
    <div className="space-y-7">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">{getGreeting()}, {firstName} 👋</h1>
        <p className="text-muted-foreground text-sm mt-0.5 capitalize">{todayLabel}</p>
      </div>

      {/*
        DashboardRealtime wraps StatsCards, RecentLeads, PendingTasks.
        It receives initial server data and subscribes to Realtime.
        PipelineOverview stays as a separate static component —
        it doesn't need live updates on this page (refresh on navigate).
      */}
      <DashboardRealtime
        initialLeads={allLeads}
        initialTasks={pendingTasks}
        leadNamesMap={leadNamesMap}
      />

      {/* Pipeline — below the realtime section */}
      <PipelineOverview data={pipelineData} />
    </div>
  );
}
