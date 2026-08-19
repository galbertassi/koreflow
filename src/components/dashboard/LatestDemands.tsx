"use client";

import { Search, Filter, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { useDemands } from "@/hooks/use-demands";
import { updateDemand as updateDemandAction } from "@/app/(dashboard)/demandas/actions";
import { DemandStatusBadge } from "@/components/dashboard/DemandStatusBadge";

export function LatestDemands() {
  const { configuracoes } = useStore();
  const { demands, optimisticUpdate } = useDemands();

  const tableData = demands.map(e => {
    return {
      id: e.id,
      displayId: e.id.substring(0, 4).toUpperCase(),
      data: new Date((e as any).created_at || (e as any).criadoEm || Date.now()).toLocaleDateString('pt-BR'),
      atividade: e.title,
      cliente: e.client_name || "-",
      categoria: e.category_name || "-",
      planejamento: e.type,
      planejamentoColor: e.type === "IN_SCOPE" ? "bg-slate-100 text-slate-600" : "bg-orange-100 text-orange-600",
      prioridade: e.priority === "URGENT" ? "Urgente" : e.priority === "HIGH" ? "Alta" : e.priority === "MEDIUM" ? "M├®dia" : "Baixa",
      prioridadeColor: e.priority === "URGENT" ? "text-red-500 font-bold" : e.priority === "HIGH" ? "text-orange-500 font-semibold" : e.priority === "MEDIUM" ? "text-blue-500 font-medium" : "text-slate-400",
      resp: "Voc├¬",
      status: e.status,
      statusColor: (configuracoes?.etiquetas || []).find(etq => etq?.nome === e.status)?.cor || "bg-slate-100 text-slate-500 border-slate-200",
      observacao: e.description || ""
    };
  });

  return (
    <div className="bg-white rounded-[24px] p-4 xl:p-6 print:p-0 shadow-sm border border-border/50 print:border-none print:shadow-none print:break-inside-avoid">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
        <h3 className="font-semibold text-lg tracking-tight">├Ültimas Demandas</h3>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar demanda..."
              className="pl-9 pr-4 py-2 border border-border rounded-xl text-sm w-full sm:w-[260px] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
            />
          </div>
          <button className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-secondary/50 transition-colors">
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </div>
      </div>

      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/60">
              <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
              <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Data</th>
              <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Demanda</th>
              <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tipo</th>
              <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Prioridade</th>
              <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Respons├ível</th>
              <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Observa├º├úo</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr key={idx} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                <td className="py-4 px-4 text-[13px] font-medium">{row.displayId}</td>
                <td className="py-4 px-4 text-[13px] text-muted-foreground">{row.data}</td>
                <td className="py-4 px-4 text-[13px] font-medium text-foreground">{row.atividade}</td>
                <td className="py-4 px-4">
                  <select
                    value={row.planejamento}
                    onChange={(e) => {
                      optimisticUpdate(row.id, { type: e.target.value as any });
                      updateDemandAction(row.id, { type: e.target.value as any });
                    }}
                    className={`inline-flex px-2 py-1 rounded-md text-[11px] font-semibold appearance-none cursor-pointer border-none outline-none ${row.planejamentoColor}`}
                  >
                    <option value="IN_SCOPE">Planejado</option>
                    <option value="OUT_OF_SCOPE">Extra</option>
                  </select>
                </td>
                <td className={`py-4 px-4 text-[13px] font-medium ${row.prioridadeColor}`}>{row.prioridade}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {configuracoes?.foto ? (
                      <img src={configuracoes.foto} alt="Voc├¬" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {configuracoes?.nome && configuracoes.nome !== "Carregando..." ? configuracoes.nome.substring(0, 2).toUpperCase() : "EU"}
                      </div>
                    )}
                    <span className="text-[13px] text-muted-foreground">{row.resp}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <DemandStatusBadge 
                    demand={{ id: row.id, status: row.status }} 
                    optimisticUpdate={optimisticUpdate} 
                    updateDemand={updateDemandAction} 
                  />
                </td>
                <td className="py-4 px-4 align-top">
                  <textarea
                    placeholder="Observação..."
                    className="bg-secondary/30 hover:bg-secondary/70 border border-transparent hover:border-border focus:border-[#8B5CF6] focus:bg-white rounded-lg p-2.5 text-[13px] text-foreground focus:outline-none transition-all w-full min-w-[150px] min-h-[44px] resize-y shadow-sm"
                    defaultValue={row.observacao}
                    onBlur={(e) => {
                      optimisticUpdate(row.id, { description: e.target.value });
                      updateDemandAction(row.id, { description: e.target.value });
                    }}
                    rows={1}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height = target.scrollHeight + "px";
                    }}
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
          <span className="text-[12px] text-muted-foreground whitespace-nowrap">1 - 5 de 48</span>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground"><ChevronLeft className="w-4 h-4" /></button>
            <button className="w-7 h-7 flex items-center justify-center rounded-md bg-[#8B5CF6]/10 text-[#8B5CF6] font-medium text-xs">1</button>
            <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-secondary font-medium text-xs">2</button>
            <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-secondary font-medium text-xs">3</button>
            <span className="w-7 h-7 flex items-center justify-center text-muted-foreground text-xs">...</span>
            <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-secondary font-medium text-xs">10</button>
            <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
