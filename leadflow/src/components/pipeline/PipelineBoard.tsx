"use client";

import Link from "next/link";
import { cn, formatCurrency } from "@/lib/utils";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_DOT,
  PIPELINE_ORDER,
} from "@/lib/constants/leads";
import type { LeadRow, LeadStatus } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";

/* ─── Column config ─────────────────────────────────────────────────────── */

const COLUMN_HEADER: Record<LeadStatus, { bg: string; border: string; dot: string }> = {
  new:          { bg: "bg-slate-50  dark:bg-slate-900/40",  border: "border-slate-200 dark:border-slate-800",  dot: "bg-slate-400"   },
  contacted:    { bg: "bg-blue-50   dark:bg-blue-950/20",   border: "border-blue-200  dark:border-blue-900",   dot: "bg-blue-400"    },
  meeting:      { bg: "bg-violet-50 dark:bg-violet-950/20", border: "border-violet-200 dark:border-violet-900",dot: "bg-violet-400"  },
  proposal:     { bg: "bg-amber-50  dark:bg-amber-950/20",  border: "border-amber-200 dark:border-amber-900",  dot: "bg-amber-400"   },
  negotiation:  { bg: "bg-orange-50 dark:bg-orange-950/20", border: "border-orange-200 dark:border-orange-900",dot: "bg-orange-400"  },
  closed_won:   { bg: "bg-green-50  dark:bg-green-950/20",  border: "border-green-200 dark:border-green-900",  dot: "bg-green-500"   },
  closed_lost:  { bg: "bg-red-50    dark:bg-red-950/20",    border: "border-red-200   dark:border-red-900",    dot: "bg-red-400"     },
};

/* ─── Lead card ─────────────────────────────────────────────────────────── */

function LeadCard({ lead }: { lead: LeadRow }) {
  const fullName = `${lead.first_name} ${lead.last_name}`;

  return (
    <Link
      href={`/leads/${lead.id}`}
      className={cn(
        "block p-3 rounded-lg border border-border/60",
        "bg-card hover:bg-muted/30 hover:border-border",
        "transition-all duration-150 group"
      )}
    >
      {/* Name + priority dot */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-1">
          {fullName}
        </p>
        <span
          className={cn(
            "w-2 h-2 rounded-full flex-shrink-0 mt-1",
            PRIORITY_DOT[lead.priority]
          )}
          title={lead.priority}
        />
      </div>

      {/* Company */}
      {lead.company && (
        <p className="text-xs text-muted-foreground truncate mb-2">
          {lead.company}
        </p>
      )}

      {/* Deal value */}
      {lead.deal_value != null && lead.deal_value > 0 && (
        <p className="text-xs font-medium text-green-600 dark:text-green-400">
          {formatCurrency(lead.deal_value)}
        </p>
      )}

      {/* Source */}
      {lead.source && (
        <p className="text-[11px] text-muted-foreground/70 mt-1 truncate">
          {lead.source}
        </p>
      )}
    </Link>
  );
}

/* ─── Column ─────────────────────────────────────────────────────────────── */

function KanbanColumn({
  status,
  leads,
}: {
  status: LeadStatus;
  leads: LeadRow[];
}) {
  const cfg        = COLUMN_HEADER[status];
  const totalValue = leads.reduce((s, l) => s + (l.deal_value ?? 0), 0);

  return (
    <div className="flex flex-col min-w-[220px] max-w-[260px] w-full">
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2 rounded-lg border mb-2",
          cfg.bg,
          cfg.border
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
          <span className="text-xs font-semibold">{STATUS_LABELS[status]}</span>
        </div>
        <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
          {leads.length}
        </Badge>
      </div>

      {/* Total value */}
      {totalValue > 0 && (
        <p className="text-[11px] text-muted-foreground text-center mb-2">
          {formatCurrency(totalValue)}
        </p>
      )}

      {/* Cards */}
      <div className="flex flex-col gap-2 flex-1">
        {leads.length === 0 ? (
          <div className="flex items-center justify-center h-16 rounded-lg border border-dashed border-border/50">
            <p className="text-xs text-muted-foreground/50">אין לידים</p>
          </div>
        ) : (
          leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  );
}

/* ─── Board ─────────────────────────────────────────────────────────────── */

export function PipelineBoard({ leads }: { leads: LeadRow[] }) {
  const grouped = Object.fromEntries(
    PIPELINE_ORDER.map((s) => [s, leads.filter((l) => l.status === s)])
  ) as Record<LeadStatus, LeadRow[]>;

  const activeLeads = leads.filter(
    (l) => !["closed_won", "closed_lost"].includes(l.status)
  );
  const totalPipelineValue = activeLeads.reduce(
    (s, l) => s + (l.deal_value ?? 0),
    0
  );

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">{leads.length}</span> לידים
        </span>
        <span>
          <span className="font-semibold text-foreground">{activeLeads.length}</span> פעילים
        </span>
        {totalPipelineValue > 0 && (
          <span>
            שווי פייפליין:{" "}
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(totalPipelineValue)}
            </span>
          </span>
        )}
      </div>

      {/* Scrollable board */}
      <div className="overflow-x-auto pb-4 -mx-1 px-1">
        <div className="flex gap-3 min-w-max">
          {PIPELINE_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              leads={grouped[status]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
