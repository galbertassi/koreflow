"use client";

import { useState, useEffect } from "react";
import { useModal } from "@/hooks/use-modal";
import { useStore, STATUS_COLORS, STATUS_PROGRESS, ExecucaoStatus } from "@/hooks/use-store";
import { Trash2, MoreHorizontal, GripVertical } from "lucide-react";
import { Plus, Search, Filter, SlidersHorizontal, Inbox, ChevronDown } from "lucide-react";

const priorityColors: Record<string, string> = {
  Alta: "text-[#8B5CF6] font-semibold",
  Media: "text-blue-500",
  Baixa: "text-muted-foreground",
};

function ObservacaoInput({ execucaoId, initialValue }: { execucaoId: string; initialValue: string }) {
  const { updateExecucao } = useStore();
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  const handleSave = () => {
    if (value === initialValue) return; // Não salva se não mudou
    setStatus("saving");
    updateExecucao(execucaoId, { observacao: value });
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <div className="relative w-full flex items-center group">
      <input
        type="text"
        placeholder="Adicionar observação..."
        className="bg-transparent border-b border-transparent hover:border-border focus:border-[#8B5CF6] focus:outline-none text-sm text-muted-foreground focus:text-foreground transition-colors w-full py-1 pr-6"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur();
          }
        }}
      />
      {status === "saved" && (
        <span className="absolute right-0 text-[10px] text-emerald-500 font-medium pointer-events-none animate-in fade-in slide-in-from-bottom-1">
          Salvo
        </span>
      )}
    </div>
  );
}

function StatusBadge({ execucaoId, status }: { execucaoId: string; status: ExecucaoStatus }) {
  const { updateExecucao, configuracoes } = useStore();
  const [open, setOpen] = useState(false);

  const currentEtiqueta = configuracoes.etiquetas.find(e => e.nome === status) || configuracoes.etiquetas[0] || { nome: status, cor: "bg-slate-400/10 text-slate-500 border-slate-400/20" };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all hover:opacity-80 ${currentEtiqueta.cor}`}
      >
        {status}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 left-0 z-50 bg-white border border-border rounded-xl shadow-lg py-1 w-44">
            {configuracoes.etiquetas.map((s) => (
              <button
                key={s.nome}
                onClick={() => {
                  updateExecucao(execucaoId, { status: s.nome });
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm font-medium hover:bg-secondary/50 transition-colors flex items-center gap-2 ${s.nome === status ? "text-[#8B5CF6]" : "text-foreground"}`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.cor.includes('slate') ? '#64748b' : s.cor.includes('indigo') ? '#6366f1' : s.cor.includes('amber') ? '#f59e0b' : s.cor.includes('blue') ? '#3b82f6' : s.cor.includes('emerald') ? '#10b981' : s.cor.includes('red') ? '#ef4444' : s.cor.includes('pink') ? '#ec4899' : s.cor.includes('cyan') ? '#06b6d4' : '#8b5cf6' }} />
                {s.nome}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ExecucoesPage() {
  const [activeStatus, setActiveStatus] = useState<string>("Todas");
  const [search, setSearch] = useState("");
  const { openModal } = useModal();
  const { execucoes, updateExecucao, deleteExecucao, configuracoes } = useStore();

  const statusTabs = ["Todas", ...configuracoes.etiquetas.map(e => e.nome)];

  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [draggedRow, setDraggedRow] = useState<string | null>(null);

  useEffect(() => {
    const newIds = execucoes.map(e => e.id);
    setOrderedIds(prev => {
      const current = [...prev];
      newIds.forEach(id => {
        if (!current.includes(id)) current.push(id);
      });
      return current.filter(id => newIds.includes(id));
    });
  }, [execucoes]);

  const handleRowDragStart = (e: React.DragEvent, id: string) => {
    setDraggedRow(id);
    e.dataTransfer.effectAllowed = "move";
    if (e.dataTransfer) {
      e.dataTransfer.setData("text/plain", id);
    }
  };

  const handleRowDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!draggedRow || draggedRow === id) return;

    setOrderedIds(prev => {
      const draggedIdx = prev.indexOf(draggedRow);
      const targetIdx = prev.indexOf(id);
      if (draggedIdx === -1 || targetIdx === -1) return prev;

      const newOrder = [...prev];
      const [draggedItem] = newOrder.splice(draggedIdx, 1);
      newOrder.splice(targetIdx, 0, draggedItem);
      return newOrder;
    });
  };

  const handleRowDragEnd = () => {
    setDraggedRow(null);
  };

  const filtered = execucoes.filter((e) => {
    const matchStatus = activeStatus === "Todas" ? true : e.status === activeStatus;
    const matchSearch = e.titulo.toLowerCase().includes(search.toLowerCase()) || e.categoria.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const sortedFiltered = [...filtered].sort((a, b) => {
    return orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id);
  });

  const counts = {
    total: execucoes.length,
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Execuções</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {execucoes.length > 0 ? `${counts.total} total de execuções` : "Gerencie todas as suas tarefas em um só lugar."}
          </p>
        </div>
        <button onClick={() => openModal("CREATE_EXECUTION")} className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors shadow-sm shrink-0">
          <Plus className="w-4 h-4" /> Nova Execução
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="relative w-full sm:flex-1 sm:max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Buscar execução..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-border rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 bg-white" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-3 py-2 border border-border rounded-xl text-sm font-medium bg-white hover:bg-secondary/30 transition-colors">
            <Filter className="w-4 h-4 text-muted-foreground" /> Filtrar
          </button>
          <button className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-3 py-2 border border-border rounded-xl text-sm font-medium bg-white hover:bg-secondary/30 transition-colors">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" /> Ordenar
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-5 bg-white rounded-xl border border-border/50 p-1 w-full sm:w-fit overflow-x-auto hide-scrollbar whitespace-nowrap">
        {statusTabs.map((tab) => (
          <button key={tab} onClick={() => setActiveStatus(tab)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0 ${activeStatus === tab ? "bg-[#8B5CF6]/10 text-[#8B5CF6]" : "text-muted-foreground hover:text-foreground"}`}>
            {tab}
          </button>
        ))}
      </div>

      {sortedFiltered.length === 0 ? (
        <div className="flex-1 bg-white rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/5 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-[#8B5CF6]/50" />
          </div>
          <h3 className="text-base font-semibold mb-2">{execucoes.length === 0 ? "Nenhuma execução ainda" : "Nenhuma encontrada"}</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">{execucoes.length === 0 ? "Comece criando sua primeira execução." : "Tente ajustar os filtros."}</p>
          {execucoes.length === 0 && (
            <button onClick={() => openModal("CREATE_EXECUTION")} className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Criar primeira Execução
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border/50">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/20 [&>th:first-child]:rounded-tl-2xl [&>th:last-child]:rounded-tr-2xl">
                <th className="py-3 px-4 w-8"></th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[220px]">Execução</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Categoria</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Prioridade</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-64 max-w-sm">Observação</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {sortedFiltered.map((row) => (
                <tr
                  key={row.id}
                  draggable
                  onDragStart={(e) => handleRowDragStart(e, row.id)}
                  onDragOver={(e) => handleRowDragOver(e, row.id)}
                  onDragEnd={handleRowDragEnd}
                  className={`border-b border-border/40 hover:bg-secondary/20 transition-colors group ${draggedRow === row.id ? "opacity-40 bg-secondary/30" : ""}`}
                >
                  <td className="py-4 px-4 text-muted-foreground/30 group-hover:text-muted-foreground cursor-grab active:cursor-grabbing w-8">
                    <GripVertical className="w-4 h-4" />
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{row.titulo}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{row.criadoEm}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-muted-foreground whitespace-nowrap">{row.categoria || "—"}</td>
                  <td className={`py-4 px-4 text-sm whitespace-nowrap ${priorityColors[row.prioridade] || ""}`}>{row.prioridade}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <StatusBadge execucaoId={row.id} status={row.status as any} />
                  </td>
                  <td className="py-4 px-4">
                    <ObservacaoInput execucaoId={row.id} initialValue={row.observacao || ""} />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openModal("EDIT_EXECUTION", { execucaoId: row.id })} className="text-muted-foreground hover:text-[#8B5CF6] transition-colors p-1.5 rounded-lg hover:bg-[#8B5CF6]/10" title="Editar">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteExecucao(row.id)} className="text-muted-foreground hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-500/10" title="Excluir">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
