import Link from "next/link";
import { ArrowLeft, Phone, Users } from "lucide-react";
import { cn, formatRelative, formatCurrency } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_DOT } from "@/lib/constants/leads";
import type { LeadRow } from "@/types/database.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* ─── Types ─────────────────────────────────────────────────────────────── */

export type RecentLead = Pick<
  LeadRow,
  | "id" | "first_name" | "last_name" | "company"
  | "status" | "priority" | "deal_value" | "created_at" | "phone"
>;

/* ─── Row ────────────────────────────────────────────────────────────────── */

function LeadRow({ lead }: { lead: RecentLead }) {
  return (
    <Link
      href={`/leads/${lead.id}`}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors group"
    >
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
        {lead.first_name[0]}{lead.last_name[0]}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {/* Priority dot */}
          <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", PRIORITY_DOT[lead.priority])} />
          <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
            {lead.first_name} {lead.last_name}
          </p>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {lead.company
            ? `${lead.company} · ${formatRelative(lead.created_at)}`
            : formatRelative(lead.created_at)}
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {lead.deal_value && (
          <span className="text-xs font-medium text-muted-foreground hidden sm:block">
            {formatCurrency(lead.deal_value)}
          </span>
        )}
        <span className={cn(
          "text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap",
          STATUS_COLORS[lead.status]
        )}>
          {STATUS_LABELS[lead.status]}
        </span>
      </div>
    </Link>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function RecentLeads({ leads }: { leads: RecentLead[] }) {
  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-base">לידים אחרונים</CardTitle>
          <CardDescription>6 הלידים שנוספו לאחרונה</CardDescription>
        </div>
        <Link
          href="/leads"
          className="text-xs text-primary hover:underline flex items-center gap-1 mt-1 flex-shrink-0"
        >
          כל הלידים
          <ArrowLeft className="w-3 h-3" />
        </Link>
      </CardHeader>

      <CardContent className="px-3 pb-3">
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium">אין לידים עדיין</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              הוסף ליד ראשון כדי להתחיל
            </p>
            <Button size="sm" asChild>
              <Link href="/leads/new">הוסף ליד</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-0.5">
            {leads.map((lead) => (
              <LeadRow key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
