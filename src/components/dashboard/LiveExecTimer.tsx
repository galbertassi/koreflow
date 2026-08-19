"use client";

import { useEffect, useState } from "react";
import { Execucao } from "@/hooks/use-store";

interface LiveExecTimerProps {
  execucao: Execucao;
}

export function LiveExecTimer({ execucao }: LiveExecTimerProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!execucao.timerStart) return;

    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [execucao.timerStart]);

  let total = execucao.tempoGasto || 0;
  if (execucao.timerStart) {
    total += Math.floor((Date.now() - execucao.timerStart) / 1000);
  }

  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const displayTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  return <>{displayTime}</>;
}
