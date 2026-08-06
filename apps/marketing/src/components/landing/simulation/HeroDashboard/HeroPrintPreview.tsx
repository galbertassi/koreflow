import { Printer, Loader2, CheckCircle2 } from "lucide-react";
import { useSimulation } from "./SimulationContext";

export function HeroPrintPreview() {
  const { step } = useSimulation();

  const isOpen = ["click-printer", "view-printer"].includes(step);
  const isLoaded = step === "view-printer";

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-8 transition-all">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full max-h-[800px] animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header do Modal */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Visualização de Impressão</h3>
              <p className="text-sm text-slate-500">Relatório Geral de Demandas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-slate-100 text-slate-600 font-medium rounded-lg text-sm">
              Cancelar
            </button>
            <button className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg text-sm flex items-center gap-2 shadow-sm shadow-indigo-200">
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
          </div>
        </div>

        {/* Área da Página (Papel) */}
        <div className="flex-1 overflow-y-auto bg-slate-200 p-8 flex items-start justify-center custom-scrollbar">
          
          {/* Folha A4 Mock */}
          <div className="w-[600px] h-[850px] bg-white rounded shadow-md p-10 relative flex flex-col transition-all duration-500">
            
            {!isLoaded ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded z-10">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                <span className="text-sm font-medium text-slate-500">Gerando relatório...</span>
              </div>
            ) : (
              <div className="animate-in fade-in duration-700 delay-300 flex flex-col h-full">
                {/* Cabeçalho do Relatório */}
                <div className="flex justify-between items-end border-b-2 border-slate-900 pb-6 mb-8">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Relatório de Demandas</h1>
                    <p className="text-slate-500 mt-1">Gerado em 15 Jul 2026</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">KORE Flow</p>
                    <p className="text-sm text-slate-500">Administrativo</p>
                  </div>
                </div>

                {/* Corpo do Relatório Mock */}
                <div className="flex gap-6 mb-8">
                  <div className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-lg">
                    <p className="text-sm text-slate-500 font-medium mb-1">Total de Demandas</p>
                    <p className="text-3xl font-bold text-slate-900">4</p>
                  </div>
                  <div className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-lg">
                    <p className="text-sm text-slate-500 font-medium mb-1">Tempo Investido</p>
                    <p className="text-3xl font-bold text-slate-900">31h 30m</p>
                  </div>
                </div>

                <div className="flex-1 mt-4">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Demanda</th>
                        <th className="py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Responsável</th>
                        <th className="py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Prazo</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b border-slate-100">
                        <td className="py-4 font-medium text-slate-900">Revisão de Contratos</td>
                        <td className="py-4 text-slate-600">Gabriel A.</td>
                        <td className="py-4"><span className="text-blue-600 font-medium text-xs">Em Andamento</span></td>
                        <td className="py-4 text-right text-slate-500">15/07/2026</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-4 font-medium text-slate-900">Ajuste na Proposta Comercial</td>
                        <td className="py-4 text-slate-600">João Silva</td>
                        <td className="py-4"><span className="text-amber-600 font-medium text-xs">Pendente</span></td>
                        <td className="py-4 text-right text-slate-500">16/07/2026</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-4 font-medium text-slate-900">Apresentação Diretoria</td>
                        <td className="py-4 text-slate-600">Maria Souza</td>
                        <td className="py-4"><span className="text-emerald-600 font-medium text-xs">Concluída</span></td>
                        <td className="py-4 text-right text-slate-500">14/07/2026</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-4 font-medium text-slate-900">Follow-up Cliente VIP</td>
                        <td className="py-4 text-slate-600">Gabriel A.</td>
                        <td className="py-4"><span className="text-rose-600 font-medium text-xs">Atrasada</span></td>
                        <td className="py-4 text-right text-slate-500">12/07/2026</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div className="mt-16 flex justify-end">
                     <div className="text-center">
                       <div className="w-48 border-b border-slate-400 mb-2"></div>
                       <p className="text-xs text-slate-500 font-medium">Assinatura do Responsável</p>
                     </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>

        </div>

      </div>
    </div>
  );
}
