"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export interface ActiveTimer {
  id: string;
  demand_id: string;
  started_at: string;
}

export function useDemandTimer() {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    
    async function fetchActiveTimer() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (isMounted) setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from("kore_demand_time_logs")
        .select("*")
        .eq("user_id", user.id)
        .is("ended_at", null)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching active timer:", error);
      } else if (data && isMounted) {
        setActiveTimer(data as ActiveTimer);
      } else if (isMounted) {
        setActiveTimer(null);
      }
    }

    fetchActiveTimer();

    const channel = supabase.channel("realtime-time-logs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "kore_demand_time_logs" },
        (payload) => {
          // Precisamos garantir que apenas os timers do usu├írio atual atualizem o estado
          // Usamos a verifica├º├úo pelo ID da row que recebemos
          if (payload.new && currentUserId && (payload.new as any).user_id === currentUserId) {
            if (payload.eventType === "INSERT") {
              setActiveTimer(payload.new as ActiveTimer);
            } else if (payload.eventType === "UPDATE" && (payload.new as any).ended_at !== null) {
              // Timer ended
              setActiveTimer(null);
            } else if (payload.eventType === "UPDATE" && payload.new.ended_at === null) {
              // Just in case it updates while active
              setActiveTimer(payload.new as ActiveTimer);
            }
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, currentUserId]);

  // We remove the interval from here so the hook doesn't force a re-render every second.
  // The visual calculation will be handled by a specific LiveTimer component.

  // Helper to format total seconds into HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper to get total formatted time for a demand (STATIC, does not tick every second)
  const getDisplayTime = (demandId: string, demandSpentSeconds: number) => {
    let total = demandSpentSeconds || 0;
    if (activeTimer && activeTimer.demand_id === demandId) {
      const started = new Date(activeTimer.started_at).getTime();
      const now = new Date().getTime();
      total += Math.floor((now - started) / 1000);
    }
    return formatTime(total);
  };

  return { activeTimer, getDisplayTime, setActiveTimer };
}
