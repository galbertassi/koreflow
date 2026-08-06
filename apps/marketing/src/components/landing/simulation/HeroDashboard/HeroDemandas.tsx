import { Play, Pause, CheckCircle2, Clock, Plus, Search, Filter, AlignLeft } from "lucide-react";
import { useSimulation } from "./SimulationContext";
import { HeroDemandModal } from "./HeroDemandModal";

export function HeroDemandas() {
  const { step } = useSimulation();

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar p-6 relative">
      <HeroDemandModal />
      <div className="w-full max-w-[1600px] mx-auto flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 shrink-0">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">Demandas</h1>
            <p className="text-slate-500 text-sm max-w-2xl">
              Registre e documente tudo o que você executa no seu dia. Nunca mais esqueça onde seu tempo foi investido.
            </p>
          </div>
          <button 
            className="flex items-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm shadow-[#8B5CF6]/20"
          >
            <Plus className="w-4 h-4" /> Nova Demanda
          </button>
        </div>

        {/* Active Demand Highlight */}
        <div className="mb-8 bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden shrink-0">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
          <div className="flex items-center gap-4 w-full">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Play className="w-5 h-5 text-emerald-600 fill-emerald-600 ml-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-emerald-600 mb-1 uppercase tracking-wider">Demanda em Andamento</p>
              <h3 className="text-lg font-semibold text-slate-900 truncate">Dashboard de Vendas</h3>
              <p className="text-sm text-slate-500 truncate">TechStart • Desenvolvimento</p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
            <div className="flex flex-col items-end mr-4">
              <span className="text-2xl font-bold text-slate-900 font-mono">00:14:32</span>
              <span className="text-xs text-slate-500">Tempo investido</span>
            </div>
            <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
              <Pause className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 shrink-0">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome, cliente ou categoria..." 
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm"
              readOnly
            />
          </div>
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />
            Filtros
          </button>
        </div>

        {/* Demands List */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1">
          <div className="overflow-x-auto h-full">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-[40%]">Demanda</th>
                  <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tempo</th>
                  <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-4 px-5">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase">Design UI/UX</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">Landing Page Nova</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-sm text-slate-500">Acme Corp</td>
                  <td className="py-4 px-5">
                    <span className="inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">Planejado</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold flex items-center gap-1.5 w-fit">
                      <Clock className="w-3 h-3" /> Pendente
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700 font-mono">00:00:00</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors">
                      <Play className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-4 px-5">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase">Marketing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">Campanha Ads</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-sm text-slate-500">TechStart</td>
                  <td className="py-4 px-5">
                    <span className="inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-600">Extra</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[11px] font-semibold flex items-center gap-1.5 w-fit">
                      <Pause className="w-3 h-3" /> Pausada
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700 font-mono">02:15:00</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors">
                      <Play className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
