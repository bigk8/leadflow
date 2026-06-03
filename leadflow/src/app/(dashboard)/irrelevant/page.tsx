import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { LeadRow } from "@/types/database.types";
import { LeadsTable } from "@/components/leads/LeadsTable";

export const metadata: Metadata = { title: "לידים לא רלוונטיים" };

export default async function IrrelevantPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch all leads
  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching irrelevant leads:", error);
  }

  // Filter irrelevant leads and ensure is_irrelevant field exists
  const irrelevantLeads = ((leads ?? []) as LeadRow[])
    .map(lead => ({
      ...lead,
      is_irrelevant: lead.is_irrelevant ?? false,
    }))
    .filter(lead => lead.is_irrelevant);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">לידים לא רלוונטיים</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {irrelevantLeads.length} לידים שסומנו כלא רלוונטיים
        </p>
      </div>

      {/* Leads Table */}
      {irrelevantLeads.length === 0 ? (
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">
            אין לידים לא רלוונטיים. כל הלידים שלך רלוונטיים! 👍
          </p>
        </div>
      ) : (
        <LeadsTable initialData={irrelevantLeads} />
      )}
    </div>
  );
}
