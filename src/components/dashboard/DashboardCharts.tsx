"use client";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { ChevronRight } from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { useDemands } from "@/hooks/use-demands";

export function DashboardCharts() {
  const { configuracoes } = useStore();
  const { demands } = useDemands();

  const mapDemandStatus = (status: string) => {
    switch (status) {
      case "PENDING": return "Pendente";
      case "IN_PROGRESS": return "Em andamento";
      case "COMPLETED": return "Concluída";
      case "PAUSED": return "Pausada";
      case "REVIEW": return "Em revisão";
      case "CANCELLED": return "Cancelada";
      default: return "Pendente";
    }
  };

  const statusCounts = demands.reduce((acc, exec) => {
    const statusName = mapDemandStatus(exec.status);
    acc[statusName] = (acc[statusName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getHexFromTailwind = (twClass: string) => {
    if (!twClass) return "#94a3b8";
    if (twClass.startsWith("#")) return twClass;
    if (twClass.includes("emerald")) return "#10b981";
    if (twClass.includes("blue")) return "#3b82f6";
    if (twClass.includes("amber")) return "#f59e0b";
    if (twClass.includes("indigo")) return "#6366f1";
    if (twClass.includes("purple")) return "#a855f7";
    if (twClass.includes("pink")) return "#ec4899";
    if (twClass.includes("red")) return "#ef4444";
    if (twClass.includes("slate")) return "#64748b";
    if (twClass.includes("cyan")) return "#06b6d4";
    if (twClass.includes("8B5CF6")) return "#8b5cf6";
    return "#94a3b8";
  };

  const fluxoData = configuracoes.etiquetas.map(etq => ({
    name: etq.nome,
    value: statusCounts[etq.nome] || 0,
    color: getHexFromTailwind(etq.cor)
  })).filter(d => d.value > 0);

  const categories = demands.reduce((acc, e) => {
    const cat = (e as any).category || "Sem categoria";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const distribuicaoData = Object.entries(categories).map(([name, value]) => ({
    name, value
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 print:grid-cols-3 gap-4 xl:gap-6">
      {/* Fluxo de Execu├º├úo */}
      <div className="bg-white rounded-[24px] p-4 xl:p-6 print:p-4 shadow-sm border border-border/50 print:break-inside-avoid min-w-0 overflow-hidden">
        <h3 className="font-semibold text-base mb-6">Demandas por Status</h3>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-[200px] h-[200px] relative shrink-0">
            <ResponsiveContainer width="99%" height="100%">
              <PieChart>
                <Pie
                  data={fluxoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {fluxoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full sm:flex-1 sm:pl-4 flex flex-row sm:flex-col flex-wrap gap-3 justify-center sm:justify-start min-w-0">
            {fluxoData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                <span className="text-[13px] text-muted-foreground truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border/50">
          <button className="text-[13px] font-medium text-foreground hover:text-[#8B5CF6] transition-colors flex items-center gap-1">
            Ver detalhes <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Distribui├º├úo de Atividades */}
      <div className="bg-white rounded-[24px] p-4 xl:p-6 print:p-4 shadow-sm border border-border/50 print:break-inside-avoid min-w-0 overflow-hidden">
        <h3 className="font-semibold text-base mb-6">Demandas por Categoria</h3>
        <div className="h-[200px] w-full overflow-hidden">
          <ResponsiveContainer width="99%" height="100%">
            <BarChart
              data={distribuicaoData}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 40, bottom: 0 }}
              barSize={12}
            >
              <XAxis type="number" hide domain={[0, 'dataMax + 1']} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={90} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
              <Bar dataKey="value" fill="#1e1b4b" radius={[0, 4, 4, 0]}>
                <LabelList dataKey="value" position="right" style={{ fill: '#64748b', fontSize: '12px' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 pt-4 border-t border-border/50">
          <button className="text-[13px] font-medium text-foreground hover:text-[#8B5CF6] transition-colors flex items-center gap-1">
            Ver detalhes <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Tempo Investido */}
      <div className="bg-white rounded-[24px] p-4 xl:p-6 print:p-4 shadow-sm border border-border/50 flex flex-col print:break-inside-avoid min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-base">Tempo Investido</h3>
          <button className="text-xs font-medium text-muted-foreground flex items-center gap-1 hover:text-foreground">
            Ver todas <ChevronDownIcon className="w-3 h-3" />
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[13px] font-medium text-foreground/80">Tempo Produtivo</span>
            </div>
            <span className="text-[13px] font-medium text-emerald-500">24h 30m</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-[13px] font-medium text-foreground/80">Demandas Extras</span>
            </div>
            <span className="text-[13px] font-medium text-orange-500">4h 15m</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-[13px] font-medium text-foreground/80">Interrup├º├Áes</span>
            </div>
            <span className="text-[13px] font-medium text-red-500">2h 45m</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
          <span className="font-semibold text-[15px]">Total Semanal</span>
          <span className="font-semibold text-[15px] text-[#8B5CF6]">31h 30m</span>
        </div>
      </div>
    </div>
  );
}

function ChevronDownIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
