"use client";

import { useStore } from "@/hooks/use-store";
import { ArrowLeft, Plus, Calendar, FileText, User, FileBarChart, Image as ImageIcon, Link as LinkIcon, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

function getDaysArray(startStr: string, endStr: string) {
  try {
    let start = startStr ? new Date(startStr + "T00:00:00") : new Date();
    let end = endStr ? new Date(endStr + "T00:00:00") : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    if (end < start) {
      const temp = start;
      start = end;
      end = temp;
    }

    const days = [];
    let current = new Date(start);
    let count = 0;
    while (current <= end && count < 60) {
      days.push(current.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' }));
      current.setDate(current.getDate() + 1);
      count++;
    }
    return days.length > 0 ? days : ["01/01", "02/01", "03/01"];
  } catch(e) {
    return ["12/06", "13/06", "14/06", "15/06", "16/06"];
  }
}

export default function PlanejamentoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const { planejamentos, addClientePlano, addPostDia, updatePostDia, deletePostDia } = useStore();
  
  const [novoCliente, setNovoCliente] = useState("");
  const [activeClienteId, setActiveClienteId] = useState<string | null>(null);
  
  const [showPostForm, setShowPostForm] = useState<string | null>(null);
  const [postData, setPostData] = useState({ titulo: "", descricao: "", tipo: "Post" as any, imagemUrl: "", link: "" });

  const planejamentoId = params.id as string;
  const pl = planejamentos.find(p => p.id === planejamentoId);

  useEffect(() => {
    if (pl && pl.clientes.length > 0) {
      // Always select the newest client if length changes
      setActiveClienteId(pl.clientes[pl.clientes.length - 1].id);
    }
  }, [pl?.clientes.length]);

  if (!pl) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground">Ciclo nao encontrado.</p>
        <button onClick={() => router.push("/planejamento")} className="mt-4 text-[#8B5CF6] hover:underline">Voltar</button>
      </div>
    );
  }

  const handleAddCliente = () => {
    if (novoCliente.trim()) {
      addClientePlano(planejamentoId, novoCliente);
      setNovoCliente("");
    }
  };

  const handleAddPost = (data: string) => {
    if (!activeClienteId || !postData.titulo.trim()) return;
    addPostDia(planejamentoId, activeClienteId, data, {
      ...postData,
      status: "Planejado"
    });
    setPostData({ titulo: "", descricao: "", tipo: "Post", imagemUrl: "", link: "" });
    setShowPostForm(null);
  };

  const activeCliente = pl.clientes.find(c => c.id === activeClienteId);
  const diasDoMes = getDaysArray(pl.inicio, pl.fim);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/planejamento")} className="w-10 h-10 flex items-center justify-center rounded-xl border border-border/50 bg-white hover:bg-secondary/20 transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{pl.nome}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {pl.inicio && pl.fim ? `${pl.inicio} a ${pl.fim}` : `Criado em ${pl.criadoEm}`}
            </p>
          </div>
        </div>
        <button onClick={() => router.push(`/planejamento/${planejamentoId}/relatorio`)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border hover:bg-secondary/20 text-foreground rounded-xl text-sm font-medium transition-colors shadow-sm">
          <FileBarChart className="w-4 h-4" /> Relatorio de Aprovacao
        </button>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Sidebar Clientes */}
        <div className="w-64 bg-white rounded-2xl border border-border/50 p-4 flex flex-col h-full">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Clientes do Ciclo</h3>
          
          <div className="flex-1 overflow-y-auto space-y-1 pr-2">
            {pl.clientes.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveClienteId(c.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeClienteId === c.id ? "bg-[#8B5CF6]/10 text-[#8B5CF6]" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span className="truncate">{c.nome}</span>
              </button>
            ))}
            {pl.clientes.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhum cliente neste ciclo.</p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-border/50">
            <input 
              value={novoCliente} 
              onChange={(e) => setNovoCliente(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleAddCliente()}
              placeholder="Nome do cliente..." 
              className="w-full px-3 py-2 text-sm rounded-lg border border-border mb-2 focus:outline-none focus:border-[#8B5CF6]" 
            />
            <button onClick={handleAddCliente} disabled={!novoCliente.trim()} className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors flex justify-center items-center gap-1 ${novoCliente.trim() ? "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]" : "bg-secondary text-muted-foreground opacity-50 cursor-not-allowed"}`}>
              <Plus className="w-3 h-3" /> Adicionar Cliente
            </button>
          </div>
        </div>

        {/* Workspace do Cliente */}
        <div className="flex-1 bg-white rounded-2xl border border-border/50 p-6 overflow-y-auto">
          {!activeCliente ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/5 flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-[#8B5CF6]/50" />
              </div>
              <h3 className="text-base font-semibold mb-2">Selecione um cliente</h3>
              <p className="text-sm text-muted-foreground max-w-xs">Escolha ou adicione um cliente na lateral para montar o calendario editorial dele.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                <h2 className="text-xl font-semibold">{activeCliente.nome} <span className="text-muted-foreground font-normal text-base">— Calendario Editorial</span></h2>
              </div>

              <div className="space-y-6">
                {diasDoMes.map(dia => {
                  const posts = activeCliente.postsPorDia[dia] || [];
                  return (
                    <div key={dia} className="flex gap-4">
                      <div className="w-16 pt-2">
                        <div className="text-sm font-bold text-foreground">{dia}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">Dia</div>
                      </div>
                      <div className="flex-1 bg-secondary/10 rounded-2xl border border-border/50 p-4 min-h-[100px]">
                        <div className="flex flex-col gap-3 mb-3">
                          {posts.map(p => (
                            <div key={p.id} className="bg-white border border-border/50 rounded-xl p-3 shadow-sm flex items-start gap-3 group">
                              <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
                                {p.imagemUrl ? (
                                  <img src={p.imagemUrl} alt={p.titulo} className="w-full h-full object-cover" />
                                ) : (
                                  <FileText className="w-4 h-4 text-muted-foreground/50" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm text-foreground truncate">{p.titulo}</h4>
                                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">{p.tipo}</span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">{p.descricao || "Sem legenda."}</p>
                                {p.link && (
                                  <a href={p.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-[10px] font-medium text-[#8B5CF6] hover:underline">
                                    <LinkIcon className="w-3 h-3" /> Abrir Link/Video
                                  </a>
                                )}
                              </div>
                              <select 
                                value={p.status}
                                onChange={(e) => updatePostDia(planejamentoId, activeCliente.id, dia, p.id, { status: e.target.value as any })}
                                className={`text-[10px] font-medium px-1 py-1 rounded-md shrink-0 border outline-none cursor-pointer ${
                                  p.status === 'Aprovado' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' :
                                  p.status === 'Em analise para aprovação' ? 'bg-blue-500/10 text-blue-600 border-blue-200' :
                                  p.status === 'Pausado' ? 'bg-red-500/10 text-red-600 border-red-200' :
                                  'bg-amber-500/10 text-amber-600 border-amber-200'
                                }`}
                              >
                                <option value="Planejado">Planejado</option>
                                <option value="Em analise para aprovação">Em análise para aprovação</option>
                                <option value="Aprovado">Aprovado</option>
                                <option value="Pausado">Pausado</option>
                              </select>
                              <button onClick={() => deletePostDia(planejamentoId, activeCliente.id, dia, p.id)} className="w-6 h-6 ml-2 flex items-center justify-center rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        {showPostForm === dia ? (
                          <div className="bg-white border border-[#8B5CF6]/30 rounded-xl p-4 shadow-sm">
                            <input value={postData.titulo} onChange={e => setPostData({...postData, titulo: e.target.value})} placeholder="Tema/Titulo do Post" className="w-full text-sm font-medium mb-2 focus:outline-none" />
                            <textarea value={postData.descricao} onChange={e => setPostData({...postData, descricao: e.target.value})} placeholder="Legenda ou ideias..." rows={2} className="w-full text-xs text-muted-foreground resize-none focus:outline-none mb-3" />
                            
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div className="flex items-center bg-secondary/30 border border-border rounded-lg px-2">
                                <ImageIcon className="w-3 h-3 text-muted-foreground mr-2 shrink-0" />
                                <input value={postData.imagemUrl} onChange={e => setPostData({...postData, imagemUrl: e.target.value})} placeholder="URL da Imagem..." className="w-full text-xs py-2 bg-transparent focus:outline-none" />
                              </div>
                              <div className="flex items-center bg-secondary/30 border border-border rounded-lg px-2">
                                <LinkIcon className="w-3 h-3 text-muted-foreground mr-2 shrink-0" />
                                <input value={postData.link} onChange={e => setPostData({...postData, link: e.target.value})} placeholder="Link do Video/Refs..." className="w-full text-xs py-2 bg-transparent focus:outline-none" />
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border/50">
                              <select value={postData.tipo} onChange={e => setPostData({...postData, tipo: e.target.value as any})} className="text-xs bg-secondary border-none rounded-md px-2 py-1">
                                <option>Post</option>
                                <option>Reels</option>
                                <option>Story</option>
                                <option>Carrossel</option>
                              </select>
                              <div className="flex gap-2">
                                <button onClick={() => setShowPostForm(null)} className="text-xs font-medium text-muted-foreground px-3 py-1.5 hover:bg-secondary rounded-lg">Cancelar</button>
                                <button onClick={() => handleAddPost(dia)} className="text-xs font-medium bg-[#8B5CF6] text-white px-3 py-1.5 rounded-lg hover:bg-[#7C3AED]">Salvar Post</button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setShowPostForm(dia)} className="w-full py-2.5 border-2 border-dashed border-border hover:border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/5 rounded-xl flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground hover:text-[#8B5CF6] transition-colors">
                            <Plus className="w-3.5 h-3.5" /> Adicionar Post
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
