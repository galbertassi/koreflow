"use client";

import { useState, useEffect, useRef } from "react";
import { useStore } from "@/hooks/use-store";
import {
  ClipboardList,
  CheckCircle2,
  Hourglass,
  Clock,
  PlusCircle,
  AlarmClock,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Play,
  Pause,
  Timer,
  MessageSquare,
  ChevronUp,
  RotateCcw
} from "lucide-react";
import { DemandStatusBadge } from "@/components/dashboard/DemandStatusBadge";
import { LiveTimer } from "@/components/dashboard/LiveTimer";
import { LiveExecTimer } from "@/components/dashboard/LiveExecTimer";
import { KoreAiChatWidget } from "@/components/dashboard/KoreAiChatWidget";
import { useDemands, DemandRecord } from "@/hooks/use-demands";
import { useDemandTimer } from "@/hooks/use-demand-timer";
import { playDemand, pauseDemand, completeDemand, updateDemand, resetDemandTime } from "./demandas/actions";

const DEMAND_STATUSES = ["Pendente", "Em andamento", "Pausada", "Em revisão", "Concluída", "Cancelada"];

function ExecucaoStatusBadge({ execucao, updateExecucao }: { execucao: any, updateExecucao: any }) {
  const [open, setOpen] = useState(false);
  const { configuracoes } = useStore();
  
  const etiquetas = (configuracoes && Array.isArray(configuracoes.etiquetas)) ? configuracoes.etiquetas : [];
  const etiqueta = etiquetas.find(e => e && e.nome === execucao?.status) || { cor: "#94a3b8" };
  const color = etiqueta?.cor || "#94a3b8";

  return (
    <div className={`relative inline-block text-left ${open ? 'z-50' : 'z-10'}`}>
      <button 
        onClick={() => setOpen(!open)} 
        style={{ backgroundColor: color, color: '#ffffff' }}
        className="flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors w-full min-w-[120px] shadow-sm hover:opacity-90"
      >
        {execucao?.status || "Pendente"}
        <ChevronDown className="w-3 h-3 ml-1" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 z-50 bg-white border border-border rounded-xl shadow-lg py-1 w-40">
            {etiquetas.map((etq) => {
              if (!etq) return null;
              const etqColor = etq.cor || "#94a3b8";
              return (
                <button
                  key={etq.nome}
                  onClick={() => {
                    updateExecucao(execucao.id, { status: etq.nome });
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-secondary/50 transition-colors flex items-center gap-2 text-foreground"
                >
                  <span style={{ backgroundColor: etqColor }} className={`w-2 h-2 shrink-0 rounded-full ${etq.nome !== execucao?.status ? 'opacity-30' : ''}`} />
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

const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function DashboardPage() {
  const { execucoes, configuracoes, updateExecucao, updateConfiguracoes } = useStore();
  const { demands, optimisticUpdate, loading: demandsLoading } = useDemands();
  const { activeTimer, getDisplayTime, setActiveTimer } = useDemandTimer();
  const [tick, setTick] = useState(0);

  const [search, setSearch] = useState("");
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

  const activeDemand = activeTimer ? demands.find(d => d.id === activeTimer.demand_id) : null;
  const activeExec = execucoes.find(e => e.timerStart != null) || null;
  const isAnyActive = !!activeDemand || !!activeExec;
  
  const [lastActive, setLastActive] = useState<{ id: string, title: string, time: string } | null>(null);

  const handleReorder = (id: string, direction: 'up' | 'down', list: any[]) => {
    let globalOrder = configuracoes.notificacoes?.demandOrder || [];
    if (globalOrder.length === 0) {
      globalOrder = [...demands.map(d => d.id), ...execucoes.map(e => e.id)];
    } else {
      [...demands, ...execucoes].forEach(item => {
        if (!globalOrder.includes(item.id)) globalOrder.push(item.id);
      });
    }

    const currentIdx = globalOrder.indexOf(id);
    if (currentIdx === -1) return;

    const newGlobal = [...globalOrder];
    const filteredIdx = list.findIndex(e => e.id === id);
    if (filteredIdx === -1) return;
    
    if (direction === 'up' && filteredIdx > 0) {
      const targetId = list[filteredIdx - 1].id;
      const targetGlobalIdx = newGlobal.indexOf(targetId);
      if (targetGlobalIdx !== -1) {
        [newGlobal[currentIdx], newGlobal[targetGlobalIdx]] = [newGlobal[targetGlobalIdx], newGlobal[currentIdx]];
      }
    } else if (direction === 'down' && filteredIdx < list.length - 1) {
      const targetId = list[filteredIdx + 1].id;
      const targetGlobalIdx = newGlobal.indexOf(targetId);
      if (targetGlobalIdx !== -1) {
        [newGlobal[currentIdx], newGlobal[targetGlobalIdx]] = [newGlobal[targetGlobalIdx], newGlobal[currentIdx]];
      }
    }
    
    updateConfiguracoes({ notificacoes: { ...configuracoes.notificacoes, demandOrder: newGlobal } });
  };

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

  const handleComplete = async (demand: DemandRecord) => {
    optimisticUpdate(demand.id, { status: "COMPLETED" });
    await completeDemand(demand.id);
  };

  const sortFn = (a: any, b: any) => {
    if (sortBy === "alfabetico") return (a.title || a.titulo || "").localeCompare(b.title || b.titulo || "");
    if (sortBy === "prioridade") {
      const pOrder: Record<string, number> = { "Alta": 1, "Média": 2, "Media": 2, "Baixa": 3 };
      return (pOrder[a.priority || a.prioridade] || 99) - (pOrder[b.priority || b.prioridade] || 99);
    }
    const tA = new Date(a.created_at || a.criadoEm).getTime() || a.id.length;
    const tB = new Date(b.created_at || b.criadoEm).getTime() || b.id.length;
    if (sortBy === "recentes") return tB - tA;
    if (sortBy === "antigas") return tA - tB;
    if (sortBy === "custom") {
      const globalOrder = configuracoes.notificacoes?.demandOrder || [];
      const tAIdx = globalOrder.indexOf(a.id);
      const tBIdx = globalOrder.indexOf(b.id);
      const valA = tAIdx === -1 ? 99999 : tAIdx;
      const valB = tBIdx === -1 ? 99999 : tBIdx;
      return valA - valB;
    }
    return 0;
  };

  const filteredDemands = demands.filter(d => {
    const matchSearch = (d.title || "").toLowerCase().includes(search.toLowerCase()) || (d.client_name || "").toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === "Todas" || d.priority === filterPriority;
    return matchSearch && matchPriority;
  }).sort(sortFn);

  const filteredExecucoes = execucoes.filter(e => {
    const matchSearch = (e.titulo || "").toLowerCase().includes(search.toLowerCase()) || (e.cliente || "").toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === "Todas" || e.prioridade === filterPriority;
    return matchSearch && matchPriority;
  }).sort(sortFn);

  const total = execucoes.length || 1;
  const entregues = execucoes.filter(e => e.status === "Concluída").length;
  const producao = execucoes.filter(e => e.status === "Em andamento" || e.status === "Em revisão").length;
  const aguardando = execucoes.filter(e => e.status === "Pendente" || e.status === "Pausada").length;

  const demandasExtras = execucoes.filter(e => e.tipoPlanejamento === "Demanda Extra" || e.categoria.toLowerCase().includes("urgente") || e.categoria.toLowerCase().includes("extra"));
  const extras = demandasExtras.length;

  const risco = execucoes.filter(e => e.status === "Em Risco").length;

  const pct = (val: number) => execucoes.length === 0 ? "0.0%" : ((val / total) * 100).toFixed(1) + "%";

  const catPlanejamento = execucoes.filter(e => e.categoria.toLowerCase() === "planejamento").length;
  const catCampanhas = execucoes.filter(e => e.categoria.toLowerCase() === "campanhas").length;
  const catConteudo = execucoes.filter(e => e.categoria.toLowerCase() === "conteúdo" || e.categoria.toLowerCase() === "conteudo").length;
  const catRelatorios = execucoes.filter(e => e.categoria.toLowerCase() === "relatórios" || e.categoria.toLowerCase() === "relatorios").length;
  const catOperacional = execucoes.filter(e => e.categoria.toLowerCase() === "operacional").length;

  const maxCat = Math.max(catPlanejamento, catCampanhas, catConteudo, catRelatorios, catOperacional, 1);

  const getStrokeDashArray = (val: number, totalVal: number, circumference: number) => {
    return `${(val / totalVal) * circumference} ${circumference}`;
  };
  const getStrokeDashOffset = (startVal: number, totalVal: number, circumference: number) => {
    return -((startVal / totalVal) * circumference);
  };
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const mapDemandStatusForChart = (status: string) => {
    switch (status) {
      case "PENDING": return "Pendente";
      case "IN_PROGRESS": return "Em andamento";
      case "COMPLETED": return "Concluída";
      case "PAUSED": return "Pausada";
      case "REVIEW": return "Em revisão";
      case "CANCELLED": return "Cancelada";
      default: return status;
    }
  };

  const statusCounts = [...demands, ...execucoes].reduce((acc, item) => {
    const statusName = mapDemandStatusForChart(item.status);
    acc[statusName] = (acc[statusName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  let currentOffset = 0;
  const chartData = (configuracoes?.etiquetas || []).map(etq => {
    if (!etq) return null;
    const val = statusCounts[etq.nome] || 0;
    const res = { label: etq.nome, value: val, color: etq.cor || "#8B5CF6", offset: currentOffset };
    currentOffset += val;
    return res;
  }).filter((d): d is NonNullable<typeof d> => d !== null && d.value > 0);
  
  const totalValChart = currentOffset || 1;

  return (
    <div className="flex flex-col min-h-full space-y-6 max-w-[1400px] mx-auto pb-10">

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-2">
        <div className="bg-white rounded-2xl border border-border/50 p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Atividades Totais</span>
          </div>
          <h3 className="text-3xl font-bold text-foreground mb-1">{execucoes.length}</h3>
          <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {execucoes.length > 0 ? "Atualizado" : "Novo"}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-border/50 p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Entregues</span>
          </div>
          <h3 className="text-3xl font-bold text-foreground mb-1">{entregues}</h3>
          <span className="text-xs font-semibold text-emerald-500">{pct(entregues)} do total</span>
        </div>

        <div className="bg-white rounded-2xl border border-border/50 p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Hourglass className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Em Produção</span>
          </div>
          <h3 className="text-3xl font-bold text-foreground mb-1">{producao}</h3>
          <span className="text-xs font-semibold text-blue-500">{pct(producao)} do total</span>
        </div>

        <div className="bg-white rounded-2xl border border-border/50 p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase text-right leading-tight">Aguardando Início</span>
          </div>
          <h3 className="text-3xl font-bold text-foreground mb-1">{aguardando}</h3>
          <span className="text-xs font-semibold text-amber-500">{pct(aguardando)} do total</span>
        </div>

        <div className="bg-white rounded-2xl border border-border/50 p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <PlusCircle className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase text-right leading-tight">Demandas Extras</span>
          </div>
          <h3 className="text-3xl font-bold text-foreground mb-1">{extras}</h3>
          <span className="text-xs font-semibold text-orange-500">{pct(extras)} do total</span>
        </div>

        <div className="bg-white rounded-2xl border border-border/50 p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlarmClock className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Em Risco</span>
          </div>
          <h3 className="text-3xl font-bold text-foreground mb-1">{risco}</h3>
          <span className="text-xs font-semibold text-red-500">{pct(risco)} do total</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 print:grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl border border-border/50 p-6 flex flex-col shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-6">Fluxo de Execução</h3>
          <div className="flex-1 flex items-center justify-center gap-8">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90 transform">
                {chartData.length === 0 ? (
                  <circle cx="80" cy="80" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="25" />
                ) : (
                  chartData.map((d, i) => {
                    const strokeDasharray = getStrokeDashArray(d.value, totalValChart, circumference);
                    const strokeDashoffset = getStrokeDashOffset(d.offset, totalValChart, circumference);
                    if (d.value === 0) return null;
                    return (
                      <circle
                        key={i}
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="none"
                        stroke={d.color}
                        strokeWidth="25"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000"
                      />
                    );
                  })
                )}
              </svg>
            </div>
            <div className="flex flex-col gap-2">
              {chartData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></div>
                  <span className="text-xs font-medium text-foreground">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="text-xs font-medium text-muted-foreground text-left mt-4 hover:text-foreground">Ver detalhes {'>'}</button>
        </div>

        <div className="bg-white rounded-2xl border border-border/50 p-6 flex flex-col shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-6">Distribuição de Atividades</h3>
          <div className="flex-1 flex flex-col justify-center gap-4">
            {[
              { label: "Planejamento", val: catPlanejamento },
              { label: "Campanhas", val: catCampanhas },
              { label: "Conteúdo", val: catConteudo },
              { label: "Relatórios", val: catRelatorios },
              { label: "Operacional", val: catOperacional },
            ].map((bar, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-xs font-medium text-muted-foreground w-24 truncate">{bar.label}</span>
                <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-[#1e1b4b] rounded-full transition-all duration-500" style={{ width: `${(bar.val / maxCat) * 100}%` }}></div>
                </div>
                <span className="text-xs font-bold text-foreground w-4 text-right">{bar.val}</span>
              </div>
            ))}
          </div>
          <button className="text-xs font-medium text-muted-foreground text-left mt-4 hover:text-foreground">Ver detalhes {'>'}</button>
        </div>

        <div className="bg-[#8B5CF6] text-white rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden print:hidden">
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
                : (lastActive ? lastActive.title : "Nenhuma tarefa ativa")}
            </p>
            <span className="text-5xl font-mono font-bold tracking-tight shadow-sm mt-2">
              {isAnyActive 
                ? (activeDemand ? <LiveTimer demandId={activeDemand.id} spentTime={activeDemand.spent_time_seconds || 0} activeTimer={activeTimer} /> : activeExec ? <LiveExecTimer execucao={activeExec} /> : "00:00:00")
                : (lastActive ? lastActive.time : "00:00:00")}
            </span>
          </div>

          <div className="relative z-10 mt-4 flex items-center justify-center gap-3">
            {isAnyActive && (
              <button onClick={handlePauseActive} className="flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-[#8B5CF6] transition-colors px-6 py-3 rounded-xl text-sm font-semibold flex-1 max-w-[200px]">
                <Pause className="w-4 h-4" /> Parar Tempo
              </button>
            )}
            {!isAnyActive && lastActive && (
              <button onClick={() => setLastActive(null)} className="flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-[#8B5CF6] transition-colors px-6 py-3 rounded-xl text-sm font-semibold flex-1 max-w-[200px]">
                <CheckCircle2 className="w-4 h-4" /> Registrar Tempo
              </button>
            )}
            {(isAnyActive || lastActive) && (
              <button 
                onClick={async () => {
                  const targetId = activeDemand?.id || lastActive?.id;
                  if (targetId) {
                    setActiveTimer(null);
                    setLastActive(null);
                    optimisticUpdate(targetId, { spent_time_seconds: 0 });
                    await resetDemandTime(targetId);
                  } else if (activeExec) {
                    updateExecucao(activeExec.id, { tempoGasto: 0, timerStart: null });
                    setLastActive(null);
                  }
                }}
                title="Zerar cronômetro"
                className="flex items-center justify-center p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-colors backdrop-blur-sm"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>

      <div className="bg-white rounded-2xl border border-border/50 shadow-sm flex flex-col mb-16">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Central de Atividades</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Buscar atividade..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]" />
            </div>
            <div className="relative" ref={filterRef}>
              <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 px-4 py-2 border border-border bg-white rounded-xl text-sm font-medium hover:bg-secondary/20 transition-colors">
                <SlidersHorizontal className="w-4 h-4" /> Filtros {filterPriority !== "Todas" && <span className="bg-[#8B5CF6] text-white text-[10px] px-1.5 py-0.5 rounded-md ml-1">{filterPriority}</span>}
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
        </div>

        <div className="overflow-visible min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/30 text-xs font-semibold text-muted-foreground border-b border-border/50">
                {sortBy === "custom" && <th className="py-3 px-2 w-[30px]"></th>}
                <th className="py-3 px-6 whitespace-nowrap">Cliente</th>
                <th className="py-3 px-4 whitespace-nowrap w-[200px]">Atividade</th>
                <th className="py-3 px-4 whitespace-nowrap">Demanda</th>
                <th className="py-3 px-4 whitespace-nowrap text-center">Prioridade</th>
                <th className="py-3 px-4 whitespace-nowrap text-center">Status</th>
                <th className="py-3 px-4 whitespace-nowrap min-w-[300px]">Observação</th>
                <th className="py-3 px-4 whitespace-nowrap text-center">Timer</th>
              </tr>
            </thead>
            <tbody>
              {demandsLoading ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-sm font-semibold text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
                      Carregando atividades...
                    </div>
                  </td>
                </tr>
              ) : filteredDemands.length === 0 && filteredExecucoes.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-sm text-muted-foreground">
                    Nenhuma execução encontrada. Crie uma na aba Execuções.
                  </td>
                </tr>
              ) : (
                <>
                  {filteredDemands.map((demand, idx) => (
                    <tr key={demand.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/10 transition-colors group">
                      {sortBy === "custom" && (
                        <td className="py-3 px-2 w-[30px]">
                          <div className="flex flex-col gap-1 items-center justify-center text-muted-foreground">
                            <button onClick={() => handleReorder(demand.id, 'up', filteredDemands)} className="hover:bg-secondary rounded p-0.5"><ChevronUp className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleReorder(demand.id, 'down', filteredDemands)} className="hover:bg-secondary rounded p-0.5"><ChevronDown className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      )}
                      <td className="py-3 px-6 text-sm font-semibold text-foreground whitespace-nowrap">{demand.client_name || "-"}</td>
                      <td className="py-3 px-4 text-sm font-medium text-foreground truncate max-w-[200px]">{demand.title}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${demand.type === "OUT_OF_SCOPE" ? "text-orange-500 bg-orange-500/10" : "text-emerald-500 bg-emerald-500/10"}`}>
                          {demand.type === "OUT_OF_SCOPE" ? "Demanda Extra" : "Prevista"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${demand.priority === "HIGH" || demand.priority === "URGENT" ? "text-red-500 bg-red-500/10" : demand.priority === "LOW" ? "text-emerald-500 bg-emerald-500/10" : "text-blue-500 bg-blue-500/10"}`}>
                          {demand.priority === "HIGH" ? "Alta" : demand.priority === "LOW" ? "Baixa" : demand.priority === "URGENT" ? "Urgente" : "Média"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <DemandStatusBadge demand={demand} optimisticUpdate={optimisticUpdate} updateDemand={updateDemand} />
                      </td>
                      <td className="py-3 px-4">
                        <input 
                          type="text" 
                          placeholder="Observação..." 
                          value={demand.description || ""}
                          onChange={(e) => optimisticUpdate(demand.id, { description: e.target.value })}
                          onBlur={async (e) => await updateDemand(demand.id, { description: e.target.value })}
                          className="w-full bg-white border border-border focus:border-[#8B5CF6] focus:outline-none text-[12px] text-foreground rounded-lg px-3 py-1.5 transition-all shadow-sm placeholder:text-muted-foreground/60" 
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xs font-mono font-bold text-foreground mr-1">
                            <LiveTimer demandId={demand.id} spentTime={demand.spent_time_seconds || 0} activeTimer={activeTimer} />
                          </span>
                          {activeTimer?.demand_id === demand.id ? (
                            <button 
                              onClick={() => handlePause(demand)}
                              className="print:hidden w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors shadow-sm"
                            >
                              <Pause className="w-4 h-4 fill-current" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handlePlay(demand)}
                              className="print:hidden w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors shadow-sm"
                            >
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredExecucoes.map((row) => (
                    <tr key={row.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/10 transition-colors group">
                      {sortBy === "custom" && (
                        <td className="py-3 px-2 w-[30px]">
                          <div className="flex flex-col gap-1 items-center justify-center text-muted-foreground">
                            <button onClick={() => handleReorder(row.id, 'up', filteredExecucoes)} className="hover:bg-secondary rounded p-0.5"><ChevronUp className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleReorder(row.id, 'down', filteredExecucoes)} className="hover:bg-secondary rounded p-0.5"><ChevronDown className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      )}
                      <td className="py-3 px-6 text-sm font-semibold text-foreground whitespace-nowrap">{row.cliente || row.projetoId || "-"}</td>
                      <td className="py-3 px-4 text-sm font-medium text-foreground truncate max-w-[200px]">{row.titulo}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap ${row.tipoPlanejamento === "Demanda Extra" ? "text-orange-500 bg-orange-500/10" : "text-emerald-500 bg-emerald-500/10"}`}>
                          {row.tipoPlanejamento || "Previsto"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${row.prioridade === "Alta" ? "text-red-500 bg-red-500/10" : row.prioridade === "Baixa" ? "text-emerald-500 bg-emerald-500/10" : "text-blue-500 bg-blue-500/10"}`}>{row.prioridade || "Media"}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <ExecucaoStatusBadge execucao={row} updateExecucao={updateExecucao} />
                      </td>
                      <td className="py-3 px-4">
                        <input 
                          type="text" 
                          placeholder="Observação..." 
                          value={row.observacao || ""}
                          onChange={(ev) => updateExecucao(row.id, { observacao: ev.target.value })}
                          className="w-full bg-white border border-border focus:border-[#8B5CF6] focus:outline-none text-[12px] text-foreground rounded-lg px-3 py-1.5 transition-all shadow-sm placeholder:text-muted-foreground/60" 
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xs font-mono font-bold text-foreground mr-1">
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
                              className="print:hidden w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors shadow-sm"
                            >
                              <Pause className="w-4 h-4 fill-current" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => updateExecucao(row.id, { timerStart: Date.now() })}
                              className="print:hidden w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors shadow-sm"
                            >
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                  }
                </>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <button className="font-medium flex items-center gap-1 hover:text-foreground">Ver todas as atividades {'->'}</button>
          <div className="flex items-center gap-4">
            <span>1 - 5 de {execucoes.length}</span>
            <div className="flex items-center gap-1">
              <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-secondary">{'<'}</button>
              <button className="w-6 h-6 flex items-center justify-center rounded bg-[#8B5CF6]/10 text-[#8B5CF6] font-medium border border-[#8B5CF6]/20">1</button>
              <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-secondary">2</button>
              <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-secondary">3</button>
              <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-secondary">{'>'}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating KORE AI Chat Widget */}
      <KoreAiChatWidget />

    </div>
  );
}


