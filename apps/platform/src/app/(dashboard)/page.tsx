"use client";

import { useState } from "react";
import { useStore } from "@/hooks/use-store";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { LatestDemands } from "@/components/dashboard/LatestDemands";
import { DashboardActions } from "@/components/dashboard/DashboardActions";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"visao-geral" | "criacoes">("visao-geral");
  const { configuracoes } = useStore();
  const nomeUsuario = configuracoes?.nome ? configuracoes.nome.split(" ")[0] : "Usuário";

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto py-6 px-2">
      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border/60 mb-6 px-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
        <button
          onClick={() => setActiveTab("visao-geral")}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "visao-geral" ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"}`}
        >
          Visão Geral
          {activeTab === "visao-geral" && (
            <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#8B5CF6] rounded-t-full"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("criacoes")}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "criacoes" ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"}`}
        >
          Criações
          {activeTab === "criacoes" && (
            <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#8B5CF6] rounded-t-full"></span>
          )}
        </button>
      </div>

      {activeTab === "visao-geral" && (
        <div className="flex flex-col gap-4 xl:gap-6 w-full">
          <DashboardCards />
          <DashboardCharts />
          <LatestDemands />
        </div>
      )}

      {activeTab === "criacoes" && (
        <div className="max-w-4xl mx-auto py-12 px-4 w-full">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-3xl font-medium tracking-tight mb-3 text-foreground">
              Bem-vindo(a), {nomeUsuario}.
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Planejamento, execução e entregas centralizados em um único fluxo.
            </p>
          </div>

          {/* Checklist Inicial / Criações */}
          <DashboardActions />
        </div>
      )}
    </div>
  );
}
