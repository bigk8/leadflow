import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import type { LeadRow, CallRow, TaskRow } from "@/types/database.types";
import { LeadDetail } from "@/components/leads/LeadDetail";

/* ─── Metadata ──────────────────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id }   = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("first_name, last_name")
    .eq("id", id)
    .single() as unknown as { data: { first_name: string; last_name: string } | null; error: unknown };

  if (!data) return { title: "ליד לא נמצא" };
  return { title: `${data.first_name} ${data.last_name}` };
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }   = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Parallel fetch: lead + calls + tasks
  const [leadRes, callsRes, tasksRes] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).single(),
    supabase.from("calls").select("*").eq("lead_id", id).order("called_at", { ascending: false }),
    supabase.from("tasks").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
  ]) as unknown as [
    { data: LeadRow | null;  error: unknown },
    { data: CallRow[] | null; error: unknown },
    { data: TaskRow[] | null; error: unknown },
  ];

  if (leadRes.error || !leadRes.data) notFound();

  const lead  = leadRes.data  as LeadRow;
  const calls = (callsRes.data ?? []) as CallRow[];
  const tasks = (tasksRes.data ?? []) as TaskRow[];

  return (
    <div className="space-y-4 max-w-6xl mx-auto">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/leads" className="hover:text-foreground transition-colors">
          לידים
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rtl-flip" />
        <span className="text-foreground font-medium truncate">
          {lead.first_name} {lead.last_name}
        </span>
      </nav>

      {/* Main detail component (client) */}
      <LeadDetail
        lead={lead}
        calls={calls}
        tasks={tasks}
        userId={user.id}
      />
    </div>
  );
}
