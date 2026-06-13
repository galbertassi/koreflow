"use client";

import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/hooks/use-store";
import { Bell, Calendar as CalendarIcon, ChevronDown, Clock, ChevronLeft, ChevronRight, PlusCircle, Printer, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { planejamentos, configuracoes } = useStore();
  const isPlanejamento = pathname.startsWith("/planejamento/");
  const plId = isPlanejamento ? pathname.split("/")[2] : null;
  const pl = plId ? planejamentos.find(p => p.id === plId) : null;

    // Mapear paths para títulos
  const getTitle = () => {
    switch (pathname) {
      case "/": return `Bem-vindo de volta, ${configuracoes?.nome?.split(" ")[0] || "Usuário"}. 👋`;
      case "/hoje": return "Seu dia";
      case "/tarefas": return "Tarefas";
      case "/projetos": return "Projetos";
      case "/metas": return "Metas";
      case "/calendario": return "Calendário";
      case "/notas": return "Notas";
      case "/ai": return "KORE AI";
      case "/configuracoes": return "Configurações";
      default: return "KORE FLOW";
    }
  };

  const getSubtitle = () => {
    if (pathname === "/") return "Acompanhe a operação da sua agência em tempo real.";
    return null;
  };
  const [time, setTime] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };
  
    const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const days = Array(firstDay).fill(null).concat(Array.from({length: daysInMonth}, (_, i) => i + 1));
  
  const isToday = (d: number | null) => d === time.getDate() && viewDate.getMonth() === time.getMonth() && viewDate.getFullYear() === time.getFullYear();


  return (
    <header className="print:hidden h-24 px-8 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{getTitle()}</h2>
        {getSubtitle() && (
          <p className="text-muted-foreground text-sm mt-1">{getSubtitle()}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
                {/* Ações de Relatório */}
        {["/", "/execucoes", "/projetos", "/planejamento"].some(p => pathname === p || pathname.startsWith(p + "/")) && (
          <div className="hidden md:flex items-center gap-3 mr-2">
            <button className="relative w-[56px] h-[56px] flex items-center justify-center bg-white dark:bg-sidebar rounded-[18px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-border/50 hover:bg-secondary/50 transition-colors shrink-0 text-sidebar-foreground/80 hover:text-[#8B5CF6]" title="Imprimir" onClick={() => window.print()}>
              <Printer className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button className="relative w-[56px] h-[56px] flex items-center justify-center bg-white dark:bg-sidebar rounded-[18px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-border/50 hover:bg-secondary/50 transition-colors shrink-0 text-sidebar-foreground/80 hover:text-[#8B5CF6]" title="Salvar Relatório" onClick={() => window.print()}>
              <Download className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        )}

        {/* Data e Hora */}
        <div className="relative">
          <button 
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="hidden md:flex flex-col justify-center px-5 py-3 bg-white rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-border/50 hover:bg-secondary/20 transition-colors text-left"
          >
            <span className="text-[12px] font-medium text-sidebar-foreground/60 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Data e Hora
            </span>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-[18px] w-[18px] text-sidebar-foreground/70" strokeWidth={1.5} />
                <span className="text-[15px] font-medium text-sidebar-foreground tracking-tight flex items-center gap-2">
                  {format(time, "dd MMM yyyy", { locale: ptBR })} 
                  <span className="font-normal text-sidebar-foreground/40">|</span> 
                  {format(time, "HH:mm")}
                </span>
              </div>
              <ChevronDown className={`h-4 w-4 text-sidebar-foreground/50 transition-transform ${isCalendarOpen ? "rotate-180" : ""}`} />
            </div>
          </button>

          {isCalendarOpen && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-80 bg-white rounded-2xl shadow-xl border border-border/50 p-4 z-50 cursor-default" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary"><ChevronLeft className="w-4 h-4" /></button>
                <span className="font-semibold capitalize text-sm">{format(viewDate, "MMMM yyyy", { locale: ptBR })}</span>
                <button onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary"><ChevronRight className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                  <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((d, i) => (
                  <button 
                    key={i} 
                    disabled={!d}
                    className={`h-9 rounded-lg text-sm flex items-center justify-center transition-colors ${
                      !d ? "" : 
                      isToday(d) ? "bg-[#8B5CF6] text-white font-bold shadow-md" : 
                      "hover:bg-secondary text-foreground"
                    }`}
                  >
                    {d || ""}
                  </button>
                ))}
              </div>
              
              

              <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Horário Atual</span>
                <span className="text-sm font-bold text-[#8B5CF6]">{format(time, "HH:mm:ss")}</span>
              </div>
            </div>
          )}
        </div>

        <button className="relative w-[72px] h-[72px] flex items-center justify-center bg-white dark:bg-sidebar rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-border/50 hover:bg-secondary/50 transition-colors shrink-0">
          <div className="relative">
            <Bell className="h-6 w-6 text-sidebar-foreground/80" strokeWidth={1.5} />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#8B5CF6] rounded-full ring-[2.5px] ring-white dark:ring-sidebar translate-x-0.5 -translate-y-0.5"></span>
          </div>
        </button>
      </div>
    </header>
  );
}






