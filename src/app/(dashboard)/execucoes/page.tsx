"use client";

import { useState, useEffect, useRef } from "react";
import { useModal } from "@/hooks/use-modal";
import { useStore, STATUS_COLORS, STATUS_PROGRESS, ExecucaoStatus, Execucao } from "@/hooks/use-store";
import { Trash2, CheckCircle2 } from "lucide-react";
import { Plus, Search, Filter, SlidersHorizontal, Inbox, ChevronDown, ChevronUp, Play, Pause, Timer, FileText, RotateCcw } from "lucide-react";
import { useDemands } from "@/hooks/use-demands";
import { useDemandTimer } from "@/hooks/use-demand-timer";
import { DemandRecord } from "@/hooks/use-demands";
import { pauseDemand, playDemand, updateDemand, resetDemandTime } from "../demandas/actions";
import { LiveTimer } from "@/components/dashboard/LiveTimer";
import { LiveExecTimer } from "@/components/dashboard/LiveExecTimer";
import { DemandStatusBadge } from "@/components/dashboard/DemandStatusBadge";

const statusTabs = ["Todas", "Em andamento", "Pendente", "Em revisão", "Concluídas", "Canceladas"] as const;

const ALL_STATUS: ExecucaoStatus[] = ["Pendente", "Em andamento", "Pausada", "Em revisão", "Concluída", "Cancelada"];

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

  const etiquetas = (configuracoes && Array.isArray(configuracoes.etiquetas)) ? configuracoes.etiquetas : [];
  const etiqueta = etiquetas.find(e => e && e.nome === status) || { cor: "#94a3b8" };
  const color = etiqueta?.cor || "#94a3b8";

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
            {etiquetas.map((etq) => {
              if (!etq) return null;
              const etqColor = etq.cor || "#94a3b8";
              return (
                <button
                  key={etq.nome}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateExecucao(execucaoId, { status: etq.nome });
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-secondary/50 transition-colors flex items-center gap-2 text-foreground"
                >
                  <span style={{ backgroundColor: etqColor }} className={`w-2 h-2 shrink-0 rounded-full ${etq.nome !== status ? 'opacity-30' : ''}`} />
                  {etq.nome}
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
  const { execucoes, deleteExecucao, updateExecucao, configuracoes, updateConfiguracoes } = useStore();
  const { demands, optimisticUpdate, loading: demandsLoading } = useDemands();
  const { getDisplayTime, activeTimer, setActiveTimer } = useDemandTimer();
  const [tick, setTick] = useState(0);

  const handleReorder = (id: string, direction: 'up' | 'down') => {
    let globalOrder = configuracoes.notificacoes?.demandOrder || [];
    if (globalOrder.length === 0) {
      globalOrder = execucoes.map(e => e.id);
    } else {
      execucoes.forEach(e => {
        if (!globalOrder.includes(e.id)) globalOrder.push(e.id);
      });
    }

    const currentIdx = globalOrder.indexOf(id);
    if (currentIdx === -1) return;

    const newGlobal = [...globalOrder];
    const filteredIdx = filtered.findIndex(e => e.id === id);
    if (filteredIdx === -1) return;
    
    if (direction === 'up' && filteredIdx > 0) {
      const targetId = filtered[filteredIdx - 1].id;
      const targetGlobalIdx = newGlobal.indexOf(targetId);
      if (targetGlobalIdx !== -1) {
        [newGlobal[currentIdx], newGlobal[targetGlobalIdx]] = [newGlobal[targetGlobalIdx], newGlobal[currentIdx]];
      }
    } else if (direction === 'down' && filteredIdx < filtered.length - 1) {
      const targetId = filtered[filteredIdx + 1].id;
      const targetGlobalIdx = newGlobal.indexOf(targetId);
      if (targetGlobalIdx !== -1) {
        [newGlobal[currentIdx], newGlobal[targetGlobalIdx]] = [newGlobal[targetGlobalIdx], newGlobal[currentIdx]];
      }
    }
    
    updateConfiguracoes({ notificacoes: { ...configuracoes.notificacoes, demandOrder: newGlobal } });
  };

  const activeDemand = activeTimer ? demands.find((d: any) => d.id === activeTimer.demand_id) : (demands.find((d: any) => d.status === "IN_PROGRESS") || null);
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
      let addSec = 0;
      if (activeTimer && activeTimer.started_at) {
        addSec = Math.floor((Date.now() - new Date(activeTimer.started_at).getTime()) / 1000);
      }
      const newSpentTime = (activeDemand.spent_time_seconds || 0) + addSec;
      setLastActive({ id: activeDemand.id, title: activeDemand.title, time: formatTime(newSpentTime) });
      setActiveTimer(null);
      optimisticUpdate(activeDemand.id, { spent_time_seconds: newSpentTime });
      pauseDemand(activeDemand.id, addSec);
    }
    if (activeExec) {
      const timeSpentThisSession = activeExec.timerStart ? Math.floor((Date.now() - activeExec.timerStart) / 1000) : 0;
      setLastActive({ id: activeExec.id, title: activeExec.titulo, time: getExecucaoTimeStatic(activeExec) });
      updateExecucao(activeExec.id, { 
        tempoGasto: (activeExec.tempoGasto || 0) + timeSpentThisSession,
        timerStart: null 
      });
    }
  };

  const handlePlay = async (demand: DemandRecord) => {
    setActiveTimer({ id: "temp", demand_id: demand.id, started_at: new Date().toISOString() });
    await playDemand(demand.id);
  };

  const handlePause = async (demand: DemandRecord) => {
    let addSec = 0;
    if (activeTimer && activeTimer.demand_id === demand.id && activeTimer.started_at) {
      addSec = Math.floor((Date.now() - new Date(activeTimer.started_at).getTime()) / 1000);
    }
    const newSpentTime = (demand.spent_time_seconds || 0) + addSec;
    setActiveTimer(null);
    optimisticUpdate(demand.id, { spent_time_seconds: newSpentTime });
    await pauseDemand(demand.id, addSec);
  };

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

  const mapDemandPriority = (priority: string) => {
    switch (priority) {
      case "LOW": return "Baixa";
      case "MEDIUM": return "Média";
      case "HIGH": return "Alta";
      case "URGENT": return "Urgente";
      default: return "Média";
    }
  };

  const getExecucaoTimeStatic = (e: any) => {
    let total = e.tempoGasto || 0;
    if (e.timerStart) {
      total += Math.floor((Date.now() - e.timerStart) / 1000);
    }
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredDemands = demands.filter((d: any) => {
    const mappedStatus = mapDemandStatus(d.status);
    const mappedPriority = mapDemandPriority(d.priority);
    
    const matchStatus = activeStatus === "Todas" || activeStatus === "Concluídas"
      ? activeStatus === "Todas" ? true : d.status === "COMPLETED"
      : mappedStatus === activeStatus;
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) || (d.client_name || "").toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === "Todas" || mappedPriority === filterPriority || (mappedPriority === "Média" && filterPriority === "Media");
    return matchStatus && matchSearch && matchPriority;
  }).sort((a: any, b: any) => {
    if (sortBy === "alfabetico") return a.title.localeCompare(b.title);
    if (sortBy === "prioridade") {
      const pOrder: Record<string, number> = { "Alta": 1, "Média": 2, "Media": 2, "Baixa": 3, "Urgente": 0 };
      const pA = mapDemandPriority(a.priority);
      const pB = mapDemandPriority(b.priority);
      return (pOrder[pA] || 99) - (pOrder[pB] || 99);
    }
    const tA = new Date(a.created_at).getTime() || a.id.length;
    const tB = new Date(b.created_at).getTime() || b.id.length;
    if (sortBy === "recentes") return tB - tA;
    if (sortBy === "antigas") return tA - tB;
    if (sortBy === "custom") {
      const globalOrder = configuracoes.notificacoes?.demandOrder || [];
      const tA = globalOrder.indexOf(a.id);
      const tB = globalOrder.indexOf(b.id);
      const valA = tA === -1 ? 99999 : tA;
      const valB = tB === -1 ? 99999 : tB;
      return valA - valB;
    }
    return 0;
  });

  const filtered = execucoes.filter((e) => {
    const matchStatus = activeStatus === "Todas" || activeStatus === "Concluídas"
      ? activeStatus === "Todas" ? true : e.status === "Concluída"
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
    if (sortBy === "custom") {
      const globalOrder = configuracoes.notificacoes?.demandOrder || [];
      const tA = globalOrder.indexOf(a.id);
      const tB = globalOrder.indexOf(b.id);
      const valA = tA === -1 ? 99999 : tA;
      const valB = tB === -1 ? 99999 : tB;
      return valA - valB;
    }
    return 0;
  });

  const counts = {
    total: execucoes.length,
    producao: execucoes.filter((e) => e.status === "Em andamento").length,
    concluidas: execucoes.filter((e) => e.status === "Concluída").length,
    risco: execucoes.filter((e) => e.status === "Cancelada").length,
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Demandas</h1>
          <p className="text-sm text-muted-foreground mt-1">Acompanhe e gerencie as demandas em andamento.</p>
        </div>
        <button onClick={() => openModal("CREATE_EXECUTION")} className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Nova Tarefa
        </button>
      </div>

      {isAnyActive && activeDemand && (
        <div className="bg-[#8B5CF6] rounded-2xl p-6 border border-[#8B5CF6]/20 shadow-lg relative overflow-hidden animate-in fade-in zoom-in duration-300 mb-6">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">Timer Ativo</p>
                <h3 className="text-sm font-semibold text-white truncate max-w-[200px]">{activeDemand.title}</h3>
              </div>
            </div>
            <div className="text-3xl font-mono font-bold text-white tracking-wider">
              <LiveTimer demandId={activeDemand.id} spentTime={activeDemand.spent_time_seconds || 0} activeTimer={activeTimer} />
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-3 mt-4">
            <button onClick={handlePauseActive} className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white transition-colors px-6 py-3 rounded-xl text-sm font-semibold flex-1 max-w-[200px] backdrop-blur-sm">
              <Pause className="w-4 h-4 fill-current" /> Parar Tempo
            </button>
            <button
              onClick={async () => {
                if (activeDemand) {
                  setActiveTimer(null);
                  setLastActive(null);
                  optimisticUpdate(activeDemand.id, { spent_time_seconds: 0 });
                  await resetDemandTime(activeDemand.id);
                }
              }}
              title="Zerar cronômetro"
              className="flex items-center justify-center p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-colors backdrop-blur-sm"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {isAnyActive && activeExec && (
        <div className="bg-[#8B5CF6] rounded-2xl p-6 border border-[#8B5CF6]/20 shadow-lg relative overflow-hidden animate-in fade-in zoom-in duration-300 mb-6">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">Timer Ativo (Antigo)</p>
                <h3 className="text-sm font-semibold text-white truncate max-w-[200px]">{activeExec.titulo}</h3>
              </div>
            </div>
            <div className="text-3xl font-mono font-bold text-white tracking-wider">
              <LiveExecTimer execucao={activeExec} />
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-3 mt-4">
            <button onClick={handlePauseActive} className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white transition-colors px-6 py-3 rounded-xl text-sm font-semibold flex-1 max-w-[200px] backdrop-blur-sm">
              <Pause className="w-4 h-4 fill-current" /> Parar Tempo
            </button>
            <button
              onClick={() => {
                if (activeExec) {
                  updateExecucao(activeExec.id, { tempoGasto: 0, timerStart: null });
                  setLastActive(null);
                }
              }}
              title="Zerar cronômetro"
              className="flex items-center justify-center p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-colors backdrop-blur-sm"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {!isAnyActive && lastActive && (
        <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-center gap-4 animate-in fade-in zoom-in duration-300 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Timer className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Último Registro</p>
                <h3 className="text-sm font-semibold text-foreground truncate max-w-[200px]">{lastActive.title}</h3>
              </div>
            </div>
            <div className="text-2xl font-mono font-bold text-foreground">
              {lastActive.time}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={() => {
              const d = demands.find(d => d.id === lastActive.id);
              if (d) handlePlay(d);
              else {
                const e = execucoes.find(e => e.id === lastActive.id);
                if (e) updateExecucao(e.id, { timerStart: Date.now() });
              }
              setLastActive(null);
            }} className="flex items-center justify-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white transition-colors px-6 py-3 rounded-xl text-sm font-semibold flex-1 max-w-[200px]">
              <Play className="w-4 h-4 fill-current ml-0.5" /> Retomar Tempo
            </button>
            <button onClick={() => setLastActive(null)} className="flex items-center justify-center gap-2 bg-white border border-border hover:bg-secondary text-foreground transition-colors px-6 py-3 rounded-xl text-sm font-semibold flex-1 max-w-[200px]">
              <CheckCircle2 className="w-4 h-4" /> Registrar Tempo
            </button>
            <button 
              onClick={async () => {
                if (lastActive?.id) {
                  setActiveTimer(null);
                  optimisticUpdate(lastActive.id, { spent_time_seconds: 0 });
                  setLastActive(null);
                  await resetDemandTime(lastActive.id);
                }
              }}
              title="Zerar cronômetro"
              className="flex items-center justify-center p-3 bg-white border border-border hover:bg-secondary text-foreground rounded-xl text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
            </button>
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
                { id: "custom", label: "Ordem Customizada" },
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

      {demandsLoading ? (
        <div className="flex-1 bg-white rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/5 flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
          </div>
          <h3 className="text-base font-semibold mb-2">Carregando atividades...</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">Obtendo os dados mais recentes.</p>
        </div>
      ) : filtered.length === 0 && filteredDemands.length === 0 ? (
        <div className="flex-1 bg-white rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/5 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-[#8B5CF6]/50" />
          </div>
          <h3 className="text-base font-semibold mb-2">{execucoes.length === 0 && demands.length === 0 ? "Nenhuma demanda ainda" : "Nenhuma encontrada"}</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">{execucoes.length === 0 && demands.length === 0 ? "Comece criando sua primeira demanda." : "Tente ajustar os filtros."}</p>
          {execucoes.length === 0 && demands.length === 0 && (
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
                {sortBy === "custom" && <th className="py-3 px-2 w-[30px]"></th>}
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[150px]">Cliente</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[200px]">Atividade</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Demanda</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Prioridade</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[300px]">Observação</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Timer</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredDemands.map((demand, idx) => (
                <tr key={demand.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                  {sortBy === "custom" && (
                    <td className="py-4 px-2 w-[30px]">
                      <div className="flex flex-col gap-1 items-center justify-center text-muted-foreground">
                        <button onClick={() => handleReorder(demand.id, 'up')} className="hover:bg-secondary rounded p-0.5"><ChevronUp className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleReorder(demand.id, 'down')} className="hover:bg-secondary rounded p-0.5"><ChevronDown className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  )}
                  <td className="py-4 px-4 w-[150px]">
                    <p className="text-[13px] font-semibold text-foreground truncate">{demand.client_name || "-"}</p>
                  </td>
                  <td className="py-4 px-4 w-[200px]">
                    <div>
                      <p className="text-[13px] font-medium text-foreground truncate">{demand.title}</p>
                      <p suppressHydrationWarning className="text-[11px] text-muted-foreground mt-0.5">
                        {demand.created_at && !isNaN(new Date(demand.created_at).getTime()) ? new Date(demand.created_at).toLocaleDateString() : ""}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap ${demand.type === "OUT_OF_SCOPE" ? "text-orange-500 bg-orange-500/10" : "text-emerald-500 bg-emerald-500/10"}`}>
                      {demand.type === "OUT_OF_SCOPE" ? "Demanda Extra" : "Prevista"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${demand.priority === "HIGH" || demand.priority === "URGENT" ? "text-red-500 bg-red-500/10" : demand.priority === "LOW" ? "text-emerald-500 bg-emerald-500/10" : "text-blue-500 bg-blue-500/10"}`}>
                      {demand.priority === "HIGH" ? "Alta" : demand.priority === "LOW" ? "Baixa" : demand.priority === "URGENT" ? "Urgente" : "Média"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <DemandStatusBadge demand={demand} optimisticUpdate={optimisticUpdate} updateDemand={updateDemand} />
                  </td>
                  <td className="py-4 px-4 w-full min-w-[300px]">
                    <input 
                      type="text" 
                      placeholder="Adicionar observação..." 
                      value={demand.description ? String(demand.description) : ""}
                      onChange={(e) => optimisticUpdate(demand.id, { description: e.target.value })}
                      onBlur={async (e) => await updateDemand(demand.id, { description: e.target.value })}
                      className="w-full bg-white border border-border focus:border-[#8B5CF6] focus:outline-none text-[13px] text-foreground rounded-lg px-3 py-1.5 transition-all shadow-sm placeholder:text-muted-foreground/60" 
                    />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[14px] font-mono font-bold text-foreground">
                        <LiveTimer demandId={demand.id} spentTime={demand.spent_time_seconds || 0} activeTimer={activeTimer} />
                      </span>
                      {activeTimer?.demand_id === demand.id ? (
                        <button 
                          onClick={() => handlePause(demand)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors shadow-sm"
                        >
                          <Pause className="w-4 h-4 fill-current" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handlePlay(demand)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors shadow-sm"
                        >
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button onClick={() => updateDemand(demand.id, { status: "COMPLETED" })} className="text-muted-foreground hover:text-green-500 transition-colors p-1"><CheckCircle2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                  {sortBy === "custom" && (
                    <td className="py-4 px-2 w-[30px]">
                      <div className="flex flex-col gap-1 items-center justify-center text-muted-foreground">
                        <button onClick={() => handleReorder(row.id, 'up')} className="hover:bg-secondary rounded p-0.5"><ChevronUp className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleReorder(row.id, 'down')} className="hover:bg-secondary rounded p-0.5"><ChevronDown className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  )}
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
                  <td className="py-4 px-4 text-center">
                    <StatusBadge execucaoId={row.id} status={row.status as ExecucaoStatus} />
                  </td>
                  <td className="py-4 px-4 w-full min-w-[300px]">
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
                        <LiveExecTimer execucao={row} />
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
