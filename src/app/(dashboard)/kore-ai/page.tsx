"use client";

import {
  Sparkles, Send, User, Calendar, BookOpen, Zap, Target,
  PlusCircle, Save, LayoutGrid, ListChecks, ChevronRight,
  Megaphone, TrendingUp, Video, Hash, Gift
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useStore } from "@/hooks/use-store";
import { useRouter } from "next/navigation";

const SUGGESTIONS = [
  { icon: <Megaphone className="w-4 h-4" />, label: "Criar campanha completa para um produto" },
  { icon: <Calendar className="w-4 h-4" />, label: "Montar calendário editorial de 30 dias" },
  { icon: <TrendingUp className="w-4 h-4" />, label: "Gerar relatório das minhas execuções" },
  { icon: <Video className="w-4 h-4" />, label: "Roteiro de vídeo para Instagram Reels" },
  { icon: <Hash className="w-4 h-4" />, label: "Gerar planejamento do mês para o cliente fulano" },
  { icon: <Gift className="w-4 h-4" />, label: "Ideias de promoção para datas comemorativas" },
];

interface StoreData {
  execucoes: any[];
  projetos: any[];
  planejamentos: any[];
  metas: any[];
  eventos: any[];
  configuracoes: any;
}

function generateAIResponse(text: string, userName: string, store: StoreData): string {
  const t = text.toLowerCase();
  const { execucoes, projetos, planejamentos, metas, eventos } = store;

  const MESES_NOMES: Record<string, number> = {
    janeiro: 0, fevereiro: 1, março: 2, marco: 2, abril: 3, maio: 4,
    junho: 5, julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11
  };

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
      return `## 📅 Eventos — ${nomesMes}/${anoFiltro}

Nenhum evento agendado para ${nomesMes}.

Use a página **Calendário** para criar novos eventos, ou diga "Agendar evento" e eu te ajudo!`;
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

    return `## 📅 Eventos Agendados — ${nomesMes}/${anoFiltro}

**Total de eventos:** ${eventosMes.length}

---

${lista}

---

*Dados lidos diretamente da sua agenda no KORE FLOW.*`;
  }

  // Relatório de execuções
  if (t.includes("relatório") || t.includes("relatorio") || t.includes("execuç") || t.includes("execuc")) {
    const total = execucoes.length;
    const concluidas = execucoes.filter(e => e.status === "Concluida").length;
    const emProducao = execucoes.filter(e => e.status === "Em producao").length;
    const emRisco = execucoes.filter(e => e.status === "Em Risco").length;
    const aguardando = execucoes.filter(e => e.status === "Aguardando").length;
    const revisao = execucoes.filter(e => e.status === "Revisao").length;
    const taxaEntrega = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    const progressoMedio = total > 0 ? Math.round(execucoes.reduce((sum, e) => sum + (e.progresso || 0), 0) / total) : 0;
    const emRiscoList = execucoes.filter(e => e.status === "Em Risco").map(e => e.titulo).join(", ") || "Nenhuma";
    const altaPrioridade = execucoes.filter(e => e.prioridade === "Alta").length;
    const mes = new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" });

    if (total === 0) {
      return `## 📊 Relatório de Execuções\n\nNenhuma execução cadastrada ainda. Acesse **Execuções** e crie as primeiras tarefas para começarmos a monitorar o progresso da sua equipe.`;
    }

    return `## 📊 Relatório de Execuções — ${mes.charAt(0).toUpperCase() + mes.slice(1)}

**Responsável:** ${userName}  
**Total de execuções:** ${total}

---

### 📈 Visão Geral
- **Concluídas:** ${concluidas} execução(ões) ✅
- **Em Produção:** ${emProducao} execução(ões) 🔵
- **Em Revisão:** ${revisao} execução(ões) 🟣
- **Aguardando:** ${aguardando} execução(ões) 🟡
- **Em Risco:** ${emRisco} execução(ões) 🔴

---

### 🎯 Indicadores
- **Taxa de Entrega:** ${taxaEntrega}%
- **Progresso Médio Geral:** ${progressoMedio}%
- **Alta Prioridade:** ${altaPrioridade} item(ns)

---

### 🚨 Atenção — Execuções em Risco
${emRiscoList}

---

### 💡 Diagnóstico
${taxaEntrega >= 80 ? `✅ Excelente desempenho! Taxa de entrega acima de 80%. Continue assim, ${userName}.` : taxaEntrega >= 50 ? `⚠️ Desempenho moderado. Foque nas execuções em produção para aumentar a taxa de entrega.` : `🔴 Atenção necessária. Taxa de entrega abaixo de 50%. Priorize as execuções em risco e revise os prazos.`}

---
*Relatório gerado automaticamente pela KORE AI com base nos seus dados em tempo real.*`;
  }

  // Planejamento do mês para cliente específico
  if ((t.includes("planejamento") || t.includes("planejar") || t.includes("mês") || t.includes("mes")) && (t.includes("cliente") || t.includes("para o") || t.includes("para a"))) {
    const clienteMatch = text.match(/(?:cliente|para o|para a|do)\s+([A-Za-zÀ-ú]+(?:\s+[A-Za-zÀ-ú]+)?)/i);
    const clienteNome = clienteMatch?.[1] || "Cliente";
    const mesAtual = new Date().toLocaleString("pt-BR", { month: "long" });
    const mesCapital = mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1);
    const anoAtual = new Date().getFullYear();
    const hoje = new Date();
    const diasNoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();

    // Check if client exists in any planning
    const clienteExistente = planejamentos.find(pl =>
      pl.clientes?.some((c: any) => c.nome?.toLowerCase().includes(clienteNome.toLowerCase()))
    );

    return `## 📅 Planejamento de ${mesCapital}/${anoAtual} — ${clienteNome}

${clienteExistente ? `✅ **Cliente encontrado** nos seus planejamentos existentes.` : `📋 **Novo planejamento** sendo gerado para ${clienteNome}.`}

---

### 🗓️ Visão Geral do Mês (${diasNoMes} dias úteis)

**Objetivo:** Presença consistente, engajamento e geração de leads

---

### 📆 Semana 1 (Dias 1–7) — Posicionamento
- **Seg:** Reels educativo — "3 erros que impedem resultados em [nicho]"
- **Qua:** Carrossel — Apresentação da empresa/serviço com dados
- **Sex:** Stories — Bastidores + enquete de engajamento

### 📆 Semana 2 (Dias 8–14) — Autoridade
- **Seg:** Feed — Caso de sucesso / depoimento de cliente
- **Qua:** Reels — Tutorial ou dica rápida do nicho
- **Sex:** Carrossel — "Antes e depois" ou transformação

### 📆 Semana 3 (Dias 15–21) — Relacionamento
- **Seg:** Stories — Quiz sobre o nicho
- **Qua:** Feed — Post de valor: lista, checklist ou dicas
- **Sex:** Reels — Tendência do momento adaptada ao negócio

### 📆 Semana 4 (Dias 22–${diasNoMes}) — Conversão
- **Seg:** Carrossel — Oferta ou diferencial competitivo
- **Qua:** Stories — CTA direto com link na bio
- **Sex:** Feed — Fechamento do mês: gratidão + próximos passos

---

### 🎯 Métricas do Mês (Metas sugeridas)
- **Novos seguidores:** +200
- **Taxa de engajamento:** ≥ 4%
- **Posts publicados:** 12–15
- **DMs de leads:** ≥ 10

---

*Planejamento personalizado para ${clienteNome} gerado pela KORE AI.*
Use os botões abaixo para salvar esse planejamento direto no KORE FLOW! 👇`;
  }


  // Campanha completa
  if (t.includes("campanha")) {
    const produto = text.match(/para (.+)/i)?.[1] || "seu produto/serviço";
    return `## 🚀 Campanha Completa — ${produto}

**Objetivo:** Gerar reconhecimento de marca e conversões diretas

---

### 🎯 Fase 1 — Aquecimento (Dias 1–7)
- **Stories:** 3 bastidores do processo de criação
- **Feed:** 1 post de "problema vs. solução" com carrossel
- **Reels:** "O que você não sabia sobre ${produto}" (60s)
- **Copy sugerido:** *"Você sabia que 80% das pessoas cometem esse erro? A gente resolveu isso."*

### 🔥 Fase 2 — Ativação (Dias 8–14)
- **Carrossel:** 5 benefícios em slides visuais
- **Stories:** Prova social (depoimentos em vídeo/print)
- **Reels:** Transformação / antes e depois
- **CTA:** *"Link na bio para garantir o seu"*

### 💰 Fase 3 — Conversão (Dias 15–21)
- **Post:** Urgência e escassez ("Últimas vagas")
- **Stories:** Contagem regressiva com sticker de timer
- **Feed:** Post de FAQ com as principais objeções respondidas
- **Copy:** *"Hoje é o último dia. Clique no link e garanta agora."*

---

📊 **Métricas para acompanhar:** Alcance, engajamento, cliques no link, DMs recebidas.

---
O que deseja fazer com essa campanha?`;
  }

  // Calendário editorial
  if (t.includes("calendário") || t.includes("calendario") || t.includes("30 dias") || t.includes("60 dias") || t.includes("90 dias")) {
    const dias = t.includes("90") ? 90 : t.includes("60") ? 60 : 30;
    return `## 📅 Calendário Editorial — ${dias} Dias

Aqui está a estrutura semanal que vou rodar durante ${dias} dias:

---

**🔁 Frequência semanal sugerida:**

| Dia | Formato | Tema |
|-----|---------|------|
| Segunda | Reels | Educativo / Dica Rápida |
| Terça | Stories | Bastidores / Processo |
| Quarta | Carrossel | Passo a passo / Tutorial |
| Quinta | Feed | Depoimento / Prova Social |
| Sexta | Reels | Tendência / Entretenimento |
| Sábado | Stories | Engajamento (enquete, quiz) |
| Domingo | Feed | Reflexão / Motivação da semana |

---

**📌 Pilares de conteúdo sugeridos:**
1. **Educação** — Ensine algo do seu nicho (40% dos posts)
2. **Autoridade** — Cases, resultados, bastidores (30%)
3. **Vendas** — Oferta, CTA, promoção (20%)
4. **Conexão** — Humanização, entretenimento (10%)

---
Posso gerar as legendas de cada post também. É só pedir!`;
  }

  // Copywriting / legenda
  if (t.includes("legenda") || t.includes("copy") || t.includes("texto")) {
    return `## ✍️ Legendas Prontas para Usar

Aqui estão 3 variações com abordagens diferentes:

---

**🔵 Versão Curiosidade:**
> Existe uma razão pela qual as pessoas que fazem [X] chegam mais rápido ao resultado. E não é o que você está pensando.
> 
> A diferença não é esforço. É estratégia.
> 
> Quer saber qual é? Vem no direct, eu explico.
> 
> 👉 Comenta "EU QUERO" aqui embaixo!

---

**🟣 Versão Prova Social:**
> Há 3 meses a [Nome do Cliente] estava exatamente onde você está agora.
> 
> Hoje ela tem [resultado concreto].
> 
> O que mudou? [Seu produto/serviço].
> 
> Acesse o link na bio e veja como funciona. 🚀

---

**🔴 Versão Urgência:**
> Atenção: as vagas para [produto/serviço] se encerram em 48h.
> 
> Se você já pensou em [benefício desejado], agora é a hora.
> 
> Não deixa pra depois. ⏳ Link na bio.

---
Quer que eu adapte alguma para um cliente específico?`;
  }

  // Stories
  if (t.includes("stories") || t.includes("story")) {
    return `## 📱 Sequência de Stories — 7 Slides

**Objetivo:** Aquecer audiência e gerar DMs / Cliques no link

---

**Slide 1 — Gancho:**
> "Você comete esse erro toda vez que posta? 👀"
> *(Fundo colorido chamativo, texto grande)*

**Slide 2 — Identificação:**
> "Se você posta todo dia mas não tem resultado... esse story é pra você."

**Slide 3 — Problema:**
> "O problema não é frequência. É falta de estratégia."
> *(Use emoji de alerta 🚨)*

**Slide 4 — Solução:**
> "Aqui está o que funciona de verdade em 2025 👇"

**Slide 5 — Conteúdo de valor:**
> Dica 1: [X]
> Dica 2: [Y]
> Dica 3: [Z]
> *(Pode usar carrossel de texto ou vídeo curto)*

**Slide 6 — Prova:**
> "Isso é exatamente o que a gente aplicou com nossos clientes."
> *(Print de resultado ou depoimento)*

**Slide 7 — CTA:**
> "Quer aplicar isso no seu negócio?"
> *(Use sticker de Link ou "Arrasta pra cima")*

---
Sticker sugerido: **Enquete**, **Resposta** ou **Link**.`;
  }

  // Roteiro vídeo
  if (t.includes("roteiro") || t.includes("vídeo") || t.includes("video") || t.includes("reels")) {
    return `## 🎬 Roteiro — Reels / Vídeo Curto (30–60s)

---

**⚡ GANCHO (0–3s):**
> *Fale olhando direto para a câmera:*
> "Você está perdendo dinheiro por causa disso — e nem sabe."

**📖 DESENVOLVIMENTO (4–25s):**
> "A maioria das pessoas acha que para vender mais precisa postar mais vezes. Isso é mentira."
> *(Corte rápido, mude o ângulo)*
> "O que realmente funciona é ter uma estratégia clara de conteúdo. Vou te mostrar em 3 passos:"
> *(Apareça na tela com textos em overlay)*
> "1. Defina um pilar de conteúdo. 2. Crie uma rotina de postagem. 3. Use CTAs em todo post."

**💰 CTA FINAL (26–30s):**
> "Se quiser que a gente monte isso pra você, arrasta pra cima ou acessa o link na bio."
> *(Aparece logo/marca no canto)*

---

**🎙️ Dicas de produção:**
- Luz natural de frente
- Fundo limpo ou brandado
- Legenda automática ativada
- Música trend do momento

---
Quer que eu faça o roteiro para um tema específico?`;
  }

  // Funil
  if (t.includes("funil") || t.includes("lançamento") || t.includes("estratégia")) {
    return `## 🎯 Funil de Vendas — Estratégia Completa

---

### 🔝 Topo do Funil — Atração
**Objetivo:** Fazer pessoas te descobrirem

- Reels educativos sobre o problema que você resolve
- Posts com títulos que geram curiosidade
- Anúncios de alcance para público frio
- Uso de hashtags do nicho

*Métrica: Novos seguidores, alcance de não-seguidores*

---

### 🔶 Meio do Funil — Engajamento
**Objetivo:** Criar relacionamento e confiança

- Stories com bastidores e rotina
- Carrosséis com passo a passo
- Depoimentos de clientes
- Lives de perguntas e respostas

*Métrica: Curtidas, comentários, compartilhamentos, DMs*

---

### 🔴 Fundo do Funil — Conversão
**Objetivo:** Transformar seguidores em clientes

- Post de oferta direta com CTA claro
- Stories com link e timer de urgência
- Sequência de e-mails / WhatsApp para lista
- Anúncio de remarketing para quem visitou o site

*Métrica: Cliques no link, mensagens, vendas*

---

📌 **Ferramentas sugeridas:** ManyChat, RD Station, Notion para gestão.`;
  }

  // Datas comemorativas
  if (t.includes("data") || t.includes("comemorat") || t.includes("promoção") || t.includes("promocao")) {
    const mes = new Date().toLocaleString("pt-BR", { month: "long" });
    return `## 🎉 Datas Comemorativas & Promoções — ${mes.charAt(0).toUpperCase() + mes.slice(1)}

---

**📅 Principais datas para aproveitar:**

- **Dia dos Namorados (12/06)** — Conteúdo sobre relacionamentos, presentes, experiências
- **Dia dos Pais (segundo domingo de agosto)** — Homenagem + promoção de serviços
- **Black Friday (última sexta de novembro)** — Maior oportunidade de vendas do ano
- **Natal (25/12)** — Emoção, gratidão e oferta especial de encerramento de ano

---

**💡 Ideias de promoção:**

1. **Desconto progressivo:** "Compre 2, leve 3" ou "10% de desconto na primeira semana"
2. **Combo exclusivo:** Une dois serviços com preço especial por tempo limitado
3. **Lista VIP:** Quem entrar na lista recebe a oferta 24h antes do público geral
4. **Sorteio de engajamento:** Aumente o alcance e gere leads qualificados
5. **Challenge + Hashtag:** Crie um desafio relacionado à data comemorativa

---

**📣 Copy para stories de data comemorativa:**
> "Hoje é um dia especial — e a gente preparou algo especial pra você também. 🎁
> Arrasta pra cima e garanta antes que acabe."

---
Quer o calendário completo do ano com as principais datas?`;
  }

  // Default — resposta de marketing genérica
  const respostas = [
    `Entendido, ${userName}! Estou aqui como seu colaborador digital de marketing. Me diga mais sobre o seu negócio ou cliente e vou gerar o conteúdo, estratégia ou planejamento que você precisar.\n\nAlgumas coisas que posso criar agora:\n- **Campanhas completas** com fases de aquecimento e conversão\n- **Calendários editoriais** de 30, 60 ou 90 dias\n- **Legendas e copies** prontos para postar\n- **Roteiros de vídeo** para Reels e TikTok\n- **Sequências de stories** de venda`,
    `Boa pergunta, ${userName}! Para te dar a melhor resposta, me conta: qual é o nicho ou produto que vamos trabalhar? Assim consigo montar algo bem direcionado para o seu público.`,
    `Certo, ${userName}! Analisando sua solicitação e preparando uma estratégia personalizada. Me dê um pouco mais de contexto — qual é o objetivo principal? Reconhecimento de marca, geração de leads ou vendas diretas?`,
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
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [lastAiContent, setLastAiContent] = useState("");
  const { configuracoes, execucoes, projetos, planejamentos, metas, eventos, addPlanejamento, addProjeto, addExecucao } = useStore();
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
      const response = generateAIResponse(text, configuracoes.nome, { execucoes, projetos, planejamentos, metas, eventos, configuracoes });
      setLastAiContent(response);
      setMessages(prev => [...prev, { role: "ai", content: response }]);
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
      cliente: configuracoes.agencia,
      inicio: new Date().toISOString().split("T")[0],
      fim: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0],
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
              Seu colaborador digital de marketing. Crio campanhas, calendários, copies, roteiros e estratégias — tudo integrado ao KORE FLOW.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {SUGGESTIONS.map((s, i) => (
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

                {isLast && !isTyping && (
                  <div className="ml-11">
                    <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-widest mb-2">Salvar ou criar a partir desta resposta</p>
                    <div className="flex flex-wrap gap-2">
                      {ACTION_BUTTONS.map((btn, j) => (
                        <button
                          key={j}
                          onClick={btn.action}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${btn.color}`}
                        >
                          {btn.icon}
                          {btn.label}
                          <ChevronRight className="w-3 h-3 opacity-50" />
                        </button>
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
