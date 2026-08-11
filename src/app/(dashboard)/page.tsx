"use client";

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
  Pause
} from "lucide-react";
import { useDemands, DemandRecord } from "@/hooks/use-demands";
import { useDemandTimer } from "@/hooks/use-demand-timer";
import { playDemand, pauseDemand, completeDemand } from "./demandas/actions";

export default function DashboardPage() {
  const { execucoes, configuracoes } = useStore();
  const { demands, optimisticUpdate } = useDemands();
  const { activeTimer, getDisplayTime } = useDemandTimer();

  const activeDemand = demands.find(d => d.status === "IN_PROGRESS") || null;

  const handlePlay = async (demand: DemandRecord) => {
    optimisticUpdate(demand.id, { status: "IN_PROGRESS" });
    await playDemand(demand.id);
  };

  const handlePause = async (demand: DemandRecord) => {
    optimisticUpdate(demand.id, { status: "PAUSED" });
    await pauseDemand(demand.id);
  };

  const handleComplete = async (demand: DemandRecord) => {
    optimisticUpdate(demand.id, { status: "COMPLETED" });
    await completeDemand(demand.id);
  };

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
          <span className="text-xs font-semibold text-emerald-500">ï¿½  {execucoes.length > 0 ? "Atualizado" : "Novo"}</span>
        </div>

        {/* Entregues */}
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

        {/* Em Produção */}
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

        {/* Aguardando Início */}
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

        {/* Demandas Extras */}
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

        {/* Em Risco */}
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

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Fluxo de Execução (Pie Chart) */}
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

        {/* Distribuição de Atividades */}
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

        {/* Demandas Extras */}
        <div className="bg-white rounded-2xl border border-border/50 p-6 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-foreground">Demandas Extras</h3>
            <button className="text-xs font-medium text-muted-foreground flex items-center gap-1 hover:text-foreground">
              Ver todas <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            {demandasExtras.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                Nenhuma demanda extra.
              </div>
            ) : (
              demandasExtras.slice(0,4).map((demanda, i) => (
                <div key={i} className="flex items-center justify-between pb-3 border-b border-border/50 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{demanda.titulo}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{demanda.criadoEm}</span>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Total</span>
            <span className="text-sm font-bold text-orange-500">{extras}</span>
          </div>
        </div>

      </div>

      {activeDemand && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
          <div className="flex items-center gap-4 w-full">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Play className="w-5 h-5 text-emerald-600 fill-emerald-600 ml-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-emerald-600 mb-1 uppercase tracking-wider">Demanda em Andamento</p>
              <h3 className="text-lg font-semibold text-foreground truncate">{activeDemand.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{activeDemand.client_name || "Sem cliente"} • {activeDemand.category_name || "Sem categoria"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
            <div className="flex flex-col items-end mr-4">
              <span className="text-2xl font-bold text-foreground font-mono">{getDisplayTime(activeDemand.id, activeDemand.spent_time_seconds)}</span>
              <span className="text-xs text-muted-foreground">Tempo investido</span>
            </div>
            <button onClick={() => handlePause(activeDemand)} className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-colors shadow-sm">
              <Pause className="w-4 h-4" />
            </button>
            <button onClick={() => handleComplete(activeDemand)} className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Central de Atividades Table */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Central de Atividades</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Buscar atividade..." className="w-64 pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-border bg-white rounded-xl text-sm font-medium hover:bg-secondary/20 transition-colors">
              <SlidersHorizontal className="w-4 h-4" /> Filtros
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/30 text-xs font-semibold text-muted-foreground border-b border-border/50">
                <th className="py-3 px-6 whitespace-nowrap">ID</th>
                <th className="py-3 px-4 whitespace-nowrap">Solicitação</th>
                <th className="py-3 px-4 whitespace-nowrap w-[200px]">Atividade</th>
                <th className="py-3 px-4 whitespace-nowrap">Cliente</th>
                <th className="py-3 px-4 whitespace-nowrap">Categoria</th>
                <th className="py-3 px-4 whitespace-nowrap">Planejamento</th>
                <th className="py-3 px-4 whitespace-nowrap text-center">Prioridade</th>
                <th className="py-3 px-4 whitespace-nowrap">Entrega</th>
                <th className="py-3 px-4 whitespace-nowrap">Responsável</th>
                <th className="py-3 px-4 whitespace-nowrap text-center">Status</th>
                <th className="py-3 px-6 whitespace-nowrap text-right">Progresso</th>
                <th className="py-3 px-4 whitespace-nowrap text-center">Timer</th>
              </tr>
            </thead>
            <tbody>
              {demands.length === 0 && execucoes.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-sm text-muted-foreground">
                    Nenhuma execução encontrada. Crie uma na aba Execuções.
                  </td>
                </tr>
              ) : (
                <>
                {demands.map((demand, idx) => (
                  <tr key={demand.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/10 transition-colors group">
                    <td className="py-3 px-6 text-xs font-bold text-foreground">D{idx + 1}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{new Date(demand.created_at).toLocaleDateString("pt-BR")}</td>
                    <td className="py-3 px-4 text-sm font-medium text-foreground truncate max-w-[200px]">{demand.title}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{demand.client_name || "-"}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{demand.category_name || "-"}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${demand.type === "OUT_OF_SCOPE" ? "text-orange-500 bg-orange-500/10" : "text-emerald-500 bg-emerald-500/10"}`}>
                        {demand.type === "OUT_OF_SCOPE" ? "Demanda Extra" : "No Escopo"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded">{demand.priority}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">-</td>
                    <td className="py-3 px-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center text-[9px] font-bold text-[#8B5CF6]">
                        {configuracoes?.nome?.substring(0, 2).toUpperCase() || "VO"}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                        demand.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                        demand.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500' :
                        demand.status === 'PAUSED' ? 'bg-amber-500/10 text-amber-500' : 'bg-gray-500/10 text-gray-500'
                      }`}>
                        {demand.status}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[10px] font-bold text-foreground w-8 text-right">
                          {demand.status === 'COMPLETED' ? '100%' : demand.status === 'PENDING' ? '0%' : '50%'}
                        </span>
                        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full ${demand.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-[#1e1b4b]'}`} 
                               style={{ width: demand.status === 'COMPLETED' ? '100%' : demand.status === 'PENDING' ? '0%' : '50%' }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs font-mono font-medium text-foreground mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           {getDisplayTime(demand.id, demand.spent_time_seconds)}
                        </span>
                        {demand.status !== "IN_PROGRESS" && demand.status !== "COMPLETED" && (
                          <button onClick={(e) => { e.stopPropagation(); handlePlay(demand); }} className="w-7 h-7 rounded-lg bg-white border border-border flex items-center justify-center hover:bg-[#8B5CF6]/10 hover:text-[#8B5CF6] hover:border-[#8B5CF6]/30 transition-colors shadow-sm text-muted-foreground">
                            <Play className="w-3 h-3" />
                          </button>
                        )}
                        {demand.status === "IN_PROGRESS" && (
                          <button onClick={(e) => { e.stopPropagation(); handlePause(demand); }} className="w-7 h-7 rounded-lg bg-white border border-border flex items-center justify-center hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-colors shadow-sm text-muted-foreground">
                            <Pause className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {execucoes.slice(0, 5).map((e, idx) => (
                  <tr key={e.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/10 transition-colors">
                    <td className="py-3 px-6 text-xs font-bold text-foreground">00{idx + 1}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{e.criadoEm}</td>
                    <td className="py-3 px-4 text-sm font-medium text-foreground truncate max-w-[200px]">{e.titulo}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{e.cliente || "Cliente A"}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{e.categoria}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${e.tipoPlanejamento === "Demanda Extra" ? "text-orange-500 bg-orange-500/10" : "text-emerald-500 bg-emerald-500/10"}`}>
                        {e.tipoPlanejamento || "Previsto"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded">Média</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">10/05/2025</td>
                    <td className="py-3 px-4 flex items-center gap-2">
                      {configuracoes?.foto ? (
                        <img src={configuracoes.foto} alt="Perfil" className="w-6 h-6 rounded-full object-cover border border-border" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center text-[9px] font-bold text-[#8B5CF6]">
                          {configuracoes?.nome?.substring(0, 2).toUpperCase() || "GA"}
                        </div>
                      )}
                      <span className="text-xs text-foreground truncate max-w-[80px]">
                        {configuracoes?.nome?.split(' ')[0] || "Você"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                        e.status === 'Concluida' ? 'bg-emerald-500/10 text-emerald-500' :
                        e.status === 'Em producao' ? 'bg-blue-500/10 text-blue-500' :
                        e.status === 'Em Risco' ? 'bg-red-500/10 text-red-500' :
                        e.status === 'Revisao' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[10px] font-bold text-foreground w-8 text-right">
                          {e.status === 'Concluida' ? '100%' : e.status === 'Aguardando' ? '0%' : '50%'}
                        </span>
                        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full ${e.status === 'Concluida' ? 'bg-emerald-500' : 'bg-[#1e1b4b]'}`} 
                               style={{ width: e.status === 'Concluida' ? '100%' : e.status === 'Aguardando' ? '0%' : '50%' }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-muted-foreground">-</td>
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


