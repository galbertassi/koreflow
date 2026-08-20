"use client";

import { useState, useEffect, useRef } from "react";
import { useModal } from "@/hooks/use-modal";
import { useStore, STATUS_COLORS, STATUS_PROGRESS, ExecucaoStatus, Execucao } from "@/hooks/use-store";
import { Trash2, CheckCircle2 } from "lucide-react";
import { Plus, Search, Filter, SlidersHorizontal, Inbox, ChevronDown, Play, Pause, Timer, FileText } from "lucide-react";
import { useDemands } from "@/hooks/use-demands";
import { useDemandTimer } from "@/hooks/use-demand-timer";
import { pauseDemand } from "../demandas/actions";

const statusTabs = ["Todas", "Em producao", "Aguardando", "Revisao", "Concluidas", "Em Risco"] as const;

const ALL_STATUS: ExecucaoStatus[] = ["Aguardando", "Em producao", "Revisao", "Concluida", "Em Risco"];

const priorityColors: Record<string, string> = {
  Alta: "text-[#8B5CF6] font-semibold",
  Media: "text-blue-500",
  Baixa: "text-muted-foreground",
};

// Helper to format total seconds into HH:MM:SS
const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

function StatusBadge({ execucaoId, status }: { execucaoId: string; status: ExecucaoStatus }) {
  const { updateExecucao, configuracoes } = useStore();
  const [open, setOpen] = useState(false);

  const etiqueta = configuracoes.etiquetas?.find(e => e.nome === status) || { cor: "#94a3b8" };
  const color = etiqueta.cor;

  return (
    <div className={`relative inline-block text-left ${open ? 'z-50' : 'z-10'}`}>
      <button 
        onClick={() => setOpen(!open)} 
        style={{ backgroundColor: color, color: '#ffffff' }}
        className="flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors min-w-[120px] shadow-sm hover:opacity-90"
      >
        {status}
        <ChevronDown className="w-3 h-3 ml-1" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div className="absolute top-full mt-1 left-0 z-50 bg-white border border-border rounded-xl shadow-lg py-1 w-40 overflow-hidden">
            {ALL_STATUS.map((s) => {
              const sColor = configuracoes.etiquetas?.find(e => e.nome === s)?.cor || "#94a3b8";
              return (
                <button
                  key={s}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateExecucao(execucaoId, { status: s });
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-secondary/50 transition-colors flex items-center gap-2 text-foreground"
                >
                  <span style={{ backgroundColor: sColor }} className={`w-2 h-2 shrink-0 rounded-full ${s !== status ? 'opacity-30' : ''}`} />
                  {s}
                </button>
              );
            })}
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
  const { execucoes, deleteExecucao, updateExecucao } = useStore();
  const { demands, optimisticUpdate } = useDemands();
  const { getDisplayTime } = useDemandTimer();
  const [tick, setTick] = useState(0);

  const activeDemand = demands.find((d: any) => d.status === "IN_PROGRESS") || null;
  const activeExec = execucoes.find(e => e.timerStart != null) || null;
  const isAnyActive = !!activeDemand || !!activeExec;

  const [lastActive, setLastActive] = useState<{ id: string, title: string, time: string } | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState("Todas");
  const [sortBy, setSortBy] = useState("recentes");
  
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) setIsFilterOpen(false);
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) setIsSortOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePauseActive = () => {
    if (activeDemand) {
      setLastActive({ id: activeDemand.id, title: activeDemand.title, time: getDisplayTime(activeDemand.id, activeDemand.spent_time_seconds) });
      pauseDemand(activeDemand.id);
    }
    if (activeExec) {
      const timeSpentThisSession = activeExec.timerStart ? Math.floor((Date.now() - activeExec.timerStart) / 1000) : 0;
      setLastActive({ id: activeExec.id, title: activeExec.titulo, time: getExecucaoTime(activeExec) });
      updateExecucao(activeExec.id, { 
        tempoGasto: (activeExec.tempoGasto || 0) + timeSpentThisSession,
        timerStart: null 
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const getExecucaoTime = (e: Execucao) => {
    let total = e.tempoGasto || 0;
    if (e.timerStart) {
      total += Math.floor((Date.now() - e.timerStart) / 1000);
    }
    return formatTime(total);
  };

  const filtered = execucoes.filter((e) => {
    const matchStatus = activeStatus === "Todas" || activeStatus === "Concluidas"
      ? activeStatus === "Todas" ? true : e.status === "Concluida"
      : e.status === activeStatus;
    const matchSearch = e.titulo.toLowerCase().includes(search.toLowerCase()) || e.categoria.toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === "Todas" || e.prioridade === filterPriority;
    return matchStatus && matchSearch && matchPriority;
  }).sort((a, b) => {
    if (sortBy === "alfabetico") return a.titulo.localeCompare(b.titulo);
    if (sortBy === "prioridade") {
      const pOrder: Record<string, number> = { "Alta": 1, "Média": 2, "Media": 2, "Baixa": 3 };
      return (pOrder[a.prioridade] || 99) - (pOrder[b.prioridade] || 99);
    }
    // Para recentes/antigas, vamos usar o ID como base temporal se o criadoEm n for data parseável
    const tA = new Date(a.criadoEm).getTime() || a.id.length;
    const tB = new Date(b.criadoEm).getTime() || b.id.length;
    if (sortBy === "recentes") return tB - tA;
    if (sortBy === "antigas") return tA - tB;
    return 0;
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
          <h1 className="text-2xl font-semibold tracking-tight">Demandas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie e acompanhe o andamento de cada demanda
          </p>
        </div>
        <button onClick={() => openModal("CREATE_EXECUTION")} className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Nova Tarefa
        </button>
      </div>

      {(isAnyActive || lastActive) && (
        <div className="print:hidden bg-[#8B5CF6] text-white rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden mb-6">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Timer className="w-5 h-5 text-white/80" /> Timer {isAnyActive ? "Ativo" : "Parado"}
            </h3>
            {isAnyActive ? (
              <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded">Em andamento</span>
            ) : lastActive ? (
              <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded">Pausado</span>
            ) : null}
          </div>
          
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-4">
            <p className="text-sm font-medium text-white/80 mb-1 truncate max-w-full text-center px-4">
              {isAnyActive 
                ? (activeDemand ? activeDemand.title : activeExec ? activeExec.titulo : "")
                : (lastActive ? lastActive.title : "")}
            </p>
            <span className="text-5xl font-mono font-bold tracking-tight shadow-sm mt-2">
              {isAnyActive 
                ? (activeDemand ? getDisplayTime(activeDemand.id, activeDemand.spent_time_seconds) : activeExec ? getExecucaoTime(activeExec) : "00:00:00")
                : (lastActive ? lastActive.time : "00:00:00")}
            </span>
          </div>

          <div className="relative z-10 mt-4 flex items-center justify-center gap-4">
            {isAnyActive && (
              <button onClick={handlePauseActive} className="flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-[#8B5CF6] transition-colors px-6 py-3 rounded-xl text-sm font-semibold max-w-[200px] w-full">
                <Pause className="w-4 h-4" /> Parar Tempo
              </button>
            )}
            {!isAnyActive && lastActive && (
              <button onClick={() => setLastActive(null)} className="flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-[#8B5CF6] transition-colors px-6 py-3 rounded-xl text-sm font-semibold max-w-[200px] w-full">
                <CheckCircle2 className="w-4 h-4" /> Registrar Tempo
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Buscar demanda..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-border rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 bg-white" />
        </div>
        
        <div className="relative" ref={filterRef}>
          <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 px-3 py-2 border border-border rounded-xl text-sm font-medium bg-white hover:bg-secondary/30 transition-colors">
            <Filter className="w-4 h-4 text-muted-foreground" /> Filtrar {filterPriority !== "Todas" && <span className="bg-[#8B5CF6] text-white text-[10px] px-1.5 py-0.5 rounded-md ml-1">{filterPriority}</span>}
          </button>
          {isFilterOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-border rounded-xl shadow-lg p-2 z-50">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Prioridade</p>
              {["Todas", "Alta", "Média", "Baixa"].map(p => (
                <button key={p} onClick={() => { setFilterPriority(p); setIsFilterOpen(false); }} className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${filterPriority === p ? "bg-[#8B5CF6]/10 text-[#8B5CF6] font-medium" : "hover:bg-secondary text-foreground"}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={sortRef}>
          <button onClick={() => setIsSortOpen(!isSortOpen)} className="flex items-center gap-2 px-3 py-2 border border-border rounded-xl text-sm font-medium bg-white hover:bg-secondary/30 transition-colors">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" /> Ordenar
          </button>
          {isSortOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-border rounded-xl shadow-lg p-2 z-50">
              {[
                { id: "recentes", label: "Mais recentes" },
                { id: "antigas", label: "Mais antigas" },
                { id: "prioridade", label: "Prioridade" },
                { id: "alfabetico", label: "Alfabético" }
              ].map(opt => (
                <button key={opt.id} onClick={() => { setSortBy(opt.id); setIsSortOpen(false); }} className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${sortBy === opt.id ? "bg-[#8B5CF6]/10 text-[#8B5CF6] font-medium" : "hover:bg-secondary text-foreground"}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
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
          <h3 className="text-base font-semibold mb-2">{execucoes.length === 0 ? "Nenhuma demanda ainda" : "Nenhuma encontrada"}</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">{execucoes.length === 0 ? "Comece criando sua primeira demanda." : "Tente ajustar os filtros."}</p>
          {execucoes.length === 0 && (
            <button onClick={() => openModal("CREATE_EXECUTION")} className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Criar primeira Demanda
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border/50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/20 [&>th:first-child]:rounded-tl-2xl [&>th:last-child]:rounded-tr-2xl [&>th:first-child]:rounded-tl-2xl [&>th:last-child]:rounded-tr-2xl">
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[150px]">Cliente</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[200px]">Atividade</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Demanda</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Prioridade</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Observação</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Timer</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                  <td className="py-4 px-4 w-[150px]">
                    <p className="text-[13px] font-semibold text-foreground truncate">{row.cliente || row.projetoId || "-"}</p>
                  </td>
                  <td className="py-4 px-4 w-[200px]">
                    <div>
                      <p className="text-[13px] font-medium text-foreground truncate">{row.titulo}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{row.criadoEm}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap ${row.tipoPlanejamento === "Demanda Extra" ? "text-orange-500 bg-orange-500/10" : "text-emerald-500 bg-emerald-500/10"}`}>
                      {row.tipoPlanejamento || "Previsto"}
                    </span>
                  </td>
                  <td className={`py-4 px-4 text-[13px] ${priorityColors[row.prioridade] || ""}`}>{row.prioridade}</td>
                  <td className="py-4 px-4">
                    <StatusBadge execucaoId={row.id} status={row.status as ExecucaoStatus} />
                  </td>
                  <td className="py-4 px-4 w-full min-w-[150px]">
                    <input 
                      type="text" 
                      placeholder="Adicionar observação..." 
                      value={row.observacao || ""}
                      onChange={(e) => {
                        updateExecucao(row.id, { observacao: e.target.value });
                      }}
                      className="w-full bg-white border border-border focus:border-[#8B5CF6] focus:outline-none text-[13px] text-foreground rounded-lg px-3 py-1.5 transition-all shadow-sm placeholder:text-muted-foreground/60" 
                    />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[14px] font-mono font-bold text-foreground">
                        {getExecucaoTime(row)}
                      </span>
                      {row.timerStart ? (
                            <button 
                              onClick={() => {
                                const timeSpentThisSession = Math.floor((Date.now() - row.timerStart!) / 1000);
                                updateExecucao(row.id, { 
                                  tempoGasto: (row.tempoGasto || 0) + timeSpentThisSession,
                                  timerStart: null 
                                });
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors shadow-sm"
                            >
                              <Pause className="w-4 h-4 fill-current" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => updateExecucao(row.id, { timerStart: Date.now() })}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors shadow-sm"
                            >
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </button>
                          )}
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
