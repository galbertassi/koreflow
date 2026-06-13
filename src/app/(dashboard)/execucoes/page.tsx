"use client";

import { useState } from "react";
import { useModal } from "@/hooks/use-modal";
import { useStore, STATUS_COLORS, STATUS_PROGRESS, ExecucaoStatus } from "@/hooks/use-store";
import { Trash2 } from "lucide-react";
import { Plus, Search, Filter, SlidersHorizontal, Inbox, ChevronDown } from "lucide-react";

const statusTabs = ["Todas", "Em producao", "Aguardando", "Revisao", "Concluidas", "Em Risco"] as const;

const ALL_STATUS: ExecucaoStatus[] = ["Aguardando", "Em producao", "Revisao", "Concluida", "Em Risco"];

const priorityColors: Record<string, string> = {
  Alta: "text-[#8B5CF6] font-semibold",
  Media: "text-blue-500",
  Baixa: "text-muted-foreground",
};

function StatusBadge({ execucaoId, status }: { execucaoId: string; status: ExecucaoStatus }) {
  const { updateExecucao } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer transition-all hover:opacity-80 ${STATUS_COLORS[status]}`}
      >
        {status}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 bg-white border border-border rounded-xl shadow-lg py-1 w-40">
          {ALL_STATUS.map((s) => (
            <button
              key={s}
              onClick={() => {
                updateExecucao(execucaoId, { status: s });
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-secondary/50 transition-colors flex items-center gap-2 ${s === status ? "text-[#8B5CF6]" : "text-foreground"}`}
            >
              <span className={`w-2 h-2 rounded-full ${s === "Aguardando" ? "bg-amber-400" : s === "Em producao" ? "bg-blue-400" : s === "Revisao" ? "bg-[#8B5CF6]" : s === "Concluida" ? "bg-emerald-400" : "bg-red-400"}`} />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExecucoesPage() {
  const [activeStatus, setActiveStatus] = useState<string>("Todas");
  const [search, setSearch] = useState("");
  const { openModal } = useModal();
  const { execucoes, deleteExecucao } = useStore();

  const filtered = execucoes.filter((e) => {
    const matchStatus = activeStatus === "Todas" || activeStatus === "Concluidas"
      ? activeStatus === "Todas" ? true : e.status === "Concluida"
      : e.status === activeStatus;
    const matchSearch = e.titulo.toLowerCase().includes(search.toLowerCase()) || e.categoria.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    total: execucoes.length,
    producao: execucoes.filter((e) => e.status === "Em producao").length,
    concluidas: execucoes.filter((e) => e.status === "Concluida").length,
    risco: execucoes.filter((e) => e.status === "Em Risco").length,
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Execucoes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {execucoes.length > 0 ? `${counts.total} total · ${counts.producao} em producao · ${counts.concluidas} concluidas` : "Gerencie todas as suas tarefas em um so lugar."}
          </p>
        </div>
        <button onClick={() => openModal("CREATE_EXECUTION")} className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Nova Execucao
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Buscar execucao..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-border rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 bg-white" />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-xl text-sm font-medium bg-white hover:bg-secondary/30 transition-colors">
          <Filter className="w-4 h-4 text-muted-foreground" /> Filtrar
        </button>
        <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-xl text-sm font-medium bg-white hover:bg-secondary/30 transition-colors">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" /> Ordenar
        </button>
      </div>

      <div className="flex items-center gap-1 mb-5 bg-white rounded-xl border border-border/50 p-1 w-fit">
        {statusTabs.map((tab) => (
          <button key={tab} onClick={() => setActiveStatus(tab)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeStatus === tab ? "bg-[#8B5CF6]/10 text-[#8B5CF6]" : "text-muted-foreground hover:text-foreground"}`}>
            {tab}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex-1 bg-white rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/5 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-[#8B5CF6]/50" />
          </div>
          <h3 className="text-base font-semibold mb-2">{execucoes.length === 0 ? "Nenhuma execucao ainda" : "Nenhuma encontrada"}</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">{execucoes.length === 0 ? "Comece criando sua primeira execucao." : "Tente ajustar os filtros."}</p>
          {execucoes.length === 0 && (
            <button onClick={() => openModal("CREATE_EXECUTION")} className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Criar primeira Execucao
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border/50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/20 [&>th:first-child]:rounded-tl-2xl [&>th:last-child]:rounded-tr-2xl [&>th:first-child]:rounded-tl-2xl [&>th:last-child]:rounded-tr-2xl">
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Execucao</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Categoria</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Prioridade</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Entrega</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Progresso</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-[13px] font-medium text-foreground">{row.titulo}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{row.criadoEm}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[13px] text-muted-foreground">{row.categoria || "—"}</td>
                  <td className={`py-4 px-4 text-[13px] ${priorityColors[row.prioridade] || ""}`}>{row.prioridade}</td>
                  <td className="py-4 px-4 text-[13px] text-muted-foreground">{row.entrega || "—"}</td>
                  <td className="py-4 px-4">
                    <StatusBadge execucaoId={row.id} status={row.status} />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <div className="flex-1 h-1.5 bg-secondary rounded-full ">
                        <div className="h-full bg-[#8B5CF6] rounded-full transition-all duration-500" style={{ width: `${row.progresso}%` }}></div>
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground w-8 text-right">{row.progresso}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button onClick={() => deleteExecucao(row.id)} className="text-muted-foreground hover:text-red-500 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
