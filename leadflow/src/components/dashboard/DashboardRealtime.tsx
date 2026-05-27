"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useRealtimeLeads } from "@/hooks/useRealtimeLeads";
import { useRealtimeTasks } from "@/hooks/useRealtimeTasks";
import { StatsCards, type StatsData } from "@/components/dashboard/StatsCards";
import { RecentLeads, type RecentLead } from "@/components/dashboard/RecentLeads";
import { PendingTasks, type PendingTask } from "@/components/dashboard/PendingTasks";
import type { LeadRow, TaskRow } from "@/types/database.types";

/* ─── helpers ────────────────────────────────────────────────────────────── */

function computeStats(leads: LeadRow[]): StatsData {
  return {
    totalLeads:  leads.length,
    activeLeads: leads.filter((l) => !["closed_won","closed_lost"].includes(l.status)).length,
    closedWon:   leads.filter((l) => l.status === "closed_won").length,
    totalValue:  leads
      .filter((l) => l.status === "closed_won")
      .reduce((s, l) => s + (l.deal_value ?? 0), 0),
  };
}

function toRecentLead(lead: LeadRow): RecentLead {
  return {
    id: lead.id, first_name: lead.first_name, last_name: lead.last_name,
    company: lead.company, status: lead.status, priority: lead.priority,
    deal_value: lead.deal_value, created_at: lead.created_at, phone: lead.phone,
  };
}

/* ─── Props ─────────────────────────────────────────────────────────────── */

interface DashboardRealtimeProps {
  initialLeads:  LeadRow[];
  initialTasks:  PendingTask[];
  leadNamesMap:  Record<string, string>;
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function DashboardRealtime({
  initialLeads,
  initialTasks,
  leadNamesMap: initialLeadNamesMap,
}: DashboardRealtimeProps) {
  const [leads,        setLeads]        = useState<LeadRow[]>(initialLeads);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>(initialTasks);
  const [leadNamesMap, setLeadNamesMap] = useState(initialLeadNamesMap);

  /* ── Lead realtime ─────────────────────────────────────────────────── */

  useRealtimeLeads({
    onInsert: useCallback((lead: LeadRow) => {
      setLeads((prev) => [lead, ...prev]);
      toast.info(`ליד חדש: ${lead.first_name} ${lead.last_name}`, {
        action: { label: "צפה", onClick: () => window.location.href = `/leads/${lead.id}` },
      });
      // Add to name map for tasks
      setLeadNamesMap((prev) => ({
        ...prev,
        [lead.id]: `${lead.first_name} ${lead.last_name}`,
      }));
    }, []),

    onUpdate: useCallback((lead: LeadRow) => {
      setLeads((prev) => prev.map((l) => l.id === lead.id ? lead : l));
      setLeadNamesMap((prev) => ({
        ...prev,
        [lead.id]: `${lead.first_name} ${lead.last_name}`,
      }));
    }, []),

    onDelete: useCallback((id: string) => {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      // Remove tasks belonging to this lead
      setPendingTasks((prev) => prev.filter((t) => t.lead_id !== id));
    }, []),
  });

  /* ── Task realtime ─────────────────────────────────────────────────── */

  useRealtimeTasks({
    onInsert: useCallback((task: TaskRow) => {
      if (task.status !== "pending") return;
      const pendingTask: PendingTask = {
        id:        task.id,
        title:     task.title,
        priority:  task.priority,
        due_at:    task.due_at,
        lead_id:   task.lead_id,
        lead_name: task.lead_id ? (leadNamesMap[task.lead_id] ?? null) : null,
      };
      setPendingTasks((prev) => [pendingTask, ...prev]);
    }, [leadNamesMap]),

    onUpdate: useCallback((task: TaskRow) => {
      if (task.status !== "pending") {
        // Task was completed / cancelled — remove from list
        setPendingTasks((prev) => prev.filter((t) => t.id !== task.id));
        return;
      }
      setPendingTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, title: task.title, priority: task.priority, due_at: task.due_at }
            : t
        )
      );
    }, []),

    onDelete: useCallback((id: string) => {
      setPendingTasks((prev) => prev.filter((t) => t.id !== id));
    }, []),
  });

  /* ── Derived data ──────────────────────────────────────────────────── */

  const stats       = computeStats(leads);
  const recentLeads = leads.slice(0, 6).map(toRecentLead);

  return (
    <>
      <StatsCards data={stats} />
      <RecentLeads leads={recentLeads} />
      <PendingTasks tasks={pendingTasks} />
    </>
  );
}
