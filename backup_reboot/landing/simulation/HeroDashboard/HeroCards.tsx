import { ClipboardList, CheckCircle2, Hourglass, Clock, PlusCircle, AlarmClock, ArrowUp } from "lucide-react";
import { useSimulation } from "./SimulationContext";

export function HeroCards() {
  const { step } = useSimulation();
  
  const isCompleted = step === "completing" || step === "completed";

  const topCards = [
    { title: "Total de Demandas", value: "4", icon: ClipboardList, color: "text-[#8B5CF6]", bgColor: "bg-[#8B5CF6]/10", trendValue: "100%", trendText: "do total", trendUp: true, trendColor: "text-[#8B5CF6]" },
    { title: "Concluídas", value: isCompleted ? "1" : "0", icon: CheckCircle2, color: "text-emerald-500", bgColor: "bg-emerald-500/10", trendValue: isCompleted ? "25%" : "0%", trendText: "do total", trendUp: null, trendColor: "text-emerald-500" },
    { title: "Em andamento", value: isCompleted ? "0" : "1", icon: Hourglass, color: "text-blue-500", bgColor: "bg-blue-500/10", trendValue: isCompleted ? "0%" : "25%", trendText: "do total", trendUp: null, trendColor: "text-blue-500" },
    { title: "Pendentes", value: "2", icon: Clock, color: "text-amber-500", bgColor: "bg-amber-500/10", trendValue: "50%", trendText: "do total", trendUp: null, trendColor: "text-amber-500" },
    { title: "Extras", value: "0", icon: PlusCircle, color: "text-orange-500", bgColor: "bg-orange-500/10", trendValue: "0%", trendText: "do total", trendUp: null, trendColor: "text-orange-500" },
    { title: "Atrasadas", value: "1", icon: AlarmClock, color: "text-red-500", bgColor: "bg-red-500/10", trendValue: "25%", trendText: "do total", trendUp: null, trendColor: "text-red-500" },
  ];

  return (
    <div className="grid grid-cols-6 gap-3 xl:gap-4 shrink-0">
      {topCards.map((card, idx) => (
        <div key={idx} className={`bg-white rounded-[16px] p-3 xl:p-5 shadow-sm border flex items-center gap-2 xl:gap-4 relative overflow-hidden group transition-all duration-500 ${isCompleted && (idx === 1 || idx === 2) ? 'border-emerald-500/50 bg-emerald-50/50' : 'border-border/50'}`}>
          <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center shrink-0 ${card.color} transition-colors duration-500`}>
            <card.icon className="w-6 h-6" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-medium text-slate-500 mb-0.5 truncate">{card.title}</span>
            <h3 className={`text-3xl font-semibold tracking-tight transition-colors duration-500 ${isCompleted && idx === 1 ? 'text-emerald-600' : 'text-slate-900'}`}>{card.value}</h3>
            <div className="flex items-center gap-1 text-[11px] font-medium mt-1">
              <span className={`flex items-center transition-colors duration-500 ${card.trendColor}`}>
                {card.trendUp && <ArrowUp className="w-3 h-3 mr-0.5" />}
                {card.trendValue}
              </span>
              <span className="text-slate-400 font-normal truncate">{card.trendText}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
