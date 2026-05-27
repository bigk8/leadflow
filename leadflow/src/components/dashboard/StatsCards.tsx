"use client";

import { useEffect, useRef, useState } from "react";
import {
  Users, TrendingUp, Target, Wallet,
  ArrowUp, ArrowDown, Minus,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

/* ─── Animated counter ──────────────────────────────────────────────────── */

function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start      = performance.now();
    const startValue = 0;

    const tick = (now: number) => {
      const elapsed  = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - elapsed, 3); // ease-out-cubic
      setValue(Math.round(startValue + (target - startValue) * eased));
      if (elapsed < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

/* ─── Single stat card ──────────────────────────────────────────────────── */

interface StatCardProps {
  title:       string;
  value:       number;
  formatted?:  string;   // if provided, show instead of raw value
  icon:        React.ElementType;
  color:       string;
  bg:          string;
  trend?:      number;   // percentage vs last period (positive = good)
  trendLabel?: string;
  delay?:      number;
}

function StatCard({
  title, value, formatted, icon: Icon,
  color, bg, trend, trendLabel = "מהחודש הקודם", delay = 0,
}: StatCardProps) {
  const count  = useCountUp(value, 900 + delay);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const TrendIcon = trend === undefined || trend === 0
    ? Minus
    : trend > 0 ? ArrowUp : ArrowDown;
  const trendColor = trend === undefined || trend === 0
    ? "text-muted-foreground"
    : trend > 0 ? "text-green-500" : "text-red-500";

  return (
    <Card className={cn(
      "border-border/50 overflow-hidden transition-all duration-500",
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tabular-nums tracking-tight">
              {formatted
                ? formatted   // currency — don't animate the string, show static
                : count.toLocaleString("he-IL")}
            </p>
          </div>
          <div className={cn("p-3 rounded-xl flex-shrink-0", bg)}>
            <Icon className={cn("w-5 h-5", color)} />
          </div>
        </div>

        {trend !== undefined && (
          <div className={cn("flex items-center gap-1 mt-3 text-xs font-medium", trendColor)}>
            <TrendIcon className="w-3 h-3" />
            <span>
              {trend === 0 ? "ללא שינוי" : `${Math.abs(trend)}% ${trendLabel}`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Props ─────────────────────────────────────────────────────────────── */

export interface StatsData {
  totalLeads:    number;
  activeLeads:   number;
  closedWon:     number;
  totalValue:    number;
  // Optional trend data
  trends?: {
    totalLeads:  number;
    activeLeads: number;
    closedWon:   number;
    totalValue:  number;
  };
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function StatsCards({ data }: { data: StatsData }) {
  const cards = [
    {
      title:    "סה״כ לידים",
      value:    data.totalLeads,
      icon:     Users,
      color:    "text-blue-500",
      bg:       "bg-blue-100 dark:bg-blue-950/40",
      trend:    data.trends?.totalLeads,
      delay:    0,
    },
    {
      title:    "לידים פעילים",
      value:    data.activeLeads,
      icon:     TrendingUp,
      color:    "text-violet-500",
      bg:       "bg-violet-100 dark:bg-violet-950/40",
      trend:    data.trends?.activeLeads,
      delay:    75,
    },
    {
      title:    "עסקאות שנסגרו",
      value:    data.closedWon,
      icon:     Target,
      color:    "text-green-500",
      bg:       "bg-green-100 dark:bg-green-950/40",
      trend:    data.trends?.closedWon,
      delay:    150,
    },
    {
      title:     "ערך עסקאות סגורות",
      value:     data.totalValue,
      formatted: formatCurrency(data.totalValue),
      icon:      Wallet,
      color:     "text-amber-500",
      bg:        "bg-amber-100 dark:bg-amber-950/40",
      trend:     data.trends?.totalValue,
      delay:     225,
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
