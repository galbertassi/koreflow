const fs = require('fs');

let page = `
"use client";

import { Bot, Sparkles, Send, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useStore } from "@/hooks/use-store";

const suggestions = [
  "Quais execuções estão em atraso esta semana?",
  "Resuma meu progresso do mês de maio.",
  "Crie um planejamento para o próximo ciclo.",
  "Qual é minha taxa de entrega atual?",
];

export default function KoreAiPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { configuracoes, execucoes, projetos, metas } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let response = "";
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes("atraso") || lowerText.includes("atrasad")) {
        const atrasadas = execucoes.filter(e => e.status === "Em Risco");
        response = atrasadas.length > 0 
          ? \`Você tem \${atrasadas.length} execução(ões) em risco/atraso: \${atrasadas.map(a => a.titulo).join(", ")}.\`
          : "Ótimas notícias! Você não tem nenhuma execução em atraso no momento.";
      } 
      else if (lowerText.includes("taxa") || lowerText.includes("entrega")) {
        const concluidas = execucoes.filter(e => e.status === "Concluida").length;
        const taxa = execucoes.length > 0 ? Math.round((concluidas / execucoes.length) * 100) : 0;
        response = \`Sua taxa de entrega atual é de \${taxa}%. Continue com o bom trabalho, \${configuracoes.nome}!\`;
      }
      else if (lowerText.includes("resuma") || lowerText.includes("progresso")) {
        response = \`Resumo rápido: Você tem \${projetos.length} projetos ativos, \${execucoes.length} execuções registradas e \${metas.length} metas acompanhadas. Tudo parece estar fluindo bem no momento.\`;
      }
      else {
        const respostasGen = [
          \`Estou analisando seus dados, \${configuracoes.nome}... Parece tudo certo por enquanto!\`,
          "Interessante! Posso te ajudar a organizar melhor isso se precisar.",
          \`De acordo com meu tom \${configuracoes.ia.tom.toLowerCase()}, eu diria que isso é perfeitamente gerenciável.\`,
          "Ainda estou aprendendo sobre sua agência, mas estou aqui para ajudar no que for preciso!"
        ];
        response = respostasGen[Math.floor(Math.random() * respostasGen.length)];
      }

      setMessages(prev => [...prev, { role: 'ai', content: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full relative">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-[#8B5CF6]" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight mb-2">KORE AI</h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Sua assistente inteligente. Pergunte sobre suas execuções, projetos, metas ou peça para ela criar algo por você.
            </p>
          </div>

          {/* Suggestions */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                className="text-left p-4 bg-white border border-border/50 rounded-xl text-sm text-muted-foreground hover:border-[#8B5CF6]/30 hover:text-foreground hover:bg-white transition-all group"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]/40 group-hover:text-[#8B5CF6] mb-2 transition-colors" />
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto mb-4 flex flex-col gap-4 pb-4 px-2 no-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={\`flex gap-3 max-w-[85%] \${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}\`}>
              <div className={\`w-8 h-8 shrink-0 rounded-full flex items-center justify-center \${msg.role === 'user' ? 'bg-secondary text-foreground' : 'bg-[#8B5CF6] text-white'}\`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={\`px-4 py-3 rounded-2xl text-[14px] \${msg.role === 'user' ? 'bg-secondary/50 text-foreground rounded-tr-sm' : 'bg-white border border-border/50 text-foreground rounded-tl-sm'}\`}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3 max-w-[85%] self-start items-center">
              <div className="w-8 h-8 shrink-0 rounded-full bg-[#8B5CF6] flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="px-4 py-4 rounded-2xl bg-white border border-border/50 flex gap-1 items-center rounded-tl-sm">
                <div className="w-1.5 h-1.5 bg-[#8B5CF6]/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-[#8B5CF6]/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-[#8B5CF6]/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-3 bg-white border border-border/50 rounded-2xl p-3 shadow-sm shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder="Pergunte algo para a KORE AI..."
          className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground/60 px-2"
        />
        <button 
          onClick={() => handleSend(input)}
          disabled={!input.trim()}
          className="w-9 h-9 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 disabled:hover:bg-[#8B5CF6] flex items-center justify-center transition-colors shrink-0"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/app/(dashboard)/kore-ai/page.tsx', page);
console.log("KORE AI activated");
