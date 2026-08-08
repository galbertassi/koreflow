import { useSimulation } from "./SimulationContext";

export function HeroDemandModal() {
  const { step } = useSimulation();

  const isVisible = [
    "open-demand-modal", "fill-demand", "save-demand", "close-demand"
  ].includes(step);

  if (!isVisible) return null;

  const isFilled = ["fill-demand", "save-demand", "close-demand"].includes(step);

  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Criar Nova Demanda</h2>
        
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Título da Demanda *</label>
            <div className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm h-[38px] flex items-center overflow-hidden">
              <span className="text-slate-900 whitespace-nowrap">
                {isFilled ? "Layout do App de Entregas" : ""}
                <span className={`w-0.5 h-4 bg-[#8B5CF6] inline-block align-middle ml-0.5 ${step === "fill-demand" ? "animate-pulse" : "hidden"}`}></span>
              </span>
              {!isFilled && step !== "fill-demand" && <span className="text-slate-400">Ex: Landing Page Nova</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Cliente</label>
              <div className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-400 h-[38px] flex items-center">
                Acme Corp
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Categoria</label>
              <div className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-400 h-[38px] flex items-center">
                Design UI/UX
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Tipo</label>
              <div className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 h-[38px] flex items-center">
                Planejado
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Prioridade</label>
              <div className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 h-[38px] flex items-center">
                Alta
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900">
              Cancelar
            </button>
            <button className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-colors shadow-sm ${
              step === "save-demand" ? "bg-[#7C3AED]" : "bg-[#8B5CF6]"
            }`}>
              Criar Demanda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
