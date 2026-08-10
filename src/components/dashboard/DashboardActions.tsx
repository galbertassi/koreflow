"use client";

import Link from "next/link";
import { PlusCircle, Calendar, BarChart2, Bot, Tag, ArrowRight } from "lucide-react";

export function DashboardActions() {
  return (
    <div>
      <h2 className="text-xl font-medium tracking-tight mb-6 flex items-center gap-2">
        A├º├Áes R├ípidas
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/demandas?new=true">
          <div className="group flex items-center justify-between bg-white border border-border/50 hover:border-[#8B5CF6]/30 p-5 rounded-2xl shadow-sm transition-all hover:shadow-md cursor-pointer h-full">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/5 flex items-center justify-center text-[#8B5CF6] shrink-0">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-foreground group-hover:text-[#8B5CF6] transition-colors">Nova Demanda</h3>
                <p className="text-sm text-muted-foreground mt-0.5 leading-tight">Cadastre e inicie o acompanhamento de uma nova demanda.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pl-2">
              <ArrowRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-[#8B5CF6] transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
            </div>
          </div>
        </Link>

        <Link href="/calendario?new=true">
          <div className="group flex items-center justify-between bg-white border border-border/50 hover:border-[#8B5CF6]/30 p-5 rounded-2xl shadow-sm transition-all hover:shadow-md cursor-pointer h-full">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/5 flex items-center justify-center text-[#8B5CF6] shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-foreground group-hover:text-[#8B5CF6] transition-colors">Novo Evento</h3>
                <p className="text-sm text-muted-foreground mt-0.5 leading-tight">Agende um compromisso importante no seu calend├írio.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pl-2">
              <ArrowRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-[#8B5CF6] transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
            </div>
          </div>
        </Link>

        <Link href="/relatorios">
          <div className="group flex items-center justify-between bg-white border border-border/50 hover:border-[#8B5CF6]/30 p-5 rounded-2xl shadow-sm transition-all hover:shadow-md cursor-pointer h-full">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/5 flex items-center justify-center text-[#8B5CF6] shrink-0">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-foreground group-hover:text-[#8B5CF6] transition-colors">Relat├│rios</h3>
                <p className="text-sm text-muted-foreground mt-0.5 leading-tight">Acesse as an├ílises detalhadas do seu desempenho.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pl-2">
              <ArrowRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-[#8B5CF6] transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
            </div>
          </div>
        </Link>

        <Link href="/kore-ai">
          <div className="group flex items-center justify-between bg-white border border-border/50 hover:border-[#8B5CF6]/30 p-5 rounded-2xl shadow-sm transition-all hover:shadow-md cursor-pointer h-full">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/5 flex items-center justify-center text-[#8B5CF6] shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-foreground group-hover:text-[#8B5CF6] transition-colors">KORE AI</h3>
                <p className="text-sm text-muted-foreground mt-0.5 leading-tight">Interaja com a intelig├¬ncia artificial para insights r├ípidos.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pl-2">
              <ArrowRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-[#8B5CF6] transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
            </div>
          </div>
        </Link>

        <Link href="/configuracoes?tab=etiquetas">
          <div className="group flex items-center justify-between bg-white border border-border/50 hover:border-[#8B5CF6]/30 p-5 rounded-2xl shadow-sm transition-all hover:shadow-md cursor-pointer h-full md:col-span-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/5 flex items-center justify-center text-[#8B5CF6] shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-foreground group-hover:text-[#8B5CF6] transition-colors">Criar Novas Etiquetas</h3>
                <p className="text-sm text-muted-foreground mt-0.5 leading-tight">Gerencie e crie etiquetas de status personalizadas para suas demandas.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pl-2">
              <ArrowRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-[#8B5CF6] transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
