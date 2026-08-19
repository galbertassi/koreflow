"use client";

import { HelpCircle, Mail, MessageSquare, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function AjudaPage() {
  const faqs = [
    {
      q: "Como crio uma nova demanda?",
      a: "Para criar uma demanda, acesse a tela 'Demandas' e clique no botão roxo 'Nova Tarefa' no canto superior direito da tela."
    },
    {
      q: "Como funciona o registro de tempo?",
      a: "Na tela de Demandas, cada atividade possui um botão de 'play'. Ao clicar nele, o cronômetro inicia. Para parar, basta clicar em 'Parar Tempo' no banner superior."
    },
    {
      q: "O que é a Kore AI?",
      a: "A Kore AI é nossa assistente de inteligência artificial. Você pode interagir com ela na tela 'Kore AI' para gerar textos, analisar dados e ajudar nas suas atividades diárias."
    }
  ];

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto py-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <HelpCircle className="w-8 h-8 text-[#8B5CF6]" /> Central de Ajuda
        </h1>
        <p className="text-muted-foreground">Encontre respostas, explore recursos ou entre em contato com nosso suporte.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
            <MessageSquare className="w-6 h-6 text-blue-500" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Falar com o Suporte</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Nossa equipe está pronta para tirar suas dúvidas em tempo real.
          </p>
          <div className="flex flex-col gap-3">
            <a href="https://wa.me/5524999999345" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[#25D366] hover:text-[#128C7E] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
              (24) 9 9999-9345 | Gabriel Albertassi <ChevronRight className="w-4 h-4" />
            </a>
            <a href="mailto:ajuda@koreflow.com" className="inline-flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors">
              Enviar um email <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-emerald-500" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Documentação</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Aprenda a utilizar todos os recursos da plataforma passo a passo.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-500 hover:text-emerald-600 transition-colors">
            Acessar guia <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border bg-secondary/30">
          <h2 className="text-xl font-semibold">Perguntas Frequentes (FAQ)</h2>
        </div>
        <div className="divide-y divide-border">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-6">
              <h3 className="text-base font-semibold mb-2">{faq.q}</h3>
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
