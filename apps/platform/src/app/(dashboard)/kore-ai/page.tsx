"use client";

import {
  Sparkles, Send, User, Calendar, Bot,
  Clock, Target, AlertTriangle, TrendingUp,
  LayoutGrid, ChevronRight, Briefcase, Plus,
  ClipboardCheck, Settings
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useStore } from "@/hooks/use-store";
import { useRouter } from "next/navigation";
import { PLANS } from "@/config/plans";

const SUGGESTIONS = [
  { icon: <LayoutGrid className="w-4 h-4" />, label: "Criar Nova Atividade" },
  { icon: <Briefcase className="w-4 h-4" />, label: "Criar Novo Projeto" },
  { icon: <ClipboardCheck className="w-4 h-4" />, label: "Ver Planejamento" },
  { icon: <Calendar className="w-4 h-4" />, label: "Acessar Calendário" },
  { icon: <Settings className="w-4 h-4" />, label: "Ajustar Configurações" },
];

function generateAIResponse(text: string, userName: string): string {
  const t = text.toLowerCase();

  if (t.includes("atividade") || t.includes("nova") || t.includes("criar")) {
    return `## 📝 Nova Atividade
    
Para registrar uma nova tarefa ou ação importante, você pode acessar a área de **Execuções** no menu lateral ou usar o atalho de Ações Rápidas no seu Dashboard.

💡 **Dica:** Descreva bem a atividade e defina uma prioridade para não perder nada importante do radar.`;
  }

  if (t.includes("projeto") || t.includes("novo projeto")) {
    return `## 📁 Novo Projeto
    
Criar um projeto ajuda a agrupar várias execuções em torno de um objetivo maior. 

Você pode iniciar um novo projeto acessando a aba **Projetos** e clicando em "Novo Projeto".

💡 **Dica:** Atribua clientes aos seus projetos para facilitar a análise de tempo investido e rentabilidade depois.`;
  }

  if (t.includes("planejamento") || t.includes("plan")) {
    return `## 🎯 Planejamento
    
O Planejamento Estratégico é onde você define o ritmo do seu ciclo. 

Acesse a tela de **Planejamento** para visualizar metas globais e estruturar os próximos passos da sua operação. O KORE Flow te ajuda a manter o foco no que realmente importa.`;
  }

  if (t.includes("calendário") || t.includes("calendario") || t.includes("prazo") || t.includes("mês") || t.includes("mes")) {
    return `## 📅 Calendário e Prazos
    
Você pode visualizar todos os seus prazos e entregas do mês acessando a aba **Calendário**.

Isso ajuda a prever gargalos na sua semana e negociar prazos com seus clientes antes que as urgências apareçam.`;
  }

  if (t.includes("configuraç") || t.includes("configurac") || t.includes("ajust") || t.includes("perfil")) {
    return `## ⚙️ Configurações Gerais
    
Para ajustar os parâmetros da sua agência, perfil ou sistema, clique em **Configurações**.

Lá você pode personalizar as preferências da sua conta para que o KORE Flow se adapte perfeitamente à sua rotina.`;
  }

  const respostas = [
    `Olá, ${userName}! Sou sua assistente no KORE FLOW. Como posso te ajudar a navegar pelo sistema hoje?`,
    `Tudo certo, ${userName}. Estou aqui para facilitar sua vida. Escolha uma das opções ou me pergunte como acessar alguma função do sistema!`,
  ];
  return respostas[Math.floor(Math.random() * respostas.length)];
}

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("## ")) return <h2 key={i} className="text-base font-bold text-foreground mt-4 mb-2">{line.replace("## ", "")}</h2>;
    if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-semibold text-foreground mt-3 mb-1">{line.replace("### ", "")}</h3>;
    if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-sm text-foreground">{line.replace(/\*\*/g, "")}</p>;
    if (line.startsWith("> ")) return <blockquote key={i} className="border-l-2 border-[#8B5CF6]/50 pl-3 text-sm text-muted-foreground italic my-1">{line.replace("> ", "")}</blockquote>;
    if (line.startsWith("- ")) return <li key={i} className="text-sm text-foreground ml-4 list-disc">{line.replace("- ", "").replace(/\*\*(.+?)\*\*/g, "$1")}</li>;
    if (line.startsWith("---")) return <hr key={i} className="my-3 border-border/40" />;
    if (line.trim() === "") return <div key={i} className="h-1" />;
    const parsed = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return <p key={i} className="text-sm text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: parsed }} />;
  });
}

export default function KoreAiPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { configuracoes, companyPlan, openUpgradeModal } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    if (PLANS[companyPlan].aiFeatures === "Limited" && messages.length >= 2) {
      openUpgradeModal();
      return;
    }

    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAIResponse(text, configuracoes?.nome || "Usuário");
      setMessages(prev => [...prev, { role: "ai", content: response }]);
      setIsTyping(false);
    }, 1400);
  };

  const ACTION_BUTTONS = [
    { icon: <LayoutGrid className="w-3.5 h-3.5" />, label: "Acessar Demandas", href: "/demandas", color: "text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20 hover:bg-[#8B5CF6]/20" },
    { icon: <TrendingUp className="w-3.5 h-3.5" />, label: "Ver Relatórios Completos", href: "/relatorios", color: "text-blue-600 bg-blue-500/10 border-blue-200 hover:bg-blue-500/20" },
  ];

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full relative">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center mx-auto mb-0 drop-shadow-2xl">
              <img src="/kore_ai.png" alt="KORE AI" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">KORE AI Produtividade</h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Sua assistente integrada. Pergunte como realizar ações ou onde encontrar as funcionalidades do sistema.
            </p>
          </div>

          <div className="flex flex-col gap-3 mb-4 max-w-md mx-auto w-full">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s.label)}
                className="text-left p-3.5 bg-white border border-border/50 rounded-xl text-sm text-muted-foreground hover:border-[#8B5CF6]/40 hover:text-foreground hover:bg-[#8B5CF6]/5 transition-all group flex items-center gap-3 w-full"
              >
                <span className="w-7 h-7 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6] group-hover:bg-[#8B5CF6] group-hover:text-white transition-colors shrink-0">
                  {s.icon}
                </span>
                <span className="leading-snug">{s.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground/60 mt-4">
            <Bot className="w-3 h-3" /> Especialista em Produtividade e Gestão de Tempo
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-border/40 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#8B5CF6]/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
              </div>
              <span className="text-sm font-semibold">KORE AI Produtividade</span>
            </div>
            <button
              onClick={() => setMessages([])}
              className="text-xs font-medium text-muted-foreground hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/10 bg-secondary/50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Novas opções
            </button>
          </div>
          <div className="flex-1 overflow-y-auto mb-4 flex flex-col gap-6 pb-4 pr-1">
            {messages.map((msg, i) => {
            const isAi = msg.role === "ai";
            const isLast = isAi && i === messages.length - 1;
            return (
              <div key={i} className="flex flex-col gap-3">
                <div className={`flex gap-3 ${!isAi ? "flex-row-reverse self-end max-w-[85%]" : "self-start w-full"}`}>
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${isAi ? "bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-white shadow-md shadow-[#8B5CF6]/30" : "bg-secondary text-foreground"}`}>
                    {isAi ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl ${isAi ? "bg-white border border-border/50 text-foreground rounded-tl-sm flex-1 shadow-sm" : "bg-[#8B5CF6] text-white rounded-tr-sm text-sm"}`}>
                    {isAi ? <div className="space-y-0.5">{renderMarkdown(msg.content)}</div> : msg.content}
                  </div>
                </div>

                {isLast && !isTyping && (
                  <div className="ml-11">
                    <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-widest mb-2">Ações sugeridas</p>
                    <div className="flex flex-wrap gap-2">
                      {ACTION_BUTTONS.map((btn, j) => (
                        <a
                          key={j}
                          href={btn.href}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${btn.color}`}
                        >
                          {btn.icon}
                          {btn.label}
                          <ChevronRight className="w-3 h-3 opacity-50" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 self-start items-center">
              <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center shadow-md shadow-[#8B5CF6]/30">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="px-4 py-4 rounded-2xl bg-white border border-border/50 flex gap-1 items-center rounded-tl-sm shadow-sm">
                <div className="w-1.5 h-1.5 bg-[#8B5CF6]/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-[#8B5CF6]/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-[#8B5CF6]/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 bg-white border border-border/50 rounded-2xl p-3 shadow-sm shrink-0 mt-4">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          placeholder="O que você deseja acessar ou configurar no sistema?"
          className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground/50 px-1"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim()}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] hover:opacity-90 disabled:opacity-40 flex items-center justify-center transition-all shrink-0 shadow-md shadow-[#8B5CF6]/30"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
