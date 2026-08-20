"use client";

import { useModal } from "@/hooks/use-modal";
import { useStore } from "@/hooks/use-store";
import { Plus, Folder, Search, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProjetosPage() {
  const { openModal } = useModal();
  const { projetos, deleteProjeto } = useStore();
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = projetos.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase()) || p.cliente.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projetos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {projetos.length > 0 ? `${projetos.length} projeto${projetos.length > 1 ? "s" : ""} ativo${projetos.length > 1 ? "s" : ""}` : "Agrupe execucoes em torno de objetivos maiores."}
          </p>
        </div>
        <button onClick={() => openModal("CREATE_PROJECT")} className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Novo Projeto
        </button>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Buscar projeto..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-border rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 bg-white" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex-1 bg-white rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/5 flex items-center justify-center mb-4">
            <Folder className="w-8 h-8 text-[#8B5CF6]/50" />
          </div>
          <h3 className="text-base font-semibold mb-2">{projetos.length === 0 ? "Nenhum projeto criado" : "Nenhum encontrado"}</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            {projetos.length === 0 ? "Crie seu primeiro projeto para organizar campanhas, posts e referencias por cliente." : "Ajuste a busca."}
          </p>
          {projetos.length === 0 && (
            <button onClick={() => openModal("CREATE_PROJECT")} className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Criar primeiro Projeto
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((projeto) => {
            const totalPosts = projeto.campanhas.reduce((sum, c) => sum + c.posts.length, 0);
            const totalAprovados = projeto.campanhas.reduce((sum, c) => sum + c.posts.filter((p) => p.status === "Aprovado" || p.status === "Publicado").length, 0);
            const progresso = totalPosts > 0 ? Math.round((totalAprovados / totalPosts) * 100) : 0;

            return (
              <button
                key={projeto.id}
                onClick={() => router.push(`/projetos/${projeto.id}`)}
                className="group text-left bg-white rounded-2xl border border-border/50 p-5 hover:border-[#8B5CF6]/30 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
                    <Folder className="w-5 h-5 text-[#8B5CF6]" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-[#8B5CF6] transition-colors" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{projeto.nome}</h3>
                <p className="text-sm text-muted-foreground mb-4">{projeto.cliente || "Sem cliente definido"}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span>{projeto.campanhas.length} campanha{projeto.campanhas.length !== 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>{totalPosts} post{totalPosts !== 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>{projeto.inspiracoes.length} ref.</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B5CF6] rounded-full transition-all" style={{ width: `${progresso}%` }}></div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{progresso}% concluido</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
