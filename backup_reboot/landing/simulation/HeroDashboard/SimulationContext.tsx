"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type SimulationStep = 
  | "idle" 
  | "move-to-search" 
  | "typing" 
  | "move-to-row" 
  | "hover-row" 
  | "click-row" 
  | "completing" 
  | "completed"
  | "move-to-demandas"
  | "click-demandas"
  | "view-demandas"
  | "move-to-nova-demanda"
  | "click-nova-demanda"
  | "open-demand-modal"
  | "fill-demand"
  | "save-demand"
  | "close-demand"
  | "move-to-calendar"
  | "click-calendar"
  | "view-calendar"
  | "move-to-ai"
  | "click-ai"
  | "view-ai"
  | "type-ai"
  | "send-ai"
  | "ai-answering"
  | "move-to-printer"
  | "click-printer"
  | "view-printer";

interface SimulationContextType {
  step: SimulationStep;
}

const SimulationContext = createContext<SimulationContextType>({ step: "idle" });

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<SimulationStep>("idle");

  useEffect(() => {
    let isActive = true;

    const runSequence = async () => {
      while (isActive) {
        setStep("idle");
        await new Promise(r => setTimeout(r, 1500));
        if (!isActive) break;
        
        setStep("move-to-search");
        await new Promise(r => setTimeout(r, 1500));
        if (!isActive) break;
        
        setStep("typing");
        await new Promise(r => setTimeout(r, 2000));
        if (!isActive) break;
        
        setStep("move-to-row");
        await new Promise(r => setTimeout(r, 1500));
        if (!isActive) break;
        
        setStep("hover-row");
        await new Promise(r => setTimeout(r, 1000));
        if (!isActive) break;
        
        setStep("click-row");
        await new Promise(r => setTimeout(r, 500));
        if (!isActive) break;
        
        setStep("completing");
        await new Promise(r => setTimeout(r, 1200));
        if (!isActive) break;
        
        setStep("completed");
        await new Promise(r => setTimeout(r, 1500));
        if (!isActive) break;

        // Aba Demandas
        setStep("move-to-demandas");
        await new Promise(r => setTimeout(r, 1500));
        if (!isActive) break;

        setStep("click-demandas");
        await new Promise(r => setTimeout(r, 500));
        if (!isActive) break;

        setStep("view-demandas");
        await new Promise(r => setTimeout(r, 2500));
        if (!isActive) break;

        // Nova Demanda Modal
        setStep("move-to-nova-demanda");
        await new Promise(r => setTimeout(r, 1500));
        if (!isActive) break;

        setStep("click-nova-demanda");
        await new Promise(r => setTimeout(r, 500));
        if (!isActive) break;

        setStep("open-demand-modal");
        await new Promise(r => setTimeout(r, 1200));
        if (!isActive) break;

        setStep("fill-demand");
        await new Promise(r => setTimeout(r, 2500));
        if (!isActive) break;

        setStep("save-demand");
        await new Promise(r => setTimeout(r, 800));
        if (!isActive) break;

        setStep("close-demand");
        await new Promise(r => setTimeout(r, 1200));
        if (!isActive) break;

        // Calendar
        setStep("move-to-calendar");
        await new Promise(r => setTimeout(r, 1500));
        if (!isActive) break;

        setStep("click-calendar");
        await new Promise(r => setTimeout(r, 500));
        if (!isActive) break;

        setStep("view-calendar");
        await new Promise(r => setTimeout(r, 3000));
        if (!isActive) break;

        // AI
        setStep("move-to-ai");
        await new Promise(r => setTimeout(r, 1500));
        if (!isActive) break;

        setStep("click-ai");
        await new Promise(r => setTimeout(r, 500));
        if (!isActive) break;

        setStep("view-ai");
        await new Promise(r => setTimeout(r, 1500));
        if (!isActive) break;

        setStep("type-ai");
        await new Promise(r => setTimeout(r, 2500));
        if (!isActive) break;

        setStep("send-ai");
        await new Promise(r => setTimeout(r, 600));
        if (!isActive) break;

        setStep("ai-answering");
        await new Promise(r => setTimeout(r, 4500));
        if (!isActive) break;

        // Printer
        setStep("move-to-printer");
        await new Promise(r => setTimeout(r, 1500));
        if (!isActive) break;

        setStep("click-printer");
        await new Promise(r => setTimeout(r, 500));
        if (!isActive) break;

        setStep("view-printer");
        await new Promise(r => setTimeout(r, 4000));
        if (!isActive) break;

        // Voltar pro inicio (opcional, loop reinicia)
      }
    };
    
    runSequence();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <SimulationContext.Provider value={{ step }}>
      {children}
    </SimulationContext.Provider>
  );
}

export const useSimulation = () => useContext(SimulationContext);
