import { Search, Filter, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useSimulation } from "./SimulationContext";

export function HeroTable() {
  const { step } = useSimulation();

  const isCompleted = step === "completing" || step === "completed";

  const tableData = [
    {
      id: "DEM-001",
      displayId: "DEM1",
      data: "15/07/2026",
      atividade: "Revisão de Contrato",
      planejamento: "IN_SCOPE",
      planejamentoText: "Planejado",
      planejamentoColor: "bg-slate-100 text-slate-600",
      prioridade: "Urgente",
      prioridadeColor: "text-red-500 font-bold",
      resp: "Você",
      status: isCompleted ? "Concluída" : "Em andamento",
      statusColor: isCompleted ? "bg-[#10b981]/20 text-[#10b981]" : "bg-[#3b82f6]/20 text-[#3b82f6]",
      observacao: "Revisar cláusula 4."
    },
    {
      id: "DEM-002",
      displayId: "DEM2",
      data: "14/07/2026",
      atividade: "Ajuste na Proposta",
      planejamento: "IN_SCOPE",
      planejamentoText: "Planejado",
      planejamentoColor: "bg-slate-100 text-slate-600",
      prioridade: "Média",
      prioridadeColor: "text-blue-500 font-medium",
      resp: "Você",
      status: "Pendente",
      statusColor: "bg-[#f59e0b]/20 text-[#f59e0b]",
      observacao: "Aguardando cliente."
    },
    {
      id: "DEM-003",
      displayId: "DEM3",
      data: "13/07/2026",
      atividade: "Reunião de Alinhamento",
      planejamento: "OUT_OF_SCOPE",
      planejamentoText: "Extra",
      planejamentoColor: "bg-orange-100 text-orange-600",
      prioridade: "Baixa",
      prioridadeColor: "text-slate-400",
      resp: "Você",
      status: "Atrasada",
      statusColor: "bg-[#ef4444]/20 text-[#ef4444]",
      observacao: ""
    }
  ];

  const searchValue = ["typing", "move-to-row", "hover-row", "click-row", "completing", "completed"].includes(step) ? "Revisão" : "";
  const isRowHovered = step === "hover-row" || step === "click-row";
  const isRowClicked = step === "click-row";

  return (
    <div className="bg-white rounded-[24px] p-4 xl:p-6 shadow-sm border border-border/50 shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="font-semibold text-lg tracking-tight">Últimas Demandas</h3>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar demanda..."
              value={searchValue}
              readOnly
              className="pl-9 pr-4 py-2 border border-border rounded-xl text-sm w-full sm:w-[260px] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
            />
          </div>
          <button className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-secondary/50 transition-colors">
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/60">
              <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
              <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Data</th>
              <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Demanda</th>
              <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tipo</th>
              <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Prioridade</th>
              <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Responsável</th>
              <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Observação</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr key={idx} className={`border-b border-border/40 transition-all duration-300 ${
                idx === 0 && isRowHovered ? "bg-slate-50" : "hover:bg-slate-50"
              } ${idx === 0 && isRowClicked ? "scale-[0.99] bg-slate-100" : ""}`}>
                <td className="py-4 px-4 text-[13px] font-medium">{row.displayId}</td>
                <td className="py-4 px-4 text-[13px] text-muted-foreground">{row.data}</td>
                <td className="py-4 px-4 text-[13px] font-medium text-foreground">{row.atividade}</td>
                <td className="py-4 px-4">
                  <div className={`inline-flex px-2 py-1 rounded-md text-[11px] font-semibold ${row.planejamentoColor}`}>
                    {row.planejamentoText}
                  </div>
                </td>
                <td className={`py-4 px-4 text-[13px] font-medium ${row.prioridadeColor}`}>{row.prioridade}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center text-[10px] font-bold text-[#8B5CF6]">
                      GA
                    </div>
                    <span className="text-[13px] text-muted-foreground">{row.resp}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className={`inline-flex px-2 py-1 rounded-md text-[11px] font-semibold transition-colors duration-500 ${row.statusColor}`}>
                    {row.status}
                  </div>
                </td>
                <td className="py-4 px-4 align-top">
                  <textarea
                    placeholder="Adicionar observação..."
                    className="bg-secondary/30 border border-transparent rounded-lg p-2.5 text-[13px] text-foreground w-full min-w-[200px] min-h-[44px] resize-none pointer-events-none"
                    readOnly
                    value={row.observacao}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50">
        <button className="text-[13px] font-medium text-foreground hover:text-[#8B5CF6] transition-colors flex items-center gap-1">
          Ver todas as demandas <ArrowRight className="w-3 h-3" />
        </button>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
          <span className="text-[12px] text-muted-foreground whitespace-nowrap">1 - 3 de 4</span>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground"><ChevronLeft className="w-4 h-4" /></button>
            <button className="w-7 h-7 flex items-center justify-center rounded-md bg-[#8B5CF6]/10 text-[#8B5CF6] font-medium text-xs">1</button>
            <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
