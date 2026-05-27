import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { LeadRow } from "@/types/database.types";
import { LeadsTable } from "@/components/leads/LeadsTable";

export const metadata: Metadata = { title: "לידים מועדפים" };

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch all leads (is_favorite column might not exist yet, so we'll filter in code)
  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching favorites:", error);
  }

  // Filter favorited leads and ensure is_favorite field exists
  const favoritedLeads = ((leads ?? []) as LeadRow[])
    .map(lead => ({
      ...lead,
      is_favorite: lead.is_favorite ?? false,
    }))
    .filter(lead => lead.is_favorite);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">הלידים המועדפים שלי</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {favoritedLeads.length} לידים מועדפים
        </p>
      </div>

      {/* Leads Table */}
      {favoritedLeads.length === 0 ? (
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">
            אין לידים מועדפים עדיין. לחץ על כוכב ליד ליד כדי להוסיף אותו להעדפים.
          </p>
        </div>
      ) : (
        <LeadsTable initialData={favoritedLeads} />
      )}
    </div>
  );
}
