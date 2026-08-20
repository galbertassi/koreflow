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
  MessageSquare
} from "lucide-react";
import { useDemands, DemandRecord } from "@/hooks/use-demands";
import { useDemandTimer } from "@/hooks/use-demand-timer";
import { playDemand, pauseDemand, completeDemand, updateDemand } from "./demandas/actions";

const DEMAND_STATUSES = ["Pendente", "Em producao", "Revisao", "Concluida", "Em Risco", "PAUSED", "IN_PROGRESS"];
const EXECUCAO_STATUSES = ["Pendente", "Em producao", "Revisao", "Concluida", "Em Risco", "Aguardando"];

function DemandStatusBadge({ demand, optimisticUpdate, updateDemand }: { demand: any, optimisticUpdate: any, updateDemand: any }) {
  const [open, setOpen] = useState(false);
  const { configuracoes } = useStore();
  
  const etiqueta = configuracoes.etiquetas?.find(e => e.nome === demand.status) || { cor: "#94a3b8" };
  const color = etiqueta.cor;

  return (
    <div className={`relative inline-block text-left ${open ? 'z-50' : 'z-10'}`}>
      <button 
        onClick={() => setOpen(!open)} 
        style={{ backgroundColor: color, color: '#ffffff' }}
        className="flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors w-full min-w-[120px] shadow-sm hover:opacity-90"
      >
        {demand.status}
        <ChevronDown className="w-3 h-3 ml-1" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 z-50 bg-white border border-border rounded-xl shadow-lg py-1 w-40">
            {DEMAND_STATUSES.map((s) => {
              const sColor = configuracoes.etiquetas?.find(e => e.nome === s)?.cor || "#94a3b8";
              return (
                <button
                  key={s}
                  onClick={async (e) => {
                    e.stopPropagation();
                    setOpen(false);
                    optimisticUpdate(demand.id, { status: s });
                    await updateDemand(demand.id, { status: s });
                  }}
                  className="w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-secondary/50 transition-colors flex items-center gap-2 text-foreground"
                >
                  <span style={{ backgroundColor: sColor }} className={`w-2 h-2 shrink-0 rounded-full ${s !== demand.status ? 'opacity-30' : ''}`} />
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

function ExecucaoStatusBadge({ execucao, updateExecucao }: { execucao: any, updateExecucao: any }) {
  const [open, setOpen] = useState(false);
  const { configuracoes } = useStore();
  
  const etiqueta = configuracoes.etiquetas?.find(e => e.nome === execucao.status) || { cor: "#94a3b8" };
  const color = etiqueta.cor;

  return (
    <div className={`relative inline-block text-left ${open ? 'z-50' : 'z-10'}`}>
      <button 
        onClick={() => setOpen(!open)} 
        style={{ backgroundColor: color, color: '#ffffff' }}
        className="flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors w-full min-w-[120px] shadow-sm hover:opacity-90"
      >
        {execucao.status}
        <ChevronDown className="w-3 h-3 ml-1" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 z-50 bg-white border border-border rounded-xl shadow-lg py-1 w-40">
            {EXECUCAO_STATUSES.map((s) => {
              const sColor = configuracoes.etiquetas?.find(e => e.nome === s)?.cor || "#94a3b8";
              return (
                <button
                  key={s}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateExecucao(execucao.id, { status: s });
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-secondary/50 transition-colors flex items-center gap-2 text-foreground"
                >
                  <span style={{ backgroundColor: sColor }} className={`w-2 h-2 shrink-0 rounded-full ${s !== execucao.status ? 'opacity-30' : ''}`} />
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

export default function DashboardPage() {
  const { execucoes, configuracoes, updateExecucao } = useStore();
  const { demands, optimisticUpdate } = useDemands();
  const { activeTimer, getDisplayTime, playDemand, pauseDemand, completeDemand } = useDemandTimer();
  const [tick, setTick] = useState(0);

  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState("Todas");
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) setIsFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeDemand = activeTimer ? demands.find(d => d.id === activeTimer.demand_id) : null;
  const activeExec = execucoes.find(e => e.timerStart != null) || null;
  const isAnyActive = !!activeDemand || !!activeExec;
  
  const [lastActive, setLastActive] = useState<{ id: string, title: string, time: string } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
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

  const getExecucaoTime = (e: any) => {
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
    await playDemand(demand.id);
  };

  const handlePause = async (demand: DemandRecord) => {
    await pauseDemand(demand.id);
  };

  const handleComplete = async (demand: DemandRecord) => {
    optimisticUpdate(demand.id, { status: "COMPLETED" });
    await completeDemand(demand.id);
  };

  const filteredDemands = demands.filter(d => {
    const matchSearch = (d.title || "").toLowerCase().includes(search.toLowerCase()) || (d.client_name || "").toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === "Todas" || d.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  const filteredExecucoes = execucoes.filter(e => {
    const matchSearch = (e.titulo || "").toLowerCase().includes(search.toLowerCase()) || (e.cliente || "").toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === "Todas" || e.prioridade === filterPriority;
    return matchSearch && matchPriority;
  });

  const total = execucoes.length || 1;
  const entregues = execucoes.filter(e => e.status === "Concluida").length;
  const producao = execucoes.filter(e => e.status === "Em producao" || e.status === "Revisao").length;
  const aguardando = execucoes.filter(e => e.status === "Aguardando").length;

  // Vamos definir 'Demandas Extras' como as execucoes com categoria 'Extra' ou algo que mostre que fugiu do escopo.
  // Como nao temos essa flag especifica agora, usaremos a Categoria "Urgente" se houver, ou apenas zerar.
  const demandasExtras = execucoes.filter(e => e.tipoPlanejamento === "Demanda Extra" || e.categoria.toLowerCase().includes("urgente") || e.categoria.toLowerCase().includes("extra"));
  const extras = demandasExtras.length;

  const risco = execucoes.filter(e => e.status === "Em Risco").length;

  const pct = (val: number) => execucoes.length === 0 ? "0.0%" : ((val / total) * 100).toFixed(1) + "%";

  // Distribuicao de Atividades
  const catPlanejamento = execucoes.filter(e => e.categoria.toLowerCase() === "planejamento").length;
  const catCampanhas = execucoes.filter(e => e.categoria.toLowerCase() === "campanhas").length;
  const catConteudo = execucoes.filter(e => e.categoria.toLowerCase() === "conteúdo" || e.categoria.toLowerCase() === "conteudo").length;
  const catRelatorios = execucoes.filter(e => e.categoria.toLowerCase() === "relatórios" || e.categoria.toLowerCase() === "relatorios").length;
  const catOperacional = execucoes.filter(e => e.categoria.toLowerCase() === "operacional").length;

  const maxCat = Math.max(catPlanejamento, catCampanhas, catConteudo, catRelatorios, catOperacional, 1);

  // Pie chart calculation
  const getStrokeDashArray = (val: number, totalVal: number, circumference: number) => {
    return `${(val / totalVal) * circumference} ${circumference}`;
  };
  const getStrokeDashOffset = (startVal: number, totalVal: number, circumference: number) => {
    return -((startVal / totalVal) * circumference);
  };
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  let offsetAcc = 0;
  const totalValChart = entregues + producao + aguardando + extras + risco || 1;
  const chartData = [
    { label: "Entregues", value: entregues, color: "#10b981", offset: 0 },
    { label: "Em Producao", value: producao, color: "#3b82f6", offset: entregues },
    { label: "Aguardando Inicio", value: aguardando, color: "#eab308", offset: entregues + producao },
    { label: "Demandas Extras", value: extras, color: "#f97316", offset: entregues + producao + aguardando },
    { label: "Em Risco", value: risco, color: "#ef4444", offset: entregues + producao + aguardando + extras },
  ];

  return (
    <div className="flex flex-col min-h-full space-y-6 max-w-[1400px] mx-auto pb-10">

      {/* Removido o Header daqui, pois ja esta no layout.tsx (Header.tsx) */}

      {/* Cards - 6 columns */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-2">
        {/* Atividades Totais */}
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
                {execucoes.length === 0 ? (
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
                ? (activeDemand ? getDisplayTime(activeDemand.id, activeDemand.spent_time_seconds) : activeExec ? getExecucaoTime(activeExec) : "00:00:00")
                : (lastActive ? lastActive.time : "00:00:00")}
            </span>
          </div>

          <div className="relative z-10 mt-4 flex items-center justify-center gap-4">
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
          </div>
        </div>

        <div className="overflow-visible min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/30 text-xs font-semibold text-muted-foreground border-b border-border/50">
                <th className="py-3 px-6 whitespace-nowrap">Cliente</th>
                <th className="py-3 px-4 whitespace-nowrap w-[200px]">Atividade</th>
                <th className="py-3 px-4 whitespace-nowrap">Demanda</th>
                <th className="py-3 px-4 whitespace-nowrap text-center">Prioridade</th>
                <th className="py-3 px-4 whitespace-nowrap text-center">Status</th>
                <th className="py-3 px-4 whitespace-nowrap w-[150px]">Observação</th>
                <th className="py-3 px-4 whitespace-nowrap text-center">Timer</th>
              </tr>
            </thead>
            <tbody>
              {filteredDemands.length === 0 && filteredExecucoes.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-sm text-muted-foreground">
                    Nenhuma execução encontrada. Crie uma na aba Execuções.
                  </td>
                </tr>
              ) : (
                <>
                  {filteredDemands.map((demand, idx) => (
                    <tr key={demand.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/10 transition-colors group">
                      <td className="py-3 px-6 text-sm font-semibold text-foreground">{demand.client_name || "-"}</td>
                      <td className="py-3 px-4 text-sm font-medium text-foreground truncate max-w-[200px]">{demand.title}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${demand.type === "OUT_OF_SCOPE" ? "text-orange-500 bg-orange-500/10" : "text-emerald-500 bg-emerald-500/10"}`}>
                          {demand.type === "OUT_OF_SCOPE" ? "Demanda Extra" : "No Escopo"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded">{demand.priority}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <DemandStatusBadge demand={demand} optimisticUpdate={optimisticUpdate} updateDemand={updateDemand} />
                      </td>
                      <td className="py-3 px-4 w-full min-w-[150px]">
                        <input 
                          type="text" 
                          placeholder="Adicionar observação..." 
                          value={demand.description || ""}
                          onChange={(e) => optimisticUpdate(demand.id, { description: e.target.value })}
                          onBlur={async (e) => await updateDemand(demand.id, { description: e.target.value })}
                          className="w-full bg-white border border-border focus:border-[#8B5CF6] focus:outline-none text-[12px] text-foreground rounded-lg px-3 py-1.5 transition-all shadow-sm placeholder:text-muted-foreground/60" 
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xs font-mono font-bold text-foreground mr-1">
                            {getDisplayTime(demand.id, demand.spent_time_seconds)}
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
                      <td className="py-3 px-6 text-sm font-semibold text-foreground truncate max-w-[150px]">{row.cliente || row.projetoId || "-"}</td>
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
                      <td className="py-3 px-4 w-full min-w-[150px]">
                        <input 
                          type="text" 
                          placeholder="Adicionar observação..." 
                          value={row.observacao || ""}
                          onChange={(ev) => updateExecucao(row.id, { observacao: ev.target.value })}
                          className="w-full bg-white border border-border focus:border-[#8B5CF6] focus:outline-none text-[12px] text-foreground rounded-lg px-3 py-1.5 transition-all shadow-sm placeholder:text-muted-foreground/60" 
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xs font-mono font-bold text-foreground mr-1">
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

      {/* Botão Flutuante KORE AI */}
      <div className="print:hidden fixed bottom-6 right-6 z-50 animate-bounce" style={{ animationDuration: '3s' }}>
        <a href="/kore-ai" className="group flex flex-col items-center gap-2 cursor-pointer hover:-translate-y-1 transition-transform">
          <div className="w-24 h-24 md:w-28 md:h-28 flex items-center justify-center relative drop-shadow-2xl">
            <img src="/kore_ai.png" alt="KORE AI" className="w-full h-full object-contain relative z-10" />
          </div>
          <span className="bg-foreground text-background text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 tracking-wider">
            KORE AI
          </span>
        </a>
      </div>

    </div>
  );
}


