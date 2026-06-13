"use client";

import { useModal } from "@/hooks/use-modal";
import { useStore } from "@/hooks/use-store";
import { Plus, ClipboardCheck, Calendar, MoreHorizontal, ArrowRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const viewTabs = ["Ciclos", "Timeline"];

export default function PlanejamentoPage() {
  const { openModal } = useModal();
  const { planejamentos, deletePlanejamento } = useStore();
  const [view, setView] = useState("Ciclos");
  const router = useRouter();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Planejamento</h1>
          <p className="text-sm text-muted-foreground mt-1">Organize o calendário editorial e aprovação de clientes.</p>
        </div>
        <button onClick={() => openModal("CREATE_PLANNING")} className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Novo Ciclo
        </button>
      </div>

      <div className="flex items-center gap-1 mb-6 bg-white rounded-xl border border-border/50 p-1 w-fit">
        {viewTabs.map((tab) => (
          <button key={tab} onClick={() => setView(tab)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${view === tab ? "bg-[#8B5CF6]/10 text-[#8B5CF6]" : "text-muted-foreground hover:text-foreground"}`}>
            {tab === "Ciclos" ? <ClipboardCheck className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
            {tab}
          </button>
        ))}
      </div>

      {planejamentos.length === 0 ? (
        <div className="flex-1 bg-white rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/5 flex items-center justify-center mb-4">
            <ClipboardCheck className="w-8 h-8 text-[#8B5CF6]/50" />
          </div>
          <h3 className="text-base font-semibold mb-2">Nenhum ciclo de planejamento</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">Crie ciclos para organizar a producao e relatorios de clientes do mes.</p>
          <button onClick={() => openModal("CREATE_PLANNING")} className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Criar primeiro Ciclo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {planejamentos.map((pl) => (
            <div key={pl.id} onClick={() => router.push(`/planejamento/${pl.id}`)} className="text-left bg-white rounded-2xl border border-border/50 p-5 hover:border-[#8B5CF6]/30 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); deletePlanejamento(pl.id); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-[#8B5CF6] transition-colors" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{pl.nome}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {pl.inicio && pl.fim ? `${pl.inicio} a ${pl.fim}` : `Criado em ${pl.criadoEm}`}
              </p>
              <div className="pt-4 border-t border-border/50 flex justify-between items-center text-xs">
                <span className="font-medium text-muted-foreground">{pl.clientes.length} Clientes inclusos</span>
                <span className="px-2 py-1 bg-secondary rounded-md text-foreground font-medium">Editar Plano</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
