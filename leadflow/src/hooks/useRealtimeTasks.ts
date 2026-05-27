"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { TaskRow } from "@/types/database.types";

type ChangeHandler = {
  onInsert?: (task: TaskRow) => void;
  onUpdate?: (task: TaskRow) => void;
  onDelete?: (id: string)   => void;
  leadId?:   string;
};

/**
 * useRealtimeTasks
 *
 * מנוי Realtime על טבלת tasks.
 * אם מועבר leadId — מסנן למשימות של אותו ליד בלבד.
 */
export function useRealtimeTasks({
  onInsert, onUpdate, onDelete, leadId,
}: ChangeHandler) {
  const channelRef  = useRef<RealtimeChannel | null>(null);
  const handlersRef = useRef({ onInsert, onUpdate, onDelete });

  useEffect(() => { handlersRef.current = { onInsert, onUpdate, onDelete }; });

  useEffect(() => {
    const supabase = createClient();
    const filter   = leadId ? `lead_id=eq.${leadId}` : undefined;

    channelRef.current = supabase
      .channel(`realtime:tasks${leadId ? `:${leadId}` : ""}`)
      .on<TaskRow>(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tasks", filter },
        (payload) => handlersRef.current.onInsert?.(payload.new)
      )
      .on<TaskRow>(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tasks", filter },
        (payload) => handlersRef.current.onUpdate?.(payload.new)
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "tasks" },
        (payload) => {
          if (leadId && payload.old.lead_id !== leadId) return;
          handlersRef.current.onDelete?.(payload.old.id as string);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channelRef.current!); };
  }, [leadId]);
}
