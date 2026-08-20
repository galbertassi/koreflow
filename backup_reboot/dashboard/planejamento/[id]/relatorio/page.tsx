"use client";

import { useStore } from "@/hooks/use-store";
import { ArrowLeft, Download, Link as LinkIcon, CalendarDays, ExternalLink, Image as ImageIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function PlanejamentoRelatorioPage() {
  const params = useParams();
  const router = useRouter();
  const { planejamentos, updatePostDia } = useStore();

  const planejamentoId = params.id as string;
  const pl = planejamentos.find(p => p.id === planejamentoId);

  if (!pl) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground">Ciclo nao encontrado.</p>
        <button onClick={() => router.push("/planejamento")} className="mt-4 text-[#8B5CF6] hover:underline">Voltar</button>
      </div>
    );
  }

  // Coleta todos os posts de todos os clientes
  const postsAgrupados = pl.clientes.map(cliente => {
    const postsList: any[] = [];
    Object.keys(cliente.postsPorDia).forEach(dia => {
      cliente.postsPorDia[dia].forEach(p => {
        postsList.push({ ...p, dia, clienteNome: cliente.nome });
      });
    });
    return { cliente, posts: postsList.sort((a, b) => a.dia.localeCompare(b.dia)) };
  }).filter(c => c.posts.length > 0);

  return (
    <div className="flex flex-col min-h-full pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-xl border border-border/50 bg-white hover:bg-secondary/20 transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Relatorio de Aprovacao</h1>
            <p className="text-sm text-muted-foreground mt-1">Ciclo: {pl.nome} ({pl.inicio} a {pl.fim})</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border hover:bg-secondary/20 text-foreground rounded-xl text-sm font-medium transition-colors shadow-sm">
            <LinkIcon className="w-4 h-4" /> Copiar Link Publico
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Exportar PDF
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-12">
        {postsAgrupados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-border py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <CalendarDays className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold mb-2">Nenhum post agendado</h3>
            <p className="text-sm text-muted-foreground max-w-xs">Adicione posts na visao do calendario para gerar o relatorio de aprovacao.</p>
          </div>
        ) : (
          postsAgrupados.map(({ cliente, posts }) => (
            <div key={cliente.id} className="bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm">
              <div className="bg-secondary/30 px-6 py-4 border-b border-border/50">
                <h2 className="text-lg font-semibold text-foreground">{cliente.nome}</h2>
                <p className="text-sm text-muted-foreground">{posts.length} posts programados</p>
              </div>
              
              <div className="p-6 space-y-8">
                {posts.map(post => (
                  <div key={post.id} className="flex gap-6 border-b border-border/50 pb-8 last:border-0 last:pb-0">
                    {/* Imagem */}
                    <div className="w-40 h-40 bg-secondary/50 rounded-xl border border-border flex items-center justify-center shrink-0 relative overflow-hidden group">
                      {post.imagemUrl ? (
                        <img src={post.imagemUrl} alt={post.titulo} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                      )}
                    </div>

                    {/* Detalhes */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider">{post.dia}</span>
                        <span className="w-1 h-1 rounded-full bg-border"></span>
                        <span className="text-xs font-bold text-muted-foreground uppercase">{post.tipo}</span>
                        <span className={`ml-auto text-[10px] font-medium px-2.5 py-1 rounded-md border ${
                          post.status === 'Aprovado' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' :
                          post.status === 'Producao' ? 'bg-blue-500/10 text-blue-600 border-blue-200' :
                          'bg-amber-500/10 text-amber-600 border-amber-200'
                        }`}>{post.status}</span>
                      </div>
                      
                      <h3 className="text-xl font-medium text-foreground mb-3">{post.titulo}</h3>
                      
                      <div className="bg-secondary/20 rounded-xl p-4 mb-4">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Legenda Proposta</h4>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{post.descricao || "Sem legenda."}</p>
                      </div>

                      
                      <div className="space-y-3 mt-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 relative">
                            <input 
                              type="text" 
                              defaultValue={post.link || ""}
                              onBlur={(e) => updatePostDia(planejamentoId, cliente.id, post.dia, post.id, { link: e.target.value })}
                              placeholder="Adicionar link de referencia..." 
                              className="w-full text-xs pl-3 pr-10 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/50" 
                            />
                            <ExternalLink className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="flex-1 relative">
                          <textarea 
                            defaultValue={post.observacao || ""}
                            onBlur={(e) => updatePostDia(planejamentoId, cliente.id, post.dia, post.id, { observacao: e.target.value })}
                            placeholder="Adicionar observações..." 
                            rows={2}
                            className="w-full text-xs p-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/50 resize-none" 
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
