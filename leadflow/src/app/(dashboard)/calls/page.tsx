import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Phone, PhoneCall, Clock, TrendingUp } from "lucide-react";

import { createClient }  from "@/lib/supabase/server";
import type { CallRow }  from "@/types/database.types";
import type { EnrichedCall } from "@/components/calls/CallsTable";
import { CallsPageWrapper } from "@/components/calls/CallsPageWrapper";

export const metadata: Metadata = { title: "שיחות" };

export default async function CallsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Join calls with lead names in a single query using Supabase's embedded joins
  const { data: rawCalls, error } = await supabase
    .from("calls")
    .select(`
      *,
      leads!inner (
        first_name,
        last_name,
        company
      )
    `)
    .order("called_at", { ascending: false });

  if (error) console.error("[CallsPage]", error.message);

  // Flatten the join
  const calls: EnrichedCall[] = ((rawCalls ?? []) as any[]).map((row) => ({
    id:               row.id,
    user_id:          row.user_id,
    lead_id:          row.lead_id,
    type:             row.type,
    outcome:          row.outcome,
    duration_seconds: row.duration_seconds,
    called_at:        row.called_at,
    summary:          row.summary,
    notes:            row.notes,
    follow_up_at:     row.follow_up_at,
    created_at:       row.created_at,
    updated_at:       row.updated_at,
    lead_first_name:  row.leads.first_name,
    lead_last_name:   row.leads.last_name,
    lead_company:     row.leads.company,
  }));

  // Fetch leads list for the "global log call" lead selector
  const { data: leads } = await supabase
    .from("leads")
    .select("id, first_name, last_name, company")
    .order("first_name");

  return (
    <CallsPageWrapper
      calls={calls}
      userId={user.id}
      leadsForSelector={leads ?? []}
    />
  );
}
