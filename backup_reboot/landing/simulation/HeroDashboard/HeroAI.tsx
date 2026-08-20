import { Sparkles, Send, User, LayoutGrid, ChevronRight, Briefcase, Plus, ClipboardCheck, Settings, Calendar, Bot } from "lucide-react";
import { useSimulation } from "./SimulationContext";

export function HeroAI() {
  const { step } = useSimulation();

  const isTyping = step === "type-ai";
  const isSent = step === "send-ai" || step === "ai-answering";
  const isAnswering = step === "ai-answering";

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar p-6">
      <div className="flex flex-col h-full max-w-3xl mx-auto w-full relative">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-border/40 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#8B5CF6]/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
              </div>
              <span className="text-sm font-semibold text-slate-900">KORE AI Produtividade</span>
            </div>
            <button className="text-xs font-medium text-slate-500 hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/10 bg-slate-200/50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Novas opções
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto mb-4 flex flex-col gap-6 pb-4 pr-1">
            {/* Initial empty state if not started typing */}
            {!isTyping && !isSent && (
              <div className="flex-1 flex flex-col justify-center animate-in fade-in">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 flex items-center justify-center mx-auto mb-4 rounded-3xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#7C3AED]/20 drop-shadow-sm">
                    <Sparkles className="w-10 h-10 text-[#8B5CF6]" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight mb-2 text-slate-900">KORE AI Produtividade</h1>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    Sua assistente integrada. Pergunte como realizar ações ou onde encontrar as funcionalidades do sistema.
                  </p>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {(isSent) && (
              <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex gap-3 flex-row-reverse self-end max-w-[85%]">
                  <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center bg-slate-200 text-slate-700">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-[#8B5CF6] text-white rounded-tr-sm text-sm">
                    Me mostre as demandas de hoje
                  </div>
                </div>
              </div>
            )}

            {isAnswering && (
              <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 delay-150 fill-mode-both">
                <div className="flex gap-3 self-start w-full">
                  <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-white shadow-md shadow-[#8B5CF6]/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 rounded-tl-sm flex-1 shadow-sm text-sm">
                    <p className="mb-2">Aqui estão suas demandas ativas de hoje, Gabriel:</p>
                    <ul className="list-disc pl-4 space-y-1 mb-3 text-slate-700">
                      <li><strong>Revisão de Contrato</strong> (Acme Corp) - <span className="text-emerald-600 font-medium">Concluída</span></li>
                      <li><strong>Layout do App de Entregas</strong> (Acme Corp) - <span className="text-blue-600 font-medium">Em Andamento</span></li>
                    </ul>
                    <p>O que você gostaria de fazer com essas demandas?</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-sm shrink-0 mt-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 text-sm bg-transparent flex items-center px-1 overflow-hidden h-[20px]">
            <span className="text-slate-900 whitespace-nowrap">
              {isTyping || isSent ? "Me mostre as demandas de hoje" : ""}
              <span className={`w-0.5 h-4 bg-[#8B5CF6] inline-block align-middle ml-0.5 ${step === "view-ai" || step === "type-ai" ? "animate-pulse" : "hidden"}`}></span>
            </span>
            {!isTyping && !isSent && step !== "view-ai" && <span className="text-slate-400">O que você deseja acessar ou configurar no sistema?</span>}
          </div>
          <button className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 shadow-md ${
            isTyping || isSent ? "bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] shadow-[#8B5CF6]/30" : "bg-slate-200 opacity-50"
          }`}>
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
