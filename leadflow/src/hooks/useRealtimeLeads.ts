"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { LeadRow } from "@/types/database.types";

type ChangeHandler = {
  onInsert?: (lead: LeadRow) => void;
  onUpdate?: (lead: LeadRow) => void;
  onDelete?: (id: string)   => void;
};

/**
 * useRealtimeLeads
 *
 * מנוי Realtime על טבלת leads.
 * מפעיל callback על INSERT / UPDATE / DELETE.
 * מנקה את ה-subscription אוטומטית כשהקומפוננט מתפרק.
 *
 * @example
 * useRealtimeLeads({
 *   onInsert: (lead) => setLeads(prev => [lead, ...prev]),
 *   onUpdate: (lead) => setLeads(prev => prev.map(l => l.id === lead.id ? lead : l)),
 *   onDelete: (id)   => setLeads(prev => prev.filter(l => l.id !== id)),
 * });
 */
export function useRealtimeLeads(handlers: ChangeHandler) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const handlersRef = useRef(handlers);

  // Keep handlers ref fresh without re-subscribing
  useEffect(() => { handlersRef.current = handlers; });

  useEffect(() => {
    const supabase = createClient();

    channelRef.current = supabase
      .channel("realtime:leads")
      .on<LeadRow>(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leads" },
        (payload) => handlersRef.current.onInsert?.(payload.new)
      )
      .on<LeadRow>(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "leads" },
        (payload) => handlersRef.current.onUpdate?.(payload.new)
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "leads" },
        (payload) => handlersRef.current.onDelete?.(payload.old.id as string)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelRef.current!);
    };
  }, []); // intentionally empty — handlers kept fresh via ref
}
