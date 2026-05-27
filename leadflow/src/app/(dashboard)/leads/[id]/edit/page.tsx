import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import type { LeadRow }  from "@/types/database.types";
import { LeadForm }      from "@/components/leads/LeadForm";

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

  if (!data) return { title: "עריכת ליד" };
  return { title: `עריכה — ${data.first_name} ${data.last_name}` };
}

export default async function EditLeadPage({
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

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const lead = data as LeadRow;

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
        <Link href="/leads" className="hover:text-foreground transition-colors">
          לידים
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rtl-flip" />
        <Link
          href={`/leads/${id}`}
          className="hover:text-foreground transition-colors truncate max-w-[200px]"
        >
          {lead.first_name} {lead.last_name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rtl-flip" />
        <span className="text-foreground font-medium">עריכה</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold">עריכת ליד</h1>
        <p className="text-muted-foreground text-sm mt-1">
          עדכן את פרטי {lead.first_name} {lead.last_name}
        </p>
      </div>

      <LeadForm lead={lead} userId={user.id} />
    </div>
  );
}
