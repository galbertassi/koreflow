"use client";

import { useStore } from "@/hooks/use-store";
import { ArrowLeft, Plus, Folder, LayoutGrid, Lightbulb, Link as LinkIcon, MessageSquare } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const tabs = ["Campanhas", "Posts e Ideias", "Inspiracoes"];

export default function ProjetoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const { projetos, addCampanha, addPostCampanha, addInspiracao } = useStore();
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [showForm, setShowForm] = useState(false);
  
  // Temporary state for new items
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  const projetoId = params.id as string;
  const projeto = projetos.find(p => p.id === projetoId);

  if (!projeto) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground">Projeto nao encontrado.</p>
        <button onClick={() => router.push("/projetos")} className="mt-4 text-[#8B5CF6] hover:underline">Voltar para Projetos</button>
      </div>
    );
  }

  const handleCreate = () => {
    if (!nome.trim()) return;
    
    if (activeTab === "Campanhas") {
      addCampanha(projetoId, { nome, descricao, status: "Planejamento" });
    } else if (activeTab === "Posts e Ideias") {
      let campId = projeto.campanhas[0]?.id;
      if (!campId) {
        addCampanha(projetoId, { nome: "Geral", descricao: "", status: "Planejamento" });
        alert("Crie uma campanha primeiro para adicionar posts!");
        return;
      }
      addPostCampanha(projetoId, campId, {
        titulo: nome,
        descricao,
        tipo: "Post",
        status: "Ideia"
      });
    } else if (activeTab === "Inspiracoes") {
      addInspiracao(projetoId, { titulo: nome, url: descricao, descricao: "" });
    }
    
    setNome("");
    setDescricao("");
    setShowForm(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push("/projetos")} className="w-10 h-10 flex items-center justify-center rounded-xl border border-border/50 bg-white hover:bg-secondary/20 transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{projeto.nome}</h1>
          <p className="text-sm text-muted-foreground mt-1">Cliente: {projeto.cliente || "N/A"}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-6 bg-white rounded-xl border border-border/50 p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setShowForm(false); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab ? "bg-[#8B5CF6]/10 text-[#8B5CF6]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "Campanhas" ? <Folder className="w-4 h-4" /> : tab === "Posts e Ideias" ? <LayoutGrid className="w-4 h-4" /> : <Lightbulb className="w-4 h-4" />}
            {tab}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-[#8B5CF6]/30 p-5 mb-6 shadow-sm">
          <h3 className="font-medium mb-4">Novo(a) {activeTab.slice(0, -1)}</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nome / Titulo</label>
              <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" placeholder="Digite..." />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Descricao / URL</label>
              <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" placeholder="Detalhes opcionais..." />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary rounded-xl transition-colors">Cancelar</button>
              <button onClick={handleCreate} className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {!showForm && (
        <div className="mb-6">
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Adicionar em {activeTab}
          </button>
        </div>
      )}

      <div className="flex-1">
        {activeTab === "Campanhas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projeto.campanhas.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-border/50 p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-foreground">{c.nome}</h3>
                  <span className="px-2 py-1 bg-secondary rounded-md text-[11px] font-medium">{c.status}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{c.descricao || "Sem descricao"}</p>
                <div className="text-xs text-muted-foreground">{c.posts.length} posts criados</div>
              </div>
            ))}
            {projeto.campanhas.length === 0 && !showForm && (
              <p className="text-sm text-muted-foreground col-span-2">Nenhuma campanha criada.</p>
            )}
          </div>
        )}

        {activeTab === "Posts e Ideias" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projeto.campanhas.flatMap(c => c.posts).map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-border/50 p-5 relative group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] uppercase font-bold text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-1 rounded-md">{p.tipo}</span>
                  <span className={`text-[11px] font-medium px-2 py-1 rounded-md border ${
                    p.status === 'Ideia' ? 'bg-secondary/50 text-muted-foreground border-border' : 
                    p.status === 'Producao' ? 'bg-blue-500/10 text-blue-600 border-blue-200' :
                    'bg-emerald-500/10 text-emerald-600 border-emerald-200'
                  }`}>{p.status}</span>
                </div>
                <h3 className="font-medium text-foreground mt-2">{p.titulo}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.descricao || "Sem detalhes"}</p>
              </div>
            ))}
            {projeto.campanhas.flatMap(c => c.posts).length === 0 && !showForm && (
              <p className="text-sm text-muted-foreground col-span-3">Nenhum post criado.</p>
            )}
          </div>
        )}

        {activeTab === "Inspiracoes" && (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {projeto.inspiracoes.map(i => (
              <a key={i.id} href={i.url || "#"} target="_blank" rel="noreferrer" className="bg-white rounded-2xl border border-border/50 p-5 hover:border-[#8B5CF6]/50 transition-colors block group">
                <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center mb-3 group-hover:bg-[#8B5CF6]/10 transition-colors">
                  <LinkIcon className="w-4 h-4 text-muted-foreground group-hover:text-[#8B5CF6] transition-colors" />
                </div>
                <h3 className="font-medium text-foreground">{i.titulo}</h3>
                {i.url && <p className="text-xs text-muted-foreground mt-1 truncate">{i.url}</p>}
              </a>
            ))}
            {projeto.inspiracoes.length === 0 && !showForm && (
              <p className="text-sm text-muted-foreground col-span-4">Nenhuma inspiracao salva.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
