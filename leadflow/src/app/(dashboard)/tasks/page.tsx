import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import type { TaskRow, LeadRow } from "@/types/database.types";
import type { EnrichedTask } from "@/components/tasks/TasksPageClient";
import { TasksPageClient } from "@/components/tasks/TasksPageClient";

export const metadata: Metadata = { title: "משימות" };

export default async function TasksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [tasksRes, leadsRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("leads")
      .select("id,first_name,last_name")
      .order("first_name"),
  ]);

  if (tasksRes.error) console.error("[TasksPage]", tasksRes.error.message);

  const rawTasks = (tasksRes.data ?? []) as TaskRow[];
  const leads    = (leadsRes.data ?? []) as Pick<LeadRow, "id" | "first_name" | "last_name">[];

  // Build lead name map
  const leadMap = Object.fromEntries(
    leads.map((l) => [l.id, `${l.first_name} ${l.last_name}`])
  );

  const tasks: EnrichedTask[] = rawTasks.map((t) => ({
    ...t,
    lead_name: t.lead_id ? (leadMap[t.lead_id] ?? null) : null,
  }));

  return (
    <div className="space-y-5">
      <TasksPageClient
        initialTasks={tasks}
        userId={user.id}
        leads={leads}
      />
    </div>
  );
}
