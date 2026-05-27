import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { createClient }  from "@/lib/supabase/server";
import type { LeadRow }  from "@/types/database.types";
import type { ReminderLead } from "@/components/reminders/RemindersClient";
import { RemindersClient }   from "@/components/reminders/RemindersClient";

export const metadata: Metadata = { title: "תזכורות" };

export default async function RemindersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch leads with follow-up set, joined with call count
  const { data: rawLeads, error } = await supabase
    .from("leads")
    .select(`
      *,
      calls(count)
    `)
    .not("next_follow_up_at", "is", null)
    .order("next_follow_up_at", { ascending: true });

  if (error) console.error("[RemindersPage]", error.message);

  const leads: ReminderLead[] = ((rawLeads ?? []) as any[]).map((l) => ({
    ...(l as LeadRow),
    calls_count: l.calls?.[0]?.count ?? 0,
  }));

  return <RemindersClient initialLeads={leads} />;
}
