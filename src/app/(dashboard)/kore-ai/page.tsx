"use client";

import {
  Sparkles, Send, User, Calendar, BookOpen, Zap, Target,
  PlusCircle, Save, LayoutGrid, ListChecks, ChevronRight,
  Megaphone, TrendingUp, Video, Hash, Gift, CheckCircle2, BarChart2,
  CheckSquare, Folder, PauseCircle
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useStore } from "@/hooks/use-store";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal";

const getSuggestions = (personalidade: string) => {
  switch (personalidade) {
    case "Assistente Operacional (Focada em Tarefas)":
      return [
        { icon: <ListChecks className="w-4 h-4" />, label: "Listar todas as minhas demandas pendentes" },
        { icon: <Zap className="w-4 h-4" />, label: "Iniciar timer para uma nova demanda" },
        { icon: <Save className="w-4 h-4" />, label: "Registrar tempo na última demanda trabalhada" },
        { icon: <CheckCircle2 className="w-4 h-4" />, label: "Marcar demanda atual como concluída" },
      ];
    case "Consultora Estratégica (Focada em Planejamento)":
      return [
        { icon: <Calendar className="w-4 h-4" />, label: "Montar calendário estratégico de 30 dias" },
        { icon: <Megaphone className="w-4 h-4" />, label: "Criar funil de vendas para novo produto" },
        { icon: <Target className="w-4 h-4" />, label: "Identificar gargalos nos projetos em risco" },
        { icon: <TrendingUp className="w-4 h-4" />, label: "Traçar metas para o próximo mês" },
      ];
    case "Técnica e Analítica (Focada em Relatórios)":
      return [
        { icon: <BarChart2 className="w-4 h-4" />, label: "Gerar relatório completo de execuções" },
        { icon: <TrendingUp className="w-4 h-4" />, label: "Análise de tempo médio por demanda" },
        { icon: <ListChecks className="w-4 h-4" />, label: "Auditar demandas atrasadas ou sem etiqueta" },
        { icon: <Save className="w-4 h-4" />, label: "Exportar resumo de produtividade" },
      ];
    case "Híbrida (Extraordinária e Proativa)":
    default:
      return [
        { icon: <Zap className="w-4 h-4" />, label: "O que eu devo priorizar hoje?" },
        { icon: <Target className="w-4 h-4" />, label: "Quais demandas estão em risco?" },
        { icon: <TrendingUp className="w-4 h-4" />, label: "Gerar relatório de produtividade geral" },
        { icon: <Calendar className="w-4 h-4" />, label: "Planejar minha semana com base nas demandas" },
      ];
  }
};

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

  // Parar timer
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

  // Registrar tempo / Iniciar timer
  if (t.includes("registrar tempo") || t.includes("iniciar timer")) {
    actions.push("GOTO_DEMANDS");
    return {
      text: `## ⏱️ Controle de Tempo\n\nPara iniciar ou registrar tempo, acesse a Central de Demandas. Lá você pode dar *play* em qualquer demanda pendente ou "Em Produção".`,
      actions
    };
  }

  // Eventos agendados
  if (t.includes("event") || t.includes("agendad")) {
    const hoje = new Date();
    let mesFiltro = hoje.getMonth();
    let anoFiltro = hoje.getFullYear();
    let nomesMes = "";
    let isEspecifico = false;

    // Detect specific month name in the query
    for (const [nome, idx] of Object.entries(MESES_NOMES)) {
      if (t.includes(nome)) {
        mesFiltro = idx;
        isEspecifico = true;
        nomesMes = nome.charAt(0).toUpperCase() + nome.slice(1);
        // If the month is before current month, probably next year
        if (idx < hoje.getMonth()) anoFiltro = hoje.getFullYear() + 1;
        else anoFiltro = hoje.getFullYear();
        break;
      }
    }
    if (!isEspecifico) {
      nomesMes = hoje.toLocaleString("pt-BR", { month: "long" });
      nomesMes = nomesMes.charAt(0).toUpperCase() + nomesMes.slice(1);
    }

    const eventosMes = (eventos || []).filter(ev => {
      try {
        const d = new Date(ev.data);
        return d.getMonth() === mesFiltro && d.getFullYear() === anoFiltro;
      } catch { return false; }
    });

    if (eventosMes.length === 0) {
      return { text: `## 📅 Eventos — ${nomesMes}/${anoFiltro}

Nenhum evento agendado para ${nomesMes}.

Use a página **Calendário** para criar novos eventos, ou diga "Agendar evento" e eu te ajudo!`, actions: [] };
    }

    const lista = eventosMes
      .sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .map((ev: any) => {
        const d = new Date(ev.data);
        const dia = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        const alarme = ev.alarme ? "🔔" : "";
        const notif = ev.notificacao ? "🔔" : "";
        return `- **${dia}** — ${ev.titulo} ${alarme}`;
      }).join("\\n");

    return { text: `## 📅 Eventos Agendados — ${nomesMes}/${anoFiltro}

**Total de eventos:** ${eventosMes.length}

---

${lista}

---

*Dados lidos diretamente da sua agenda no KORE FLOW.*`, actions: [] };
  }

  // O que eu devo priorizar hoje?
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
        text: `## 🎯 Prioridades de Hoje\n\nExcelente notícia, ${userName}! Você não tem demandas em atraso nem com prioridade Alta no momento.\n\nSugiro que você pegue alguma demanda com status "Aguardando" ou crie novas tarefas.`,
        actions
      };
    }

    let resposta = `## 🎯 Prioridades de Hoje para ${userName}\n\n`;
    if (emAtraso.length > 0) {
      resposta += `### 🚨 Demandas em Atraso (Máxima Urgência!)\n`;
      resposta += emAtraso.map(e => `- **${e.titulo}** (Era para ${e.entrega})`).join("\n") + "\n\n";
    }
    if (altasPrioridades.length > 0) {
      resposta += `### 🔥 Alta Prioridade\n`;
      resposta += altasPrioridades.map(e => `- **${e.titulo}** (Status: ${e.status})`).join("\n") + "\n\n";
    }
    
    resposta += `\n\n--- \n*Dica da I.A:* Comece pelas que estão em atraso e depois vá para as de alta prioridade. Se precisar, inicie o timer na Central de Demandas!`;
    actions.push("GOTO_DEMANDS");
    return { text: resposta, actions };
  }

  // Relatório geral
  if (t.includes("relatório") || t.includes("resumo") || t.includes("produtividade geral")) {
    const totalConcluidas = execucoes.filter(e => e.status === "Concluída").length;
    const totalPendentes = execucoes.filter(e => e.status !== "Concluída").length;
    
    actions.push("CREATE_DEMAND", "GOTO_REPORTS");
    return {
      text: `## 📊 Seu Relatório de Produtividade\n\nAqui está o resumo da sua operação:\n\n- **Demandas Concluídas:** ${totalConcluidas}\n- **Demandas Pendentes:** ${totalPendentes}\n- **Projetos Ativos:** ${projetos.length}\n\nUse os atalhos abaixo para criar novas tarefas ou ver os relatórios completos.`,
      actions
    };
  }

  if (t.includes("risco")) {
    const emRisco = execucoes.filter(e => e.status === "Em Risco");
    if (emRisco.length === 0) {
      actions.push("CREATE_DEMAND");
      return {
        text: `## 🛡️ Tudo Seguro!\n\nNenhuma demanda sua está classificada como "Em Risco" no momento. Bom trabalho, ${userName}!`,
        actions
      };
    }
    actions.push("GOTO_DEMANDS");
    return {
      text: `## ⚠️ Atenção! Demandas em Risco\n\nEncontrei **${emRisco.length}** demandas marcadas como "Em Risco":\n\n${emRisco.map(e => `- **${e.titulo}**`).join("\n")}\n\nRecomendo verificar isso imediatamente.`,
      actions
    };
  }

  if (t.includes("pendentes") || t.includes("auditar")) {
    const pendentes = execucoes.filter(e => e.status !== "Concluída");
    const semEtiqueta = pendentes.filter(e => !e.etiquetas || e.etiquetas.length === 0);
    
    let resposta = `## 📋 Resumo de Pendências\n\nVocê tem um total de **${pendentes.length} demanda(s) pendente(s)** no Kore Flow.\n\n`;
    
    if (semEtiqueta.length > 0) {
      resposta += `### ⚠️ Demandas sem Etiqueta\nEncontrei **${semEtiqueta.length} demanda(s)** que não estão categorizadas com nenhuma etiqueta. Organizar isso pode te ajudar a focar melhor:\n`;
      resposta += semEtiqueta.slice(0, 5).map(e => `- **${e.titulo}**`).join("\n");
      if (semEtiqueta.length > 5) resposta += `\n- *(e mais ${semEtiqueta.length - 5} outras...)*`;
      resposta += "\n\n";
    }

    resposta += `---\nVocê pode ir até a aba **Demandas** e organizar seu quadro!`;
    return { text: resposta, actions: ["GOTO_DEMANDS"] };
  }

  if (t.includes("timer") || t.includes("registrar tempo") || t.includes("atalho")) {
    return {
      text: `## ⏱️ Controle de Tempo no Kore Flow\n\nAqui vai como você pode dominar o seu tempo no sistema:\n\n` +
            `1. **Na aba Demandas:** Clique no ícone de play (▶️) em qualquer demanda para iniciar o contador global.\n` +
            `2. **O Timer Flutuante:** Ele vai aparecer no canto inferior direito.\n` +
            `3. **Parar Tempo:** Clique no quadrado (⏹️) e o tempo será registrado.\n\n` +
            `---\n*Extraordinário, não? Nada de anotar horas no papel ou em planilhas!*`,
      actions: ["GOTO_DEMANDS"]
    };
  }

  if (t.includes("relatório") || t.includes("relatorio") || t.includes("execuç") || t.includes("execuc")) {
    const total = execucoes.length;
    const concluidas = execucoes.filter(e => e.status === "Concluída").length;
    const taxaEntrega = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    const mes = new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" });

    return {
      text: `## 📊 Relatório de Execuções — ${mes.charAt(0).toUpperCase() + mes.slice(1)}\n**Responsável:** ${userName}  \n**Total:** ${total}\n**Taxa de Entrega:** ${taxaEntrega}%`,
      actions: ["GOTO_REPORTS"]
    };
  }

  actions.push("CREATE_DEMAND", "CREATE_PROJECT");
  return {
    text: `Olá, ${userName}! Sou a Kore AI.\n\nAqui estão algumas coisas extraordinárias que posso fazer por você:\n\n1. **Parar ou iniciar seu timer** automaticamente.\n2. **Gerar relatórios de produtividade** em segundos.\n3. **Mapear prioridades** e demandas atrasadas para você.\n\nComo posso ajudar a acelerar seu fluxo hoje?`,
    actions
  };
}

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("## ")) return <h2 key={i} className="text-base font-bold text-foreground mt-4 mb-2">{line.replace("## ", "")}</h2>;
    if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-semibold text-foreground mt-3 mb-1">{line.replace("### ", "")}</h3>;
    if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-sm text-foreground">{line.replace(/\*\*/g, "")}</p>;
    if (line.startsWith("- ")) return <li key={i} className="text-sm text-foreground ml-4 list-disc">{line.replace("- ", "").replace(/\*\*(.+?)\*\*/g, "$1")}</li>;
    if (line.startsWith("| ") && line.endsWith(" |")) {
      const cells = line.split("|").filter(c => c.trim() !== "");
      return (
        <div key={i} className="flex gap-2 text-xs border-b border-border/30 py-1">
          {cells.map((c, j) => <span key={j} className="flex-1 text-muted-foreground">{c.trim()}</span>)}
        </div>
      );
    }
    if (line.startsWith("---")) return <hr key={i} className="my-3 border-border/40" />;
    if (line.trim() === "") return <div key={i} className="h-1" />;
    const parsed = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return <p key={i} className="text-sm text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: parsed }} />;
  });
}

export default function KoreAiPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string, actions?: string[] }[]>([
      { role: "ai", content: "Olá! Sou a **Kore AI**. Como posso ajudar a orquestrar seu dia hoje?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const { configuracoes, execucoes, updateExecucao, projetos, planejamentos, metas, eventos, addProjeto, addExecucao } = useStore();
  const { openModal } = useModal();
  const personalidade = configuracoes?.ia?.tom || "Híbrida (Extraordinária e Proativa)";
  const suggestions = getSuggestions(personalidade);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAIResponse(text, configuracoes?.nome || "Usuário", { execucoes, projetos, planejamentos, metas, eventos, configuracoes });
      setMessages(prev => [...prev, { role: "ai", content: response.text, actions: response.actions }]);
      setIsTyping(false);
    }, 1400);
  };

  const handleSavePlanejamento = () => {
    const title = `Planejamento KORE AI — ${new Date().toLocaleDateString("pt-BR")}`;
    const today = new Date();
    const in30 = new Date(today);
    in30.setDate(today.getDate() + 30);
    addPlanejamento({
      nome: title,
      inicio: today.toISOString().split("T")[0],
      fim: in30.toISOString().split("T")[0],
    });
    router.push("/planejamento");
  };

  const handleCriarProjeto = () => {
    addProjeto({
      nome: `Projeto KORE AI — ${new Date().toLocaleDateString("pt-BR")}`,
      cliente: "KORE AI",
      status: "Ativo"
    });
    router.push("/projetos");
  };

  const handleCriarExecucao = () => {
    addExecucao({
      titulo: `Execução KORE AI — ${new Date().toLocaleDateString("pt-BR")}`,
      categoria: "Marketing",
      entrega: new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleDateString("pt-BR"),
      prioridade: "Alta",
      tipoPlanejamento: "Previsto",
    });
    router.push("/execucoes");
  };

  const ACTION_BUTTONS = [
    { icon: <Save className="w-3.5 h-3.5" />, label: "Salvar Planejamento", action: handleSavePlanejamento, color: "text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20 hover:bg-[#8B5CF6]/20" },
    { icon: <Calendar className="w-3.5 h-3.5" />, label: "Criar Calendário", action: handleSavePlanejamento, color: "text-blue-600 bg-blue-500/10 border-blue-200 hover:bg-blue-500/20" },
    { icon: <LayoutGrid className="w-3.5 h-3.5" />, label: "Criar Projeto", action: handleCriarProjeto, color: "text-emerald-600 bg-emerald-500/10 border-emerald-200 hover:bg-emerald-500/20" },
    { icon: <ListChecks className="w-3.5 h-3.5" />, label: "Criar Execuções", action: handleCriarExecucao, color: "text-amber-600 bg-amber-500/10 border-amber-200 hover:bg-amber-500/20" },
  ];

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full relative">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center mx-auto mb-0 drop-shadow-2xl">
              <img src="/kore_ai.png" alt="KORE AI" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">KORE AI</h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Sua assistente {personalidade.split(" ")[0].toLowerCase()} para orquestrar suas demandas e tempo no Kore Flow.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s.label)}
                className="text-left p-4 bg-white border border-border/50 rounded-xl text-sm text-muted-foreground hover:border-[#8B5CF6]/40 hover:text-foreground hover:bg-[#8B5CF6]/5 transition-all group flex items-start gap-3"
              >
                <span className="w-7 h-7 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6] group-hover:bg-[#8B5CF6] group-hover:text-white transition-colors shrink-0 mt-0.5">
                  {s.icon}
                </span>
                <span className="leading-snug">{s.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground/60">
            <Zap className="w-3 h-3" /> Especialista em Marketing Digital, Campanhas e Conteúdo
          </div>
        </div>
      ) : (
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

                {isAi && msg.actions && msg.actions.length > 0 && !isTyping && (
                  <div className="ml-11">
                    <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-widest mb-2">Ações Sugeridas</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.actions.includes("CREATE_DEMAND") && (
                        <button onClick={() => openModal("CREATE_EXECUTION")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all border-[#8B5CF6]/30 text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white">
                          <CheckSquare className="w-3.5 h-3.5" /> Nova Demanda
                        </button>
                      )}
                      {msg.actions.includes("CREATE_PROJECT") && (
                        <button onClick={() => openModal("CREATE_PROJECT")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all border-emerald-500/30 text-emerald-600 hover:bg-emerald-500 hover:text-white">
                          <Folder className="w-3.5 h-3.5" /> Novo Projeto
                        </button>
                      )}
                      {msg.actions.includes("STOP_TIMER") && (
                        <button onClick={() => {
                          const active = execucoes.find(e => e.timerStart);
                          if (active) {
                            const timeSpent = Math.floor((Date.now() - active.timerStart) / 1000);
                            updateExecucao(active.id, { tempoGasto: (active.tempoGasto || 0) + timeSpent, timerStart: null });
                            setMessages(prev => [...prev, { role: "ai", content: `Pronto! O timer da demanda **${active.titulo}** foi pausado e o tempo foi salvo com sucesso. ✅` }]);
                          }
                        }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all border-red-500/30 text-red-600 hover:bg-red-500 hover:text-white">
                          <PauseCircle className="w-3.5 h-3.5" /> Parar Timer
                        </button>
                      )}
                      {msg.actions.includes("GOTO_DEMANDS") && (
                        <button onClick={() => router.push("/execucoes")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all border-blue-500/30 text-blue-600 hover:bg-blue-500 hover:text-white">
                          <LayoutGrid className="w-3.5 h-3.5" /> Central de Demandas <ChevronRight className="w-3 h-3 opacity-50" />
                        </button>
                      )}
                      {msg.actions.includes("GOTO_REPORTS") && (
                        <button onClick={() => router.push("/")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all border-orange-500/30 text-orange-600 hover:bg-orange-500 hover:text-white">
                          <BarChart2 className="w-3.5 h-3.5" /> Ver Dashboard Geral <ChevronRight className="w-3 h-3 opacity-50" />
                        </button>
                      )}
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
      )}

      <div className="flex items-center gap-3 bg-white border border-border/50 rounded-2xl p-3 shadow-sm shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          placeholder="Peça uma campanha, calendário, copy, roteiro..."
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
