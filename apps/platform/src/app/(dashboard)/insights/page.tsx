"use client";

import { BarChart2, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

export default function InsightsPage() {
  const kpis = [
    { label: "Taxa de entrega", value: "—", sub: "Sem dados suficientes", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Tempo medio de execucao", value: "—", sub: "Sem dados suficientes", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Tendencia do mes", value: "—", sub: "Sem dados suficientes", icon: TrendingUp, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">Analise sua performance e tome decisoes com base em dados.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl border border-border/50 p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${kpi.bg} flex items-center justify-center shrink-0`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{kpi.label}</p>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty chart areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {["Execucoes por semana", "Distribuicao por categoria"].map((title) => (
          <div key={title} className="bg-white rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#8B5CF6]/5 flex items-center justify-center mb-3">
              <BarChart2 className="w-7 h-7 text-[#8B5CF6]/40" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
            <p className="text-xs text-muted-foreground max-w-[180px]">
              Os graficos aparecerao automaticamente conforme voce registrar execucoes.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
