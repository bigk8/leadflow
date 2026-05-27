"use client";

import { useState, useEffect } from "react";
import { AlertCircle, X, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function MigrationBanner() {
  const [needsMigration, setNeedsMigration] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Check if is_favorite column exists by trying a simple query
    async function checkMigration() {
      try {
        const { error } = await supabase
          .from("leads")
          .select("id, is_favorite")
          .limit(1);

        if (error?.message?.includes("is_favorite") || error?.code === "42703") {
          setNeedsMigration(true);
        } else {
          // Column exists, no migration needed
          setNeedsMigration(false);
        }
      } catch (err) {
        // Silent fail - column exists or other error
      }
    }

    checkMigration();
  }, [supabase]);

  const handleApplyMigration = async () => {
    setIsApplying(true);
    try {
      // Try to apply the migration
      const response = await fetch('/api/migrate-is-favorite', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('✅ Migration applied! Refreshing...');
        // Wait a moment then reload
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error(result.error || 'Failed to apply migration');
      }
    } catch (error) {
      toast.error('Could not auto-apply. Please use Supabase Dashboard.');
      console.error('Migration error:', error);
    } finally {
      setIsApplying(false);
    }
  };

  if (!needsMigration || dismissed) return null;

  const sqlCommand = `ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_favorite boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_leads_is_favorite ON public.leads(user_id, is_favorite) WHERE is_favorite = true;`;

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
            דרוש עדכון בסיס נתונים
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
            כדי להשתמש בתכונת הכוכבים (מועדפים), יש להחיל migration אחד בדאטהבייס שלך.
          </p>
          <div className="bg-white dark:bg-slate-900 rounded p-2 mb-3 font-mono text-xs overflow-auto max-h-24">
            <pre className="whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300">
              {sqlCommand}
            </pre>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(sqlCommand);
              }}
              className="text-xs"
            >
              העתק SQL
            </Button>
            <Button
              size="sm"
              variant="outline"
              asChild
              className="text-xs"
            >
              <a
                href="https://app.supabase.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Supabase Dashboard
              </a>
            </Button>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
