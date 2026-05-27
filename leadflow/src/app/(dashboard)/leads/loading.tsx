import { StatsRowSkeleton, TableSkeleton } from "@/components/skeletons";
export default function LeadsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-24 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-48 rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-muted animate-pulse" />
      </div>
      <StatsRowSkeleton />
      <TableSkeleton rows={10} cols={8} />
    </div>
  );
}
