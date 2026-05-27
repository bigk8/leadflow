import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import type { LeadRow } from "@/types/database.types";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "פייפליין" };

export default async function PipelinePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id,first_name,last_name,company,status,priority,deal_value,source,phone")
    .order("created_at", { ascending: false });

  if (error) console.error("[PipelinePage]", error.message);

  const allLeads = (leads ?? []) as LeadRow[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">פייפליין מכירות</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            מבט-על על כל הלידים לפי שלב בתהליך המכירה
          </p>
        </div>
        <Button asChild className="gap-2 flex-shrink-0">
          <Link href="/leads/new">
            <Plus className="w-4 h-4" />
            ליד חדש
          </Link>
        </Button>
      </div>

      {/* Board */}
      <PipelineBoard leads={allLeads} />
    </div>
  );
}
