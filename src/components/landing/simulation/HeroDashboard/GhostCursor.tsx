"use client";

import { motion } from "framer-motion";
import { useSimulation } from "./SimulationContext";

export function GhostCursor() {
  const { step } = useSimulation();

  // Coordenadas absolutas em pixels baseadas no virtualWidth/virtualHeight do HeroDashboard (1600x1000)
  const variants = {
    "idle": { x: 1250, y: 875, opacity: 1, scale: 1 },
    "move-to-search": { x: 1125, y: 60, opacity: 1, scale: 1 },
    "typing": { x: 1125, y: 60, opacity: 1, scale: 1 },
    "move-to-row": { x: 1375, y: 625, opacity: 1, scale: 1 },
    "hover-row": { x: 1375, y: 625, opacity: 1, scale: 1 },
    "click-row": { x: 1375, y: 625, opacity: 1, scale: 0.8 },
    "completing": { x: 1375, y: 625, opacity: 1, scale: 1 },
    "completed": { x: 1375, y: 625, opacity: 1, scale: 1 },
    
    // Aba Demandas
    "move-to-demandas": { x: 150, y: 195, opacity: 1, scale: 1 },
    "click-demandas": { x: 150, y: 195, opacity: 1, scale: 0.8 },
    "view-demandas": { x: 150, y: 195, opacity: 1, scale: 1 },

    // Nova Demanda Modal (botão no header da aba Demandas)
    "move-to-nova-demanda": { x: 1430, y: 150, opacity: 1, scale: 1 },
    "click-nova-demanda": { x: 1430, y: 150, opacity: 1, scale: 0.8 },
    "open-demand-modal": { x: 800, y: 400, opacity: 1, scale: 1 },
    "fill-demand": { x: 800, y: 400, opacity: 1, scale: 1 },
    "save-demand": { x: 800, y: 690, opacity: 1, scale: 0.8 },
    "close-demand": { x: 800, y: 690, opacity: 1, scale: 1 },
    
    // Calendar
    "move-to-calendar": { x: 150, y: 245, opacity: 1, scale: 1 },
    "click-calendar": { x: 150, y: 245, opacity: 1, scale: 0.8 },
    "view-calendar": { x: 800, y: 500, opacity: 1, scale: 1 },
    
    // AI
    "move-to-ai": { x: 150, y: 405, opacity: 1, scale: 1 },
    "click-ai": { x: 150, y: 405, opacity: 1, scale: 0.8 },
    "view-ai": { x: 800, y: 900, opacity: 1, scale: 1 }, // Move to input bar
    "send-ai": { x: 1225, y: 900, opacity: 1, scale: 0.8 }, // Click send button
    "ai-answering": { x: 800, y: 500, opacity: 1, scale: 1 },

    // Printer
    "move-to-printer": { x: 1480, y: 50, opacity: 1, scale: 1 },
    "click-printer": { x: 1480, y: 50, opacity: 1, scale: 0.8 },
    "view-printer": { x: 800, y: 500, opacity: 1, scale: 1 },
  };

  return (
    <div
      className="absolute pointer-events-none z-[100] transition-all duration-[1500ms] ease-in-out"
      style={{
        left: 0,
        top: 0,
        transform: `translate(${variants[step as keyof typeof variants]?.x || variants["idle"].x}px, ${variants[step as keyof typeof variants]?.y || variants["idle"].y}px) scale(${variants[step as keyof typeof variants]?.scale || 1})`,
        opacity: variants[step as keyof typeof variants]?.opacity ?? 1,
      }}
    >
      <svg width="32" height="32" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M5.65376 2.15376C5.40134 1.90134 5 2.08036 5 2.43769V33.5623C5 33.9196 5.40134 34.0987 5.65376 33.8462L13.8075 25.6925H21.5623C21.9196 25.6925 22.0987 25.2912 21.8462 25.0388L5.65376 2.15376Z" 
          fill="black" 
          stroke="white" 
          strokeWidth="2.5"
        />
      </svg>
    </div>
  );
}
