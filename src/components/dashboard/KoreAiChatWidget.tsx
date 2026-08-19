"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, Send, User, Calendar, Zap, Target, 
  ChevronRight, TrendingUp, BarChart2, CheckSquare, 
  Folder, PauseCircle, X, Maximize2, RotateCcw, ListChecks, Save
} from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal";

interface StoreData {
  execucoes: any[];
  projetos: any[];
  planejamentos: any[];
  metas: any[];
  eventos: any[];
  configuracoes: any;
}

interface AIResponse {
  text: string;
  actions: string[];
}

function generateAIResponse(text: string, userName: string, store: StoreData): AIResponse {
  const t = text.toLowerCase();
  const { execucoes, projetos, planejamentos, metas, eventos } = store;
  let actions: string[] = [];

  const MESES_NOMES: Record<string, number> = {
    janeiro: 0, fevereiro: 1, março: 2, marco: 2, abril: 3, maio: 4,
    junho: 5, julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11
  };

  if (t.includes("parar o tempo") || t.includes("parar timer") || t.includes("parar o timer")) {
    const active = execucoes.find(e => e.timerStart);
    if (active) {
      actions.push("STOP_TIMER");
      return {
        text: `## ⏱️ Timer em Execução\n\nIdentifiquei que a demanda **${active.titulo}** está com o timer ativo. Clique no botão abaixo para parar o tempo agora mesmo.`,
        actions
      };
    } else {
      actions.push("GOTO_DEMANDS");
      return {
        text: `Nenhum timer está rodando no momento, ${userName}. Quer ir para a Central de Demandas para iniciar um?`,
        actions
      };
    }
  }

  if (t.includes("registrar tempo") || t.includes("iniciar timer")) {
    actions.push("GOTO_DEMANDS");
    return {
      text: `## ⏱️ Controle de Tempo\n\nPara iniciar ou registrar tempo, acesse a Central de Demandas. Lá você pode dar *play* em qualquer demanda pendente ou "Em Produção".`,
      actions
    };
  }

  if (t.includes("priorizar") || t.includes("prioridade")) {
    const altasPrioridades = execucoes.filter(e => e.prioridade === "Alta" && e.status !== "Concluída");
    const emAtraso = execucoes.filter(e => {
      if (e.status === "Concluída") return false;
      if (!e.entrega) return false;
      const [dia, mes, ano] = e.entrega.split("/");
      const dataEntrega = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      return dataEntrega < new Date();
    });

    if (altasPrioridades.length === 0 && emAtraso.length === 0) {
      actions.push("GOTO_DEMANDS", "CREATE_DEMAND");
      return {
        text: `## 🎯 Prioridades de Hoje\n\nExcelente notícia, ${userName}! Você não tem demandas em atraso nem com prioridade Alta no momento.\n\nSugiro que você pegue alguma demanda pendente ou crie novas tarefas.`,
        actions
      };
    }

    let resposta = `## 🎯 Prioridades de Hoje para ${userName}\n\n`;
    if (emAtraso.length > 0) {
      resposta += `### 🚨 Demandas em Atraso\n`;
      resposta += emAtraso.map(e => `- **${e.titulo}** (Era para ${e.entrega})`).join("\n") + "\n\n";
    }
    if (altasPrioridades.length > 0) {
      resposta += `### 🔥 Alta Prioridade\n`;
      resposta += altasPrioridades.map(e => `- **${e.titulo}** (Status: ${e.status})`).join("\n") + "\n\n";
    }
    actions.push("GOTO_DEMANDS");
    return { text: resposta, actions };
  }

  if (t.includes("relatório") || t.includes("resumo") || t.includes("produtividade geral")) {
    const totalConcluidas = execucoes.filter(e => e.status === "Concluída").length;
    const totalPendentes = execucoes.filter(e => e.status !== "Concluída").length;
    actions.push("CREATE_DEMAND", "GOTO_REPORTS");
    return {
      text: `## 📊 Seu Relatório de Produtividade\n\n- **Demandas Concluídas:** ${totalConcluidas}\n- **Demandas Pendentes:** ${totalPendentes}\n- **Projetos Ativos:** ${projetos.length}`,
      actions
    };
  }

  actions.push("CREATE_DEMAND", "CREATE_PROJECT");
  return {
    text: `Olá, ${userName}! Sou a KORE AI.\n\nComo posso te ajudar agora?\n\n- **Prioridades do dia**\n- **Demandas em atraso**\n- **Relatórios de produtividade**`,
    actions
  };
}

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("## ")) return <h2 key={i} className="text-sm font-bold text-foreground mt-2 mb-1">{line.replace("## ", "")}</h2>;
    if (line.startsWith("### ")) return <h3 key={i} className="text-xs font-semibold text-foreground mt-2 mb-1">{line.replace("### ", "")}</h3>;
    if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-xs text-foreground">{line.replace(/\*\*/g, "")}</p>;
    if (line.startsWith("- ")) return <li key={i} className="text-xs text-foreground ml-3 list-disc">{line.replace("- ", "").replace(/\*\*(.+?)\*\*/g, "$1")}</li>;
    if (line.trim() === "") return <div key={i} className="h-1" />;
    const parsed = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return <p key={i} className="text-xs text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: parsed }} />;
  });
}

export function KoreAiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string; actions?: string[] }[]>([
    { role: "ai", content: "Olá! Sou a **KORE AI**. Como posso ajudar a orquestrar seu dia?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  const { configuracoes, execucoes, updateExecucao, projetos, planejamentos, metas, eventos } = useStore();
  const { openModal } = useModal();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAIResponse(text, configuracoes?.nome || "Usuário", { execucoes, projetos, planejamentos, metas, eventos, configuracoes });
      setMessages(prev => [...prev, { role: "ai", content: response.text, actions: response.actions }]);
      setIsTyping(false);
    }, 1000);
  };

  const quickSuggestions = [
    "O que devo priorizar hoje?",
    "Relatório de produtividade",
    "Ver demandas em atraso"
  ];

  return (
    <div className="print:hidden fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Pop-up Chat Window */}
      {isOpen && (
        <div className="w-[360px] md:w-[400px] h-[520px] bg-white border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white p-3.5 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm overflow-hidden p-0.5">
                <img src="/kore_ai.png" alt="KORE AI" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  KORE AI
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </h3>
                <p className="text-[10px] text-white/80">Assistente Inteligente</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => { setIsOpen(false); router.push("/kore-ai"); }}
                title="Abrir em tela cheia" 
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                title="Fechar chat"
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((msg, i) => {
              const isAi = msg.role === "ai";
              return (
                <div key={i} className="space-y-2">
                  <div className={`flex gap-2 ${!isAi ? "flex-row-reverse self-end max-w-[85%]" : "self-start w-full"}`}>
                    <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs ${isAi ? "bg-[#8B5CF6] text-white shadow-sm" : "bg-slate-200 text-slate-700"}`}>
                      {isAi ? <Sparkles className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-xs ${isAi ? "bg-white border border-border text-foreground shadow-sm rounded-tl-none flex-1" : "bg-[#8B5CF6] text-white rounded-tr-none"}`}>
                      {isAi ? renderMarkdown(msg.content) : msg.content}
                    </div>
                  </div>

                  {isAi && msg.actions && msg.actions.length > 0 && !isTyping && (
                    <div className="ml-9 flex flex-wrap gap-1.5">
                      {msg.actions.includes("CREATE_DEMAND") && (
                        <button onClick={() => { openModal("CREATE_EXECUTION"); setIsOpen(false); }} className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border border-[#8B5CF6]/30 text-[#8B5CF6] bg-[#8B5CF6]/5 hover:bg-[#8B5CF6] hover:text-white transition-all">
                          <CheckSquare className="w-3 h-3" /> Nova Demanda
                        </button>
                      )}
                      {msg.actions.includes("CREATE_PROJECT") && (
                        <button onClick={() => { openModal("CREATE_PROJECT"); setIsOpen(false); }} className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border border-emerald-500/30 text-emerald-600 bg-emerald-50 hover:bg-emerald-500 hover:text-white transition-all">
                          <Folder className="w-3 h-3" /> Novo Projeto
                        </button>
                      )}
                      {msg.actions.includes("GOTO_DEMANDS") && (
                        <button onClick={() => { router.push("/execucoes"); setIsOpen(false); }} className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border border-blue-500/30 text-blue-600 bg-blue-50 hover:bg-blue-500 hover:text-white transition-all">
                          Central de Demandas <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="px-3 py-2 rounded-2xl bg-white border border-border flex gap-1 items-center shadow-sm">
                  <div className="w-1.5 h-1.5 bg-[#8B5CF6]/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-[#8B5CF6]/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-[#8B5CF6]/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-1.5 bg-white border-t border-border/40 flex items-center gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
            {quickSuggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="whitespace-nowrap px-2.5 py-1 bg-secondary/70 hover:bg-[#8B5CF6]/10 hover:text-[#8B5CF6] text-[11px] text-muted-foreground font-medium rounded-full transition-colors shrink-0"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-border flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder="Digite sua mensagem para a KORE AI..."
              className="flex-1 text-xs bg-secondary/40 border border-border/50 rounded-xl px-3 py-2 focus:outline-none focus:border-[#8B5CF6] placeholder:text-muted-foreground/60"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim()}
              className="w-8 h-8 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Robot Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="group flex flex-col items-center gap-1.5 cursor-pointer hover:-translate-y-1 transition-transform animate-bounce"
          style={{ animationDuration: '3s' }}
          title="Abrir Chat KORE AI"
        >
          <div className="w-24 h-24 md:w-28 md:h-28 flex items-center justify-center relative drop-shadow-2xl">
            <img src="/kore_ai.png" alt="KORE AI" className="w-full h-full object-contain relative z-10" />
          </div>
          <span className="bg-foreground text-background text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 tracking-wider">
            KORE AI
          </span>
        </button>
      )}
    </div>
  );
}
