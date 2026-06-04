import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Plus, Users, TrendingUp, PhoneCall, Target } from "lucide-react";

import { createClient }   from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import type { LeadRow }   from "@/types/database.types";

import { Button }     from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { MigrationBanner } from "@/components/leads/MigrationBanner";

export const metadata: Metadata = { title: "לידים" };

interface LeadsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/* ─── Stats row ─────────────────────────────────────────────────────────── */

function StatsRow({ leads }: { leads: LeadRow[] }) {
  const total      = leads.length;
  const active     = leads.filter((l) =>
    !["closed_won", "closed_lost"].includes(l.status)
  ).length;
  const won        = leads.filter((l) => l.status === "closed_won").length;
  const totalValue = leads
    .filter((l) => l.status === "closed_won" && l.deal_value)
    .reduce((s, l) => s + (l.deal_value ?? 0), 0);

  const stats = [
    {
      label: "סה״כ לידים",
      value: total,
      icon:  Users,
      color: "text-blue-500",
      bg:    "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "לידים פעילים",
      value: active,
      icon:  TrendingUp,
      color: "text-violet-500",
      bg:    "bg-violet-50 dark:bg-violet-950/30",
    },
    {
      label: "עסקאות שנסגרו",
      value: won,
      icon:  Target,
      color: "text-green-500",
      bg:    "bg-green-50 dark:bg-green-950/30",
    },
    {
      label: "ערך שנסגר",
      value: formatCurrency(totalValue),
      icon:  PhoneCall,
      color: "text-amber-500",
      bg:    "bg-amber-50 dark:bg-amber-950/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((s) => (
        <Card key={s.label} className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {s.label}
            </CardTitle>
            <div className={`p-2 rounded-lg ${s.bg}`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{s.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) console.error("[LeadsPage]", error.message);

  // Ensure is_favorite field exists (default to false if column doesn't exist yet)
  const allLeads = ((leads ?? []) as LeadRow[]).map(lead => ({
    ...lead,
    is_favorite: lead.is_favorite ?? false,
  }));

  const params = await searchParams;
  const initialSearchQuery = (params.search as string) ?? "";

  return (
    <div className="space-y-6">
      <MigrationBanner />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">לידים</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            ניהול כל הלידים ופייפליין המכירות שלך
          </p>
        </div>
        <Button asChild className="gap-2 w-full sm:w-auto">
          <Link href="/leads/new">
            <Plus className="w-4 h-4" />
            ליד חדש
          </Link>
        </Button>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <StatsRow leads={allLeads} />

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <LeadsTable initialData={allLeads} initialSearchQuery={initialSearchQuery} />
        </CardContent>
      </Card>
    </div>
  );
}
