"use client";

import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/hooks/use-store";
import { Bell, Calendar as CalendarIcon, ChevronDown, Clock, ChevronLeft, ChevronRight, PlusCircle, Printer, Download } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bot, Check, X, Trash2, ArrowUpRight } from "lucide-react";


export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    planejamentos, 
    configuracoes,
    appNotificacoes,
    welcomeEnviado,
    setWelcomeEnviado,
    addNotificacao,
    marcarNotificacaoComoLida,
    limparNotificacoes
  } = useStore();
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
  const calendarRef = useRef<HTMLDivElement>(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [isPlanMenuOpen, setIsPlanMenuOpen] = useState(false);
  const planMenuRef = useRef<HTMLDivElement>(null);
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = appNotificacoes?.filter(n => !n.lida).length || 0;

  useEffect(() => {
    if (!welcomeEnviado && configuracoes?.nome && configuracoes.nome !== "Carregando...") {
      setWelcomeEnviado(true);
      addNotificacao({
        titulo: "Bem-vindo ao Kore Flow! 🚀",
        mensagem: "Seu plano Free está ativo. Você tem limite de 10 demandas e 10 horas de uso gratuitas para testar nossa plataforma.",
        tipo: "Info"
      });
    }
  }, [welcomeEnviado, configuracoes?.nome, setWelcomeEnviado, addNotificacao]);

  const { companyPlan, companyUsage, openUpgradeModal } = useStore();

  useEffect(() => {
    if (companyPlan === "Free") {
      const demandsRemaining = 10 - (companyUsage?.demandsCreated || 0);
      const minutesRemaining = 600 - (companyUsage?.minutesUsed || 0);
      const hoursRemaining = (minutesRemaining / 60).toFixed(1);

      const notifDemandsKey = `kore_notif_demands_${companyUsage?.demandsCreated}`;
      if (demandsRemaining <= 3 && demandsRemaining > 0 && !localStorage.getItem(notifDemandsKey)) {
        localStorage.setItem(notifDemandsKey, "true");
        addNotificacao({
          titulo: "Atenção ao limite de demandas",
          mensagem: `Você possui apenas ${demandsRemaining} demandas restantes no plano Free. Faça o upgrade para continuar organizando seus projetos sem interrupções!`,
          tipo: "Aviso"
        });
      }

      const minutesThreshold = Math.floor(minutesRemaining / 60) * 60; // Notifica a cada hora que abaixa
      const notifMinutesKey = `kore_notif_mins_${minutesThreshold}`;
      if (minutesRemaining <= 180 && minutesRemaining > 0 && !localStorage.getItem(notifMinutesKey)) {
        localStorage.setItem(notifMinutesKey, "true");
        addNotificacao({
          titulo: "Limite de tempo próximo",
          mensagem: `Restam aproximadamente ${hoursRemaining} horas de uso no seu plano Free. Faça o upgrade agora para evitar bloqueios.`,
          tipo: "Aviso"
        });
      }
    }
  }, [companyPlan, companyUsage, addNotificacao]);

  useEffect(() => {
    const handleNotifClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) document.addEventListener("mousedown", handleNotifClickOutside);
    return () => document.removeEventListener("mousedown", handleNotifClickOutside);
  }, [isNotifOpen]);

  useEffect(() => {
    const handleCalendarClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    if (isCalendarOpen) document.addEventListener("mousedown", handleCalendarClickOutside);
    return () => document.removeEventListener("mousedown", handleCalendarClickOutside);
  }, [isCalendarOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (planMenuRef.current && !planMenuRef.current.contains(event.target as Node)) {
        setIsPlanMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
  const days = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

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
        {/* Notificações */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative w-12 h-12 flex items-center justify-center rounded-[18px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-border/50 hover:bg-secondary/50 transition-colors shrink-0 ${isNotifOpen ? "bg-secondary text-[#8B5CF6]" : "bg-white text-sidebar-foreground/80 hover:text-[#8B5CF6]"}`}
          >
            <Bell className="w-5 h-5" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-border overflow-hidden z-50 flex flex-col">
              <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">Notificações</h3>
                  {unreadCount > 0 && (
                    <span className="bg-[#8B5CF6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {appNotificacoes?.length > 0 && (
                  <button 
                    onClick={() => limparNotificacoes()}
                    className="text-[11px] font-medium text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Limpar
                  </button>
                )}
              </div>
              
              <div className="max-h-[350px] overflow-y-auto no-scrollbar flex flex-col">
                {(!appNotificacoes || appNotificacoes.length === 0) ? (
                  <div className="p-6 text-center flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
                      <Bell className="w-4 h-4 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground">Nenhuma notificação por aqui.</p>
                  </div>
                ) : (
                  appNotificacoes.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-4 border-b border-border/50 last:border-0 relative group transition-colors ${!notif.lida ? "bg-[#8B5CF6]/5" : "hover:bg-secondary/30"}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-1.5">
                          {!notif.lida && <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] shrink-0" />}
                          <h4 className={`text-sm font-semibold ${notif.tipo === 'Urgente' ? 'text-red-600' : notif.tipo === 'Aviso' ? 'text-amber-600' : 'text-foreground'}`}>
                            {notif.titulo}
                          </h4>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                          {formatDistanceToNow(new Date(notif.data), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground/90 mt-1 leading-relaxed pl-3 border-l-2 border-transparent">
                        {notif.mensagem}
                      </p>
                      {notif.actionUrl && (
                        <div className="mt-3 pl-3">
                          <a 
                            href={notif.actionUrl}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Ver detalhes <ArrowUpRight className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      
                      {!notif.lida && (
                        <button 
                          onClick={() => {
                            marcarNotificacaoComoLida(notif.id);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#8B5CF6]"
                          title="Marcar como lida"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
        <div className="relative" ref={calendarRef}>
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
                    className={`h-9 rounded-lg text-sm flex items-center justify-center transition-colors ${!d ? "" :
                        isToday(d) ? "bg-[#8B5CF6] text-white font-bold shadow-md" :
                          "hover:bg-secondary text-foreground"
                      }`}
                  >
                    {d || ""}
                  </button>
                ))}
              </div>



              <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Horário Atual</span>
                <span className="text-sm font-bold text-[#8B5CF6]">{format(time, "HH:mm:ss")}</span>
              </div>
            </div>
          )}
        </div>


      </div>
    </header>
  );
}






