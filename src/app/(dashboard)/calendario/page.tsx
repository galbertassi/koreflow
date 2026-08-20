"use client";

import { useState, useEffect, useRef } from "react";
import { useStore, Evento } from "@/hooks/use-store";
import { ChevronLeft, ChevronRight, Calendar, Plus, Bell, Clock, Trash2, X } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, addMonths, subMonths, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { eventos, addEvento, deleteEvento } = useStore();
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // O fechamento clicando fora agora usa o overlay (div com inset-0)
  
  const [novoEvento, setNovoEvento] = useState({
    titulo: "",
    data: format(new Date(), "yyyy-MM-dd"),
    hora: "12:00",
    tipo: "Lembrete" as "Reuniao" | "Lembrete" | "Entrega",
    notificacao: true,
    alarme: true
  });

  const handleAdd = () => {
    if (!novoEvento.titulo.trim()) return;
    const { notificacao, alarme, ...eventoParaSalvar } = novoEvento;
    addEvento(eventoParaSalvar);
    setNovoEvento({ titulo: "", data: format(new Date(), "yyyy-MM-dd"), hora: "12:00", tipo: "Lembrete", notificacao: true, alarme: true });
    setShowForm(false);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendário</h1>
          <p className="text-sm text-muted-foreground mt-1">Visualize seus eventos, prazos e entregas ao longo do mês.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white rounded-xl border border-border/50 p-1">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold px-3 min-w-[130px] text-center capitalize">
              {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </span>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Novo Evento
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-border/50 overflow-hidden flex flex-col">
        {/* Week header */}
        <div className="grid grid-cols-7 border-b border-border/50">
          {weekDays.map((day) => (
            <div key={day} className="py-3 text-center text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 flex-1">
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="border-b border-r border-border/30 bg-secondary/20" />
          ))}
          {days.map((day) => {
            const dayOfWeek = getDay(day);
            const isLastCol = dayOfWeek === 6;
            
            const dayStr = format(day, "yyyy-MM-dd");
            const dayEventos = eventos?.filter(e => e.data === dayStr) || [];

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[110px] border-b border-r border-border/30 p-2 flex flex-col ${!isSameMonth(day, currentDate) ? "bg-secondary/10" : ""} ${isLastCol ? "border-r-0" : ""}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium ${isToday(day) ? "bg-[#8B5CF6] text-white" : "text-foreground"}`}>
                    {format(day, "d")}
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[80px] no-scrollbar">
                  {dayEventos.map(e => (
                    <div key={e.id} className="group relative flex flex-col px-2 py-1.5 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-semibold text-[#8B5CF6] truncate pr-4">{e.titulo}</span>
                        <button onClick={() => deleteEvento(e.id)} className="absolute right-1 top-1.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {e.hora && (
                          <>
                            <Clock className="w-2.5 h-2.5 text-[#8B5CF6]/60" />
                            <span className="text-[10px] text-muted-foreground">{e.hora}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {(!eventos || eventos.length === 0) && (
          <div className="border-t border-border/50 py-4 px-6 flex items-center gap-3 bg-secondary/10">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhum evento registrado no calendário.
            </p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-opacity duration-200" onClick={() => setShowForm(false)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-border w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-150"
            ref={formRef}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary text-muted-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold mb-1">Novo Evento</h2>
            <p className="text-sm text-muted-foreground mb-6">Agende um compromisso ou lembrete.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-foreground mb-1.5">Título do Evento</label>
                <input 
                  type="text" 
                  value={novoEvento.titulo}
                  onChange={e => setNovoEvento({...novoEvento, titulo: e.target.value})}
                  placeholder="Ex: Reunião de Alinhamento" 
                  className="w-full px-3 py-2 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                />
              </div>
              
              <div>
                <label className="block text-[13px] font-semibold text-foreground mb-1.5">Data</label>
                <input 
                  type="date" 
                  value={novoEvento.data}
                  onChange={e => setNovoEvento({...novoEvento, data: e.target.value})}
                  style={{ colorScheme: "light" }}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 bg-white"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-border/50 cursor-pointer hover:bg-secondary/30 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={novoEvento.notificacao}
                    onChange={e => setNovoEvento({...novoEvento, notificacao: e.target.checked})}
                    className="w-4 h-4 rounded text-[#8B5CF6] focus:ring-[#8B5CF6]" 
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Notificar proximidade</span>
                    <span className="text-[11px] text-muted-foreground">Avisa quando o evento estiver se aproximando.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-border/50 cursor-pointer hover:bg-secondary/30 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={novoEvento.alarme}
                    onChange={e => setNovoEvento({...novoEvento, alarme: e.target.checked})}
                    className="w-4 h-4 rounded text-[#8B5CF6] focus:ring-[#8B5CF6]" 
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Alarme 1 dia antes</span>
                    <span className="text-[11px] text-muted-foreground">Emite um alerta visual 24h antes do evento.</span>
                  </div>
                </label>
              </div>

              <button 
                onClick={handleAdd}
                disabled={!novoEvento.titulo.trim()}
                className="w-full mt-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 disabled:hover:bg-[#8B5CF6] text-white rounded-xl text-sm font-medium transition-colors"
              >
                Salvar Evento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
