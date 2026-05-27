import { StatsRowSkeleton, TableSkeleton } from "@/components/skeletons";
export default function CallsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-24 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-56 rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="h-10 w-36 rounded-lg bg-muted animate-pulse" />
      </div>
      <StatsRowSkeleton />
      <TableSkeleton rows={12} cols={7} />
    </div>
  );
}
