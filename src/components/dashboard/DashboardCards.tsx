"use client";

import { ClipboardList, CheckCircle2, Hourglass, Clock, PlusCircle, AlarmClock, ArrowUp } from "lucide-react";
import { useDemands } from "@/hooks/use-demands";

export function DashboardCards() {
  const { demands } = useDemands();

  const atividadesTotais = demands.length;
  const entregues = demands.filter((e) => e.status.toLowerCase().includes("concluid") || e.status.toLowerCase().includes("completa") || e.status.toLowerCase() === "completed").length;
  const emProducao = demands.filter((e) => e.status.toLowerCase().includes("produc") || e.status.toLowerCase().includes("andamento") || e.status.toLowerCase() === "in_progress").length;
  const aguardando = demands.filter((e) => e.status.toLowerCase().includes("pendente") || e.status.toLowerCase().includes("aguard") || e.status.toLowerCase() === "pending" || e.status.toLowerCase() === "paused").length;
  const emRisco = demands.filter((e) => e.priority === "URGENT").length;
  const demandasExtrasCount = demands.filter((e) => e.type === "OUT_OF_SCOPE").length;

  const topCards = [
    { title: "Total de Demandas", value: atividadesTotais.toString(), icon: ClipboardList, color: "text-[#8B5CF6]", bgColor: "bg-[#8B5CF6]/10", trendValue: "100%", trendText: "do total", trendUp: true, trendColor: "text-[#8B5CF6]" },
    { title: "Conclu├¡das", value: entregues.toString(), icon: CheckCircle2, color: "text-emerald-500", bgColor: "bg-emerald-500/10", trendValue: atividadesTotais ? `${Math.round((entregues / atividadesTotais) * 100)}%` : "0%", trendText: "do total", trendUp: null, trendColor: "text-emerald-500" },
    { title: "Em andamento", value: emProducao.toString(), icon: Hourglass, color: "text-blue-500", bgColor: "bg-blue-500/10", trendValue: atividadesTotais ? `${Math.round((emProducao / atividadesTotais) * 100)}%` : "0%", trendText: "do total", trendUp: null, trendColor: "text-blue-500" },
    { title: "Pendentes", value: aguardando.toString(), icon: Clock, color: "text-amber-500", bgColor: "bg-amber-500/10", trendValue: atividadesTotais ? `${Math.round((aguardando / atividadesTotais) * 100)}%` : "0%", trendText: "do total", trendUp: null, trendColor: "text-amber-500" },
    { title: "Extras", value: demandasExtrasCount.toString(), icon: PlusCircle, color: "text-orange-500", bgColor: "bg-orange-500/10", trendValue: atividadesTotais ? `${Math.round((demandasExtrasCount / atividadesTotais) * 100)}%` : "0%", trendText: "do total", trendUp: null, trendColor: "text-orange-500" },
    { title: "Atrasadas", value: emRisco.toString(), icon: AlarmClock, color: "text-red-500", bgColor: "bg-red-500/10", trendValue: atividadesTotais ? `${Math.round((emRisco / atividadesTotais) * 100)}%` : "0%", trendText: "do total", trendUp: null, trendColor: "text-red-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 print:grid-cols-6 gap-3 xl:gap-4">
      {topCards.map((card, idx) => (
        <div key={idx} className="bg-white rounded-[16px] p-3 xl:p-5 shadow-sm border border-border/50 flex items-center gap-2 xl:gap-4 relative overflow-hidden group print:break-inside-avoid print:p-2">
          <div className={`w-8 h-8 xl:w-12 xl:h-12 print:w-8 print:h-8 rounded-xl ${card.bgColor} flex items-center justify-center shrink-0 ${card.color}`}>
            <card.icon className="w-4 h-4 xl:w-6 xl:h-6 print:w-4 print:h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] xl:text-[12px] print:text-[10px] font-medium text-muted-foreground mb-0.5 truncate">{card.title}</span>
            <h3 className="text-xl xl:text-3xl print:text-xl font-semibold tracking-tight text-foreground">{card.value}</h3>
            <div className="flex items-center gap-1 text-[9px] xl:text-[11px] print:text-[9px] font-medium mt-1">
              <span className={`flex items-center ${card.trendColor}`}>
                {card.trendUp && <ArrowUp className="w-2.5 h-2.5 xl:w-3 xl:h-3 mr-0.5" />}
                {card.trendValue}
              </span>
              <span className="text-muted-foreground font-normal truncate">{card.trendText}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
