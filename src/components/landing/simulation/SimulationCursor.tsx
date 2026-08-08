"use client";

import { motion } from "framer-motion";
import { MousePointer2 } from "lucide-react";

interface SimulationCursorProps {
  x: number;
  y: number;
  isClicking: boolean;
}

export function SimulationCursor({ x, y, isClicking }: SimulationCursorProps) {
  return (
    <motion.div
      className="absolute top-0 left-0 pointer-events-none z-[100] flex items-center justify-center"
      animate={{
        x,
        y,
        scale: isClicking ? 0.8 : 1,
      }}
      transition={{
        x: { type: "spring", stiffness: 100, damping: 20, mass: 0.5 },
        y: { type: "spring", stiffness: 100, damping: 20, mass: 0.5 },
        scale: { duration: 0.1 },
      }}
    >
      <MousePointer2 className="w-5 h-5 text-black drop-shadow-md fill-white" />
      {isClicking && (
        <motion.div
          initial={{ opacity: 1, scale: 0 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ duration: 0.3 }}
          className="absolute w-8 h-8 rounded-full border-2 border-primary"
        />
      )}
    </motion.div>
  );
}
