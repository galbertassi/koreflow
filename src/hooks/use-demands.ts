"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export type DemandStatus = "PENDING" | "IN_PROGRESS" | "PAUSED" | "COMPLETED";

export interface DemandRecord {
  id: string;
  title: string;
  client_name?: string;
  category_name?: string;
  category_color?: string;
  status: DemandStatus;
  type: "IN_SCOPE" | "OUT_OF_SCOPE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  spent_time_seconds: number;
  description?: string;
  created_at: string;
}

let globalDemandsCache: DemandRecord[] | null = null;

export function useDemands() {
  const [demands, setDemandsState] = useState<DemandRecord[]>(globalDemandsCache || []);
  const [loading, setLoading] = useState(!globalDemandsCache);
  const supabase = createClient();

  const setDemands = (action: DemandRecord[] | ((prev: DemandRecord[]) => DemandRecord[])) => {
    setDemandsState((prev) => {
      const next = typeof action === "function" ? action(prev) : action;
      globalDemandsCache = next;
      return next;
    });
  };

  useEffect(() => {
    let isMounted = true;
    
    async function fetchDemands() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("kore_demands")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching demands:", error);
      } else if (data && isMounted) {
        setDemands(data as DemandRecord[]);
      }
      if (isMounted) setLoading(false);
    }

    fetchDemands();

    // Supabase Realtime Subscription
    const channelId = `realtime-demands-${Math.random().toString(36).substring(7)}`;
    const channel = supabase.channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "kore_demands" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setDemands((prev) => [payload.new as DemandRecord, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setDemands((prev) => prev.map((d) => d.id === payload.new.id ? payload.new as DemandRecord : d));
          } else if (payload.eventType === "DELETE") {
            setDemands((prev) => prev.filter((d) => d.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Optimistic update helper
  const optimisticUpdate = (id: string, updates: Partial<DemandRecord>) => {
    setDemands((prev) => prev.map((d) => d.id === id ? { ...d, ...updates } : d));
  };

  return { demands, loading, optimisticUpdate };
}
