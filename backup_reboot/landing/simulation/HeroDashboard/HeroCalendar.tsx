import { Calendar, ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";

export function HeroCalendar() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar p-6">
      <div className="w-full max-w-[1600px] mx-auto flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 shrink-0">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">Calendário</h1>
            <p className="text-slate-500 text-sm max-w-2xl">
              Visualize suas demandas e projetos de forma cronológica.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1">
              <button className="px-4 py-1.5 text-sm font-medium rounded-lg bg-slate-100 text-slate-900">
                Semana
              </button>
              <button className="px-4 py-1.5 text-sm font-medium rounded-lg text-slate-500 hover:text-slate-900">
                Mês
              </button>
            </div>
            <button className="flex items-center gap-2 bg-[#8B5CF6] text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm shadow-[#8B5CF6]/20">
              <Plus className="w-4 h-4" /> Nova Demanda
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-slate-900">Julho 2026</h2>
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500"><ChevronLeft className="w-5 h-5" /></button>
              <button className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

        {/* Calendar Grid (Week View Mock) */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="grid grid-cols-7 border-b border-slate-200 shrink-0">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, i) => (
              <div key={day} className={`p-3 text-center border-r border-slate-200 last:border-0 ${i === 3 ? 'bg-indigo-50/50' : ''}`}>
                <div className="text-xs font-medium text-slate-500 uppercase">{day}</div>
                <div className={`text-xl mt-1 ${i === 3 ? 'font-bold text-[#8B5CF6]' : 'font-medium text-slate-700'}`}>
                  {12 + i}
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={`border-r border-slate-200 last:border-0 p-2 ${i === 3 ? 'bg-indigo-50/30' : ''}`}>
                {i === 2 && (
                  <div className="p-2 mb-2 rounded-lg bg-orange-50 border border-orange-100 relative group cursor-pointer hover:shadow-md transition-all">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400 rounded-l-lg"></div>
                    <div className="text-[10px] font-semibold text-orange-600 mb-0.5">14:00</div>
                    <div className="text-xs font-medium text-slate-900 leading-tight">Reunião de Alinhamento</div>
                  </div>
                )}
                {i === 3 && (
                  <>
                    <div className="p-2 mb-2 rounded-lg bg-emerald-50 border border-emerald-100 relative group cursor-pointer hover:shadow-md transition-all">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 rounded-l-lg"></div>
                      <div className="text-[10px] font-semibold text-emerald-600 mb-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Concluída
                      </div>
                      <div className="text-xs font-medium text-slate-900 leading-tight">Revisão de Contrato</div>
                    </div>
                    <div className="p-2 mb-2 rounded-lg bg-blue-50 border border-blue-100 relative group cursor-pointer hover:shadow-md transition-all">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-l-lg"></div>
                      <div className="text-[10px] font-semibold text-blue-600 mb-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 16:00
                      </div>
                      <div className="text-xs font-medium text-slate-900 leading-tight">Layout do App</div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
