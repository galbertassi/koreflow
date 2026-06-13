"use client";

import { useEffect } from "react";
import { useStore } from "@/hooks/use-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { configuracoes } = useStore();

    useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.classList.remove("gray");
  }, []);

  return <>{children}</>;
}
