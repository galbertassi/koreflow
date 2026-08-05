"use client";

import { useState, useEffect, Suspense } from "react";
import { Play, Pause, CheckCircle2, Clock, Plus, Search, Filter, AlertCircle, PlayCircle, StopCircle, ArrowRight, AlignLeft } from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { useSearchParams } from "next/navigation";
import { useDemands, DemandRecord, DemandStatus } from "@/hooks/use-demands";
import { useDemandTimer } from "@/hooks/use-demand-timer";
import { createDemand, updateDemand as updateDemandAction, playDemand, pauseDemand, completeDemand } from "./actions";

function DemandasContent() {
  const searchParams = useSearchParams();
  const { configuracoes } = useStore();
  const { demands, loading, optimisticUpdate } = useDemands();
  const { activeTimer, getDisplayTime } = useDemandTimer();
  
  // Pegamos a demanda ativa baseada no estado visual otimista
  const activeDemand = demands.find(d => d.status === "IN_PROGRESS") || null;
  const [interruptionModal, setInterruptionModal] = useState<{ isOpen: boolean; pendingDemand: DemandRecord | null }>({ isOpen: false, pendingDemand: null });
  const [isNewDemandModalOpen, setIsNewDemandModalOpen] = useState(false);
  const [notesModal, setNotesModal] = useState<{ isOpen: boolean; demand: DemandRecord | null }>({ isOpen: false, demand: null });
  const [tempNote, setTempNote] = useState("");

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setIsNewDemandModalOpen(true);
    }
  }, [searchParams]);

  const [newDemandForm, setNewDemandForm] = useState({
    title: "", client: "", category: "", type: "IN_SCOPE" as DemandRecord["type"], priority: "MEDIUM" as DemandRecord["priority"], status: configuracoes.etiquetas[0]?.nome || "Pendente" as any
  });

  const handleCreateDemand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDemandForm.title) return;
    
    await createDemand({
      title: newDemandForm.title,
      client_name: newDemandForm.client || "Cliente Geral",
      category_name: newDemandForm.category || "Geral",
      category_color: "bg-[#8B5CF6]",
      type: newDemandForm.type,
      priority: newDemandForm.priority
    });
    
    setIsNewDemandModalOpen(false);
    setNewDemandForm({ title: "", client: "", category: "", type: "IN_SCOPE", priority: "MEDIUM", status: configuracoes.etiquetas[0]?.nome || "Pendente" as any });
  };

  const handlePlay = async (demand: DemandRecord) => {
    if (activeDemand && activeDemand.id !== demand.id) {
      setInterruptionModal({ isOpen: true, pendingDemand: demand });
      return;
    }
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

  const confirmInterruption = async () => {
    if (!interruptionModal.pendingDemand || !activeDemand) return;
    optimisticUpdate(activeDemand.id, { status: "PAUSED" });
    optimisticUpdate(interruptionModal.pendingDemand.id, { status: "IN_PROGRESS" });
    setInterruptionModal({ isOpen: false, pendingDemand: null });
    await playDemand(interruptionModal.pendingDemand.id);
  };

  const getStatusBadge = (status: DemandStatus) => {
    switch (status) {
      case "IN_PROGRESS": return <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-semibold flex items-center gap-1.5"><PlayCircle className="w-3 h-3" /> Em Andamento</span>;
      case "PAUSED": return <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[11px] font-semibold flex items-center gap-1.5"><Pause className="w-3 h-3" /> Pausada</span>;
      case "COMPLETED": return <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 text-[11px] font-semibold flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Concluída</span>;
      default: return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold flex items-center gap-1.5"><Clock className="w-3 h-3" /> Pendente</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT": return <span className="text-red-500 font-bold text-xs uppercase">Urgente</span>;
      case "HIGH": return <span className="text-orange-500 font-semibold text-xs uppercase">Alta</span>;
      case "LOW": return <span className="text-slate-400 font-medium text-xs uppercase">Baixa</span>;
      default: return <span className="text-blue-500 font-medium text-xs uppercase">Média</span>;
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Demandas</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Registre e documente tudo o que você executa no seu dia. Nunca mais esqueça onde seu tempo foi investido.
          </p>
        </div>
        <button 
          onClick={() => setIsNewDemandModalOpen(true)}
          className="flex items-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm shadow-[#8B5CF6]/20"
        >
          <Plus className="w-4 h-4" /> Nova Demanda
        </button>
      </div>

      {/* Active Demand Highlight */}
      {activeDemand && (
        <div className="mb-8 bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
          <div className="flex items-center gap-4 w-full">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Play className="w-5 h-5 text-emerald-600 fill-emerald-600 ml-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-emerald-600 mb-1 uppercase tracking-wider">Demanda em Andamento</p>
              <h3 className="text-lg font-semibold text-foreground truncate">{activeDemand.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{activeDemand.client_name} • {activeDemand.category_name}</p>
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

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por nome, cliente ou categoria..." 
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 bg-white border border-border px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors shrink-0 w-full sm:w-auto justify-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
          Filtros
        </button>
      </div>

      {/* Demands List */}
      <div className="bg-white border border-border/50 rounded-2xl shadow-sm overflow-hidden relative">
        {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">Carregando...</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/30">
                <th className="py-3 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[40%]">Demanda</th>
                <th className="py-3 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Cliente</th>
                <th className="py-3 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tipo</th>
                <th className="py-3 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="py-3 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tempo</th>
                <th className="py-3 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {demands.filter(d => d.status !== "COMPLETED").map((demand) => (
                <tr key={demand.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors group">
                  <td 
                    className="py-4 px-5 cursor-pointer hover:bg-secondary/40 transition-colors" 
                    onClick={() => { setNotesModal({ isOpen: true, demand }); setTempNote(demand.description || ""); }}
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${demand.category_color || 'bg-slate-500'}`}></span>
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase">{demand.category_name}</span>
                      </div>
                      <div className="flex items-center gap-2 relative">
                        <span className="text-sm font-medium text-foreground truncate">{demand.title}</span>
                        {demand.description && (
                          <div className="flex items-center justify-center w-5 h-5 rounded bg-blue-50 text-blue-500 shrink-0" title="Possui anotações">
                            <AlignLeft className="w-3 h-3" />
                          </div>
                        )}
                        {/* Tooltip da primeira demanda */}
                        {searchParams.get("firstDemand") === demand.id && (
                          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 flex items-center animate-in fade-in slide-in-from-left-2 duration-500 z-10 whitespace-nowrap">
                            <div className="w-2 h-2 bg-primary rotate-45 translate-x-1 border-b border-l border-primary/20"></div>
                            <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg">
                              Esta é sua primeira demanda! Clique no play para começar.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-sm text-muted-foreground">
                    {demand.client_name}
                  </td>
                  <td className="py-4 px-5">
                    <select
                      value={demand.type}
                      onChange={(e) => {
                        optimisticUpdate(demand.id, { type: e.target.value as any });
                        updateDemandAction(demand.id, { type: e.target.value as any });
                      }}
                      className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider appearance-none cursor-pointer border-none outline-none ${demand.type === 'IN_SCOPE' ? 'bg-slate-100 text-slate-600' : 'bg-orange-100 text-orange-600'}`}
                    >
                      <option value="IN_SCOPE">Planejado</option>
                      <option value="OUT_OF_SCOPE">Extra</option>
                    </select>
                  </td>
                  <td className="py-4 px-5">
                    {(() => {
                      const etq = configuracoes.etiquetas.find(e => e.nome === demand.status);
                      const corClass = etq ? `${etq.cor.split(' ')[0]} ${etq.cor.split(' ')[1]}` : 'bg-slate-100 text-slate-600';
                      
                      return (
                        <select
                          value={demand.status}
                          onChange={(e) => {
                            optimisticUpdate(demand.id, { status: e.target.value as any });
                            updateDemandAction(demand.id, { status: e.target.value as any });
                          }}
                          className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider appearance-none cursor-pointer border-none outline-none ${corClass}`}
                        >
                          {configuracoes.etiquetas.map(etqOption => (
                            <option key={etqOption.nome} value={etqOption.nome}>{etqOption.nome}</option>
                          ))}
                        </select>
                      );
                    })()}
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-sm font-medium font-mono text-foreground">{getDisplayTime(demand.id, demand.spent_time_seconds)}</span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {demand.status !== "IN_PROGRESS" && (
                        <button onClick={(e) => { e.stopPropagation(); handlePlay(demand); }} className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center hover:bg-[#8B5CF6]/10 hover:text-[#8B5CF6] hover:border-[#8B5CF6]/30 transition-colors shadow-sm text-muted-foreground">
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {demand.status === "IN_PROGRESS" && (
                        <button onClick={(e) => { e.stopPropagation(); handlePause(demand); }} className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-colors shadow-sm text-muted-foreground">
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); handleComplete(demand); }} className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors shadow-sm text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interruption Modal */}
      {interruptionModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-6">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Pausar demanda atual?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Você já possui uma demanda em andamento (<strong>{activeDemand?.title}</strong>). Deseja pausá-la para iniciar <strong>{interruptionModal.pendingDemand?.title}</strong>?
            </p>
            
            <div className="bg-secondary/50 rounded-xl p-4 mb-8 flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">O tempo será contabilizado na nova demanda.</span>
                <span className="text-[11px] text-muted-foreground">A demanda atual ficará com status de Pausada.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setInterruptionModal({ isOpen: false, pendingDemand: null })}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-white text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmInterruption}
                className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors shadow-sm"
              >
                Pausar e Iniciar Nova
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {notesModal.isOpen && notesModal.demand && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-semibold text-foreground mb-2">Anotações da Demanda</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Registre detalhes e observações para <strong>{notesModal.demand.title}</strong>
            </p>
            
            <textarea 
              value={tempNote}
              onChange={e => setTempNote(e.target.value)}
              placeholder="Adicione links, descrições ou qualquer detalhe importante..."
              className="w-full h-32 px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all resize-none mb-6"
            />
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setNotesModal({ isOpen: false, demand: null })}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-white text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  optimisticUpdate(notesModal.demand!.id, { description: tempNote });
                  updateDemandAction(notesModal.demand!.id, { description: tempNote });
                  setNotesModal({ isOpen: false, demand: null });
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-medium transition-colors shadow-sm"
              >
                Salvar Anotação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Demand Modal */}
      {isNewDemandModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-semibold text-foreground mb-6">Criar Nova Demanda</h2>
            
            <form onSubmit={handleCreateDemand} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Título da Demanda *</label>
                <input 
                  required
                  type="text" 
                  value={newDemandForm.title}
                  onChange={e => setNewDemandForm({...newDemandForm, title: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
                  placeholder="Ex: Landing Page Nova" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Cliente</label>
                  <input 
                    type="text" 
                    value={newDemandForm.client}
                    onChange={e => setNewDemandForm({...newDemandForm, client: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
                    placeholder="Ex: Acme Corp" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Categoria</label>
                  <input 
                    type="text" 
                    value={newDemandForm.category}
                    onChange={e => setNewDemandForm({...newDemandForm, category: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
                    placeholder="Ex: Design" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Tipo</label>
                  <select 
                    value={newDemandForm.type}
                    onChange={e => setNewDemandForm({...newDemandForm, type: e.target.value as any})}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
                  >
                    <option value="IN_SCOPE">Planejado</option>
                    <option value="OUT_OF_SCOPE">Extra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Prioridade</label>
                  <select 
                    value={newDemandForm.priority}
                    onChange={e => setNewDemandForm({...newDemandForm, priority: e.target.value as any})}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="button"
                  onClick={() => setIsNewDemandModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-white text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-medium transition-colors shadow-sm"
                >
                  Criar Demanda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function DemandasPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Carregando demandas...</div>}>
      <DemandasContent />
    </Suspense>
  );
}
