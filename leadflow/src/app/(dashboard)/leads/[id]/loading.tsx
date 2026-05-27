import { LeadDetailSkeleton } from "@/components/skeletons";
export default function LeadDetailLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="h-4 w-40 rounded bg-muted animate-pulse" />
      <LeadDetailSkeleton />
    </div>
  );
}
