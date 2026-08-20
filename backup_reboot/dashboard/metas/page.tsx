"use client";

import { useModal } from "@/hooks/use-modal";
import { useStore } from "@/hooks/use-store";
import { Plus, Target, MoreHorizontal, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function MetasPage() {
  const { openModal } = useModal();
  const { metas, updateMetaProgresso } = useStore();
  const [selectedMeta, setSelectedMeta] = useState<string | null>(null);
  const [progresso, setProgresso] = useState<number>(0);
  const [nota, setNota] = useState("");

  const handleUpdate = () => {
    if (selectedMeta) {
      updateMetaProgresso(selectedMeta, progresso, nota);
      setSelectedMeta(null);
      setNota("");
      setProgresso(0);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Metas</h1>
          <p className="text-sm text-muted-foreground mt-1">Acompanhe seus objetivos e atualize o progresso semanalmente.</p>
        </div>
        <button onClick={() => openModal("CREATE_GOAL")} className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Nova Meta
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Metas ativas", value: metas.length, color: "text-[#8B5CF6]" },
          { label: "Concluidas este mes", value: metas.filter(m => m.progresso === 100).length, color: "text-emerald-500" },
          { label: "Media de avanco", value: metas.length ? Math.round(metas.reduce((a, b) => a + b.progresso, 0) / metas.length) + "%" : "0%", color: "text-blue-500" },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border border-border/50 p-5">
            <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
            <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {selectedMeta && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-1">Atualizar Progresso</h2>
            <p className="text-sm text-muted-foreground mb-6">Como esta o avanco desta meta hoje?</p>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Progresso (%)</label>
                  <span className="text-[#8B5CF6] font-bold">{progresso}%</span>
                </div>
                <input type="range" min="0" max="100" value={progresso} onChange={(e) => setProgresso(Number(e.target.value))} className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]" />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nota / Observacao</label>
                <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 resize-none text-sm" placeholder="O que foi feito? Quais os bloqueios?" />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-8">
              <button onClick={() => setSelectedMeta(null)} className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary rounded-xl transition-colors">Cancelar</button>
              <button onClick={handleUpdate} className="px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors">Salvar Atualizacao</button>
            </div>
          </div>
        </div>
      )}

      {metas.length === 0 ? (
        <div className="flex-1 bg-white rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/5 flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-[#8B5CF6]/50" />
          </div>
          <h3 className="text-base font-semibold mb-2">Nenhuma meta definida</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">Defina metas claras e acompanhe o progresso regularmente.</p>
          <button onClick={() => openModal("CREATE_GOAL")} className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Criar primeira Meta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {metas.map((meta) => (
            <div key={meta.id} className="bg-white rounded-2xl border border-border/50 p-5 hover:border-[#8B5CF6]/20 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5 text-[#8B5CF6]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground leading-snug">{meta.titulo}</h3>
                      <p className="text-xs text-muted-foreground mt-1">Prazo: {meta.prazo || "Sem prazo definido"}</p>
                    </div>
                  </div>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-foreground">Progresso</span>
                  <span className="font-bold text-[#8B5CF6]">{meta.progresso}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden mb-5">
                  <div className="h-full bg-[#8B5CF6] rounded-full transition-all duration-500" style={{ width: `${meta.progresso}%` }}></div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    {meta.updates.length > 0 ? (
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-500" /> Ultima atualizacao: {meta.updates[0].data}</span>
                    ) : "Nenhuma atualizacao ainda"}
                  </div>
                  <button 
                    onClick={() => { setProgresso(meta.progresso); setSelectedMeta(meta.id); }}
                    className="text-xs font-medium text-[#8B5CF6] hover:underline"
                  >
                    Atualizar Agora
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
