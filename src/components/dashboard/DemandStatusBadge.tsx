"use client";

import { useState } from "react";
import { useStore } from "@/hooks/use-store";
import { ChevronDown } from "lucide-react";

export const DEMAND_STATUSES = ["PENDING", "IN_PROGRESS", "PAUSED", "REVIEW", "COMPLETED", "CANCELLED"];

export function DemandStatusBadge({ demand, optimisticUpdate, updateDemand }: { demand: any, optimisticUpdate: any, updateDemand: any }) {
  const [open, setOpen] = useState(false);
  const { configuracoes } = useStore();
  
  const mapDemandStatus = (status: any) => {
    if (typeof status !== 'string') return "Pendente";
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

  const etiquetas = (configuracoes && Array.isArray(configuracoes.etiquetas)) ? configuracoes.etiquetas : [];
  const etiqueta = etiquetas.find(e => e && e.nome === mapDemandStatus(demand?.status)) || { cor: "#94a3b8" };
  const color = etiqueta?.cor || "#94a3b8";

  return (
    <div className={`relative inline-block text-left ${open ? 'z-50' : 'z-10'}`}>
      <button 
        onClick={() => setOpen(!open)} 
        style={{ backgroundColor: color, color: '#ffffff' }}
        className="flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors w-full min-w-[120px] shadow-sm hover:opacity-90"
      >
        {mapDemandStatus(demand?.status)}
        <ChevronDown className="w-3 h-3 ml-1" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 z-50 bg-white border border-border rounded-xl shadow-lg py-1 w-40">
            {etiquetas.map((etq) => {
              if (!etq) return null;
              const mapped = mapDemandStatus(demand?.status);
              const etqColor = etq.cor || "#94a3b8";
              return (
                <button
                  key={etq.nome}
                  onClick={async (e) => {
                    e.stopPropagation();
                    setOpen(false);
                    optimisticUpdate(demand.id, { status: etq.nome });
                    await updateDemand(demand.id, { status: etq.nome });
                  }}
                  className="w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-secondary/50 transition-colors flex items-center gap-2 text-foreground"
                >
                  <span style={{ backgroundColor: etqColor }} className={`w-2 h-2 shrink-0 rounded-full ${etq.nome !== mapped ? 'opacity-30' : ''}`} />
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
