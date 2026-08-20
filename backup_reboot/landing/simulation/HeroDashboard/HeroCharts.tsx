import { ChevronRight, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";

export function HeroCharts() {
  const fluxoData = [
    { name: "Pendente", value: 2, color: "#f59e0b" },
    { name: "Atrasada", value: 1, color: "#ef4444" },
    { name: "Em andamento", value: 1, color: "#3b82f6" },
  ];

  const distribuicaoData = [
    { name: "Comercial", value: 3 },
    { name: "Contratos", value: 1 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-6 shrink-0">
      {/* Fluxo de Execução */}
      <div className="bg-white rounded-[24px] p-4 xl:p-6 shadow-sm border border-border/50 min-w-0 overflow-hidden">
        <h3 className="font-semibold text-base mb-6">Demandas por Status</h3>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-[120px] h-[120px] relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={fluxoData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value" stroke="none">
                  {fluxoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
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

      {/* Distribuição de Atividades */}
      <div className="bg-white rounded-[24px] p-4 xl:p-6 shadow-sm border border-border/50 min-w-0 overflow-hidden">
        <h3 className="font-semibold text-base mb-6">Demandas por Categoria</h3>
        <div className="h-[120px] w-full overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribuicaoData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }} barSize={12}>
              <XAxis type="number" hide domain={[0, 'dataMax + 1']} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={80} />
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
      <div className="bg-white rounded-[24px] p-4 xl:p-6 shadow-sm border border-border/50 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-base">Tempo Investido</h3>
          <button className="text-xs font-medium text-muted-foreground flex items-center gap-1 hover:text-foreground">
            Ver todas <ChevronDown className="w-3 h-3" />
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
              <span className="text-[13px] font-medium text-foreground/80">Interrupções</span>
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
