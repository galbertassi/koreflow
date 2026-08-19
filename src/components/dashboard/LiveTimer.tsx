"use client";

import { useEffect, useState } from "react";
import { ActiveTimer } from "@/hooks/use-demand-timer";

interface LiveTimerProps {
  demandId: string;
  spentTime: number;
  activeTimer: ActiveTimer | null;
}

export function LiveTimer({ demandId, spentTime, activeTimer }: LiveTimerProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // Only tick if this specific demand is active
    if (!activeTimer || activeTimer.demand_id !== demandId) {
      return;
    }

    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer, demandId]);

  let total = spentTime || 0;
  if (activeTimer && activeTimer.demand_id === demandId) {
    const started = new Date(activeTimer.started_at).getTime();
    const now = new Date().getTime();
    total += Math.floor((now - started) / 1000);
  }

  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const displayTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  return <>{displayTime}</>;
}
