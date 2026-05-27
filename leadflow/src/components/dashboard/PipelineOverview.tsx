"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn, formatCurrency } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants/leads";
import type { LeadStatus } from "@/types/database.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

/* ─── Config ─────────────────────────────────────────────────────────────── */

const PIPELINE_CONFIG: {
  status:  LeadStatus;
  color:   string;
  barBg:   string;
  dot:     string;
}[] = [
  { status: "new",         color: "text-slate-600  dark:text-slate-300", barBg: "bg-slate-400",   dot: "bg-slate-400"   },
  { status: "contacted",   color: "text-blue-600   dark:text-blue-300",  barBg: "bg-blue-400",    dot: "bg-blue-400"    },
  { status: "meeting",     color: "text-violet-600 dark:text-violet-300",barBg: "bg-violet-400",  dot: "bg-violet-400"  },
  { status: "proposal",    color: "text-amber-600  dark:text-amber-300", barBg: "bg-amber-400",   dot: "bg-amber-400"   },
  { status: "negotiation", color: "text-orange-600 dark:text-orange-300",barBg: "bg-orange-400",  dot: "bg-orange-400"  },
  { status: "closed_won",  color: "text-green-600  dark:text-green-300", barBg: "bg-green-500",   dot: "bg-green-500"   },
  { status: "closed_lost", color: "text-red-600    dark:text-red-300",   barBg: "bg-red-400",     dot: "bg-red-400"     },
];

/* ─── Types ─────────────────────────────────────────────────────────────── */

export interface PipelineRow {
  status:     LeadStatus;
  count:      number;
  totalValue: number;
}

/* ─── Animated bar ───────────────────────────────────────────────────────── */

function AnimatedBar({ pct, color, delay }: { pct: number; color: string; delay: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 120 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-700 ease-out", color)}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function PipelineOverview({ data }: { data: PipelineRow[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const total    = data.reduce((s, d) => s + d.count, 0);

  // Map for quick lookup
  const dataMap = Object.fromEntries(data.map((d) => [d.status, d]));

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-base">פייפליין מכירות</CardTitle>
          <CardDescription>
            {total} לידים פעילים בסה״כ
          </CardDescription>
        </div>
        <Link
          href="/leads"
          className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
        >
          כל הלידים
          <ArrowLeft className="w-3 h-3" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-3">
        {PIPELINE_CONFIG.map(({ status, color, barBg, dot }, i) => {
          const row   = dataMap[status];
          const count = row?.count      ?? 0;
          const val   = row?.totalValue ?? 0;
          const pct   = total === 0 ? 0 : (count / maxCount) * 100;

          return (
            <div key={status} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                {/* Left: dot + label */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn("w-2 h-2 rounded-full flex-shrink-0", dot)} />
                  <span className={cn("font-medium truncate", color)}>
                    {STATUS_LABELS[status]}
                  </span>
                </div>

                {/* Right: count + value */}
                <div className="flex items-center gap-3 flex-shrink-0 ms-3">
                  {val > 0 && (
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {formatCurrency(val)}
                    </span>
                  )}
                  <span className="text-sm font-bold tabular-nums w-6 text-start">
                    {count}
                  </span>
                </div>
              </div>

              {/* Bar */}
              <AnimatedBar pct={pct} color={barBg} delay={i * 60} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
