"use client";
import { PageError } from "@/components/ui/error-boundary";
export default function DashboardError({
  error, reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError error={error} reset={reset} title="שגיאה בדאשבורד" />;
}
