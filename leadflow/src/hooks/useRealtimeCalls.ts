"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { CallRow } from "@/types/database.types";

type ChangeHandler = {
  onInsert?: (call: CallRow) => void;
  onUpdate?: (call: CallRow) => void;
  onDelete?: (id: string)   => void;
  leadId?:   string;         // if provided, filter to only this lead's calls
};

/**
 * useRealtimeCalls
 *
 * מנוי Realtime על טבלת calls.
 * אם מועבר leadId — מסנן לשיחות של אותו ליד בלבד.
 */
export function useRealtimeCalls({
  onInsert, onUpdate, onDelete, leadId,
}: ChangeHandler) {
  const channelRef  = useRef<RealtimeChannel | null>(null);
  const handlersRef = useRef({ onInsert, onUpdate, onDelete });

  useEffect(() => { handlersRef.current = { onInsert, onUpdate, onDelete }; });

  useEffect(() => {
    const supabase = createClient();

    const filter = leadId ? `lead_id=eq.${leadId}` : undefined;

    channelRef.current = supabase
      .channel(`realtime:calls${leadId ? `:${leadId}` : ""}`)
      .on<CallRow>(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "calls", filter },
        (payload) => handlersRef.current.onInsert?.(payload.new)
      )
      .on<CallRow>(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "calls", filter },
        (payload) => handlersRef.current.onUpdate?.(payload.new)
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "calls" },
        (payload) => {
          const id = payload.old.id as string;
          // if leadId filter active, check lead_id matches
          if (leadId && payload.old.lead_id !== leadId) return;
          handlersRef.current.onDelete?.(id);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channelRef.current!); };
  }, [leadId]);
}
