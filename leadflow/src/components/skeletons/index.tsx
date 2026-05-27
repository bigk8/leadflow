import { cn } from "@/lib/utils";

/* ─── Base pulse block ───────────────────────────────────────────────────── */

function Pulse({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-lg bg-muted", className)} />
  );
}

/* ─── Stat card skeleton ─────────────────────────────────────────────────── */

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 p-6 space-y-3">
      <div className="flex items-center justify-between">
        <Pulse className="h-4 w-28" />
        <Pulse className="h-9 w-9 rounded-xl" />
      </div>
      <Pulse className="h-8 w-20" />
      <Pulse className="h-3 w-24" />
    </div>
  );
}

export function StatsRowSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ─── Table skeleton ─────────────────────────────────────────────────────── */

export function TableRowSkeleton({ cols = 7 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border/50">
      {Array.from({ length: cols }).map((_, i) => (
        <Pulse
          key={i}
          className={cn(
            "h-4 flex-shrink-0",
            i === 0 ? "w-32" :
            i === 1 ? "w-24" :
            i === 2 ? "w-20" :
            i === cols - 1 ? "w-16" : "w-20"
          )}
        />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 8, cols = 7 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 bg-muted/30 border-b border-border">
        {Array.from({ length: cols }).map((_, i) => (
          <Pulse key={i} className={cn("h-4", i === 0 ? "w-20" : "w-16")} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} cols={cols} />
      ))}
    </div>
  );
}

/* ─── Lead detail skeleton ───────────────────────────────────────────────── */

export function LeadDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Pulse className="w-14 h-14 rounded-2xl flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <Pulse className="h-7 w-48" />
          <Pulse className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Pulse className="h-9 w-32 rounded-full" />
          <Pulse className="h-9 w-28 rounded-full" />
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex gap-3">
        <Pulse className="h-10 w-48 rounded-lg" />
        <Pulse className="h-10 w-36 rounded-lg" />
      </div>

      {/* 2-col */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left card */}
        <div className="rounded-xl border border-border/50 p-6 space-y-4">
          <Pulse className="h-4 w-20" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Pulse className="w-8 h-8 rounded-lg flex-shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Pulse className="h-3 w-16" />
                <Pulse className="h-4 w-28" />
              </div>
            </div>
          ))}
        </div>

        {/* Right tabs */}
        <div className="lg:col-span-2 space-y-4">
          <Pulse className="h-10 w-full rounded-lg" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Pulse className="w-9 h-9 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <Pulse className="h-4 w-40" />
                <Pulse className="h-3 w-60" />
                <Pulse className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Dashboard skeleton ─────────────────────────────────────────────────── */

export function DashboardSkeleton() {
  return (
    <div className="space-y-7">
      {/* Greeting */}
      <div className="space-y-2">
        <Pulse className="h-8 w-64" />
        <Pulse className="h-4 w-40" />
      </div>

      {/* Stats */}
      <StatsRowSkeleton />

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border/50 p-6 space-y-4">
          <Pulse className="h-5 w-32" />
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Pulse className="h-4 w-24" />
                <Pulse className="h-4 w-8" />
              </div>
              <Pulse className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border/50 p-6 space-y-3">
          <Pulse className="h-5 w-36" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border/40">
              <Pulse className="w-5 h-5 rounded-full mt-0.5" />
              <div className="flex-1 space-y-2">
                <Pulse className="h-4 w-48" />
                <div className="flex gap-2">
                  <Pulse className="h-3 w-16 rounded-full" />
                  <Pulse className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent leads */}
      <div className="rounded-xl border border-border/50 p-6 space-y-2">
        <Pulse className="h-5 w-32 mb-4" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Pulse className="w-9 h-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Pulse className="h-4 w-36" />
              <Pulse className="h-3 w-24" />
            </div>
            <Pulse className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
