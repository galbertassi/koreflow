import { Bell, Clock, Printer, Download, Calendar as CalendarIcon, ChevronDown, Menu } from "lucide-react";
import { useSimulation } from "./SimulationContext";

export function HeroHeader() {
  const { step } = useSimulation();

  const isPrinter = ["click-printer", "view-printer"].includes(step);

  return (
    <header className="h-24 px-8 flex items-center justify-between border-b border-border bg-white sticky top-0 z-10 shrink-0 pointer-events-none select-none transition-all">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-2 rounded-lg bg-slate-100 text-slate-500">
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Bem-vindo(a), Gabriel.</h2>
          <p className="text-slate-500 text-sm mt-1 hidden sm:block">Planejamento, execução e entregas centralizados em um único fluxo.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Ações de Relatório */}
        <div className="hidden lg:flex items-center gap-3 mr-2">
          <button className={`relative w-[56px] h-[56px] flex items-center justify-center rounded-[18px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border transition-all duration-300 ${
            isPrinter 
              ? "bg-slate-100 border-slate-300 text-slate-700 scale-95" 
              : "bg-white border-slate-200 text-slate-500"
          }`}>
            <Printer className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Data e Hora */}
        <div className="relative">
          <button className="hidden xl:flex flex-col justify-center px-5 py-3 bg-white rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200 text-left">
            <span className="text-[12px] font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Data e Hora
            </span>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-[18px] w-[18px] text-slate-500" strokeWidth={1.5} />
                <span className="text-[15px] font-medium text-slate-800 tracking-tight flex items-center gap-2">
                  15 Jul 2026 
                  <span className="font-normal text-slate-300">|</span> 
                  16:00
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </button>
        </div>

        {/* Notificações */}
        <button className="relative w-[72px] h-[72px] flex items-center justify-center bg-white rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200 shrink-0">
          <div className="relative">
            <Bell className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#8B5CF6] rounded-full ring-[2.5px] ring-white translate-x-0.5 -translate-y-0.5"></span>
          </div>
        </button>
      </div>
    </header>
  );
}
