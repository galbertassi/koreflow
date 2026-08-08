"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";

// --- Types ---
export type ExecucaoStatus = "Aguardando" | "Em producao" | "Revisao" | "Concluida" | "Em Risco";

export const STATUS_PROGRESS: Record<ExecucaoStatus, number> = {
  "Aguardando": 0,
  "Em producao": 40,
  "Revisao": 75,
  "Concluida": 100,
  "Em Risco": 20,
};

export const STATUS_COLORS: Record<ExecucaoStatus, string> = {
  "Aguardando": "bg-amber-500/10 text-amber-600 border-amber-200",
  "Em producao": "bg-blue-500/10 text-blue-600 border-blue-200",
  "Revisao": "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20",
  "Concluida": "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  "Em Risco": "bg-red-500/10 text-red-600 border-red-200",
};

export interface Evento {
  id: string;
  titulo: string;
  data: string;
  alarme: boolean;
  notificacao: boolean;
  criadoEm: string;
}


export interface Configuracoes {
  nome: string;
  email: string;
  foto?: string;
  agencia: string;
  tema: "Original" | "Dark" | "Cinza";
  notificacoes: {
    atraso: boolean;
    demandasExtras: boolean;
    resumoSemanal: boolean;
    atualizacoes: boolean;
  };
  ia: {
    chaveApi: string;
    tom: string;
  };
}

export interface Execucao {
  id: string;
  titulo: string;
  categoria: string;
  entrega: string;
  prioridade: string;
  status: ExecucaoStatus;
  progresso: number;
  criadoEm: string;
  tipoPlanejamento?: "Previsto" | "Demanda Extra";
}

export interface Post {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "Post" | "Reels" | "Story" | "Carrossel" | "Outro";
  status: "Ideia" | "Producao" | "Revisao" | "Aprovado" | "Publicado";
  link?: string;
  imagemUrl?: string;
  observacao?: string;
  data?: string;
  criadoEm: string;
}

export interface Campanha {
  id: string;
  nome: string;
  descricao: string;
  status: "Planejamento" | "Em andamento" | "Concluida";
  posts: Post[];
  criadoEm: string;
}

export interface Inspiracao {
  id: string;
  titulo: string;
  url?: string;
  nota?: string;
  criadoEm: string;
}

export interface Projeto {
  id: string;
  nome: string;
  cliente: string;
  inicio: string;
  fim: string;
  campanhas: Campanha[];
  inspiracoes: Inspiracao[];
  criadoEm: string;
}

export interface MetaUpdate {
  data: string;
  progresso: number;
  nota: string;
}

export interface Meta {
  id: string;
  titulo: string;
  valorAlvo?: string;
  progresso: number;
  prazo: string;
  updates: MetaUpdate[];
  criadoEm: string;
}

export interface PostDia {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "Post" | "Reels" | "Story" | "Carrossel" | "Outro";
  status: "Planejado" | "Producao" | "Em analise para aprovação" | "Aprovado" | "Publicado" | "Pausado";
  link?: string;
  imagemUrl?: string;
  observacao?: string;
}

export interface ClientePlano {
  id: string;
  nome: string;
  postsPorDia: Record<string, PostDia[]>; // key: "2025-06-15"
}

export interface Planejamento {
  id: string;
  nome: string;
  inicio: string;
  fim: string;
  clientes: ClientePlano[];
  criadoEm: string;
}

// --- Context ---
interface StoreContextType {
  execucoes: Execucao[];
  projetos: Projeto[];
  metas: Meta[];
  planejamentos: Planejamento[];
  eventos: Evento[];
  addEvento: (e: Omit<Evento, "id" | "criadoEm">) => void;
  deleteEvento: (id: string) => void;
  configuracoes: Configuracoes;
  updateConfiguracoes: (changes: Partial<Configuracoes>) => void;
  // Execucoes
  addExecucao: (e: Omit<Execucao, "id" | "criadoEm" | "status" | "progresso">) => void;
  updateExecucao: (id: string, changes: Partial<Execucao>) => void;
  deleteExecucao: (id: string) => void;
  // Projetos
  addProjeto: (p: Omit<Projeto, "id" | "criadoEm" | "campanhas" | "inspiracoes">) => void;
  addCampanha: (projetoId: string, c: Omit<Campanha, "id" | "criadoEm" | "posts">) => void;
  addPostCampanha: (projetoId: string, campanhaId: string, p: Omit<Post, "id" | "criadoEm">) => void;
  updatePostCampanha: (projetoId: string, campanhaId: string, postId: string, changes: Partial<Post>) => void;
  addInspiracao: (projetoId: string, i: Omit<Inspiracao, "id" | "criadoEm">) => void;
  deleteProjeto: (id: string) => void;
  // Metas
  addMeta: (m: Omit<Meta, "id" | "criadoEm" | "progresso" | "updates">) => void;
  updateMetaProgresso: (id: string, progresso: number, nota: string) => void;
  deleteMeta: (id: string) => void;
  // Planejamento
  addPlanejamento: (pl: Omit<Planejamento, "id" | "criadoEm" | "clientes">) => void;
  addClientePlano: (planejamentoId: string, nome: string) => void;
  addPostDia: (planejamentoId: string, clienteId: string, data: string, post: Omit<PostDia, "id">) => void;
  updatePostDia: (planejamentoId: string, clienteId: string, data: string, postId: string, changes: Partial<PostDia>) => void;
  deletePostDia: (planejamentoId: string, clienteId: string, data: string, postId: string) => void;
  deletePlanejamento: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);

  const [execucoes, setExecucoes] = useState<Execucao[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [planejamentos, setPlanejamentos] = useState<Planejamento[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [configuracoes, setConfiguracoes] = useState<Configuracoes>({
    nome: "Carregando...",
    email: "",
    agencia: "Carregando...",
    tema: "Original",
    notificacoes: {
      atraso: true,
      demandasExtras: true,
      resumoSemanal: true,
      atualizacoes: false,
    },
    ia: {
      chaveApi: "",
      tom: "Profissional e direto",
    }
  });

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Load Configuracoes
      const { data: configData } = await supabase.from('kore_configuracoes').select('*').eq('user_id', user.id).single();
      if (configData) {
        setConfiguracoes({
          nome: configData.nome,
          email: configData.email,
          agencia: configData.agencia,
          tema: configData.tema as "Original" | "Dark" | "Cinza",
          foto: configData.foto,
          notificacoes: configData.notificacoes,
          ia: configData.ia
        });
      } else {
        // Init default settings if missing
        await supabase.from('kore_configuracoes').insert({
          user_id: user.id,
          nome: user.user_metadata?.full_name || "Usuário",
          email: user.email,
          agencia: "Minha Agência",
          tema: "Original"
        });
      }

      // Load Execucoes
      const { data: execData } = await supabase.from('kore_execucoes').select('*').eq('user_id', user.id).order('criado_em', { ascending: false });
      if (execData) {
        setExecucoes(execData.map((e: any) => ({
          id: e.id,
          titulo: e.titulo,
          categoria: e.categoria,
          entrega: e.entrega,
          prioridade: e.prioridade,
          status: e.status as ExecucaoStatus,
          progresso: e.progresso,
          criadoEm: new Date(e.criado_em).toLocaleDateString("pt-BR"),
          tipoPlanejamento: e.tipo_planejamento
        })));
      }

      // Load Eventos
      const { data: eventData } = await supabase.from('kore_eventos').select('*').eq('user_id', user.id).order('data', { ascending: true });
      if (eventData) {
        setEventos(eventData.map((e: any) => ({
          id: e.id,
          titulo: e.titulo,
          data: new Date(e.data).toISOString().split('T')[0],
          alarme: e.alarme,
          notificacao: e.notificacao,
          criadoEm: new Date(e.criado_em).toLocaleDateString("pt-BR")
        })));
      }

      // Load Planejamentos
      const { data: planData } = await supabase.from('kore_planejamentos').select('*').eq('user_id', user.id).order('criado_em', { ascending: false });
      if (planData) {
        setPlanejamentos(planData.map((p: any) => ({
          id: p.id,
          nome: p.nome,
          inicio: "2026-06-01",
          fim: "2026-06-30",
          clientes: p.clientes,
          criadoEm: new Date(p.criado_em).toLocaleDateString("pt-BR")
        })));
      }

      // Load Projetos with nested data
      const { data: projData } = await supabase.from('kore_projetos').select(`
        *,
        kore_campanhas (*, kore_posts (*)),
        kore_inspiracoes (*)
      `).eq('user_id', user.id).order('criado_em', { ascending: false });
      
      if (projData) {
        setProjetos(projData.map((p: any) => ({
          id: p.id,
          nome: p.nome,
          cliente: p.cliente,
          inicio: p.inicio,
          fim: p.fim,
          criadoEm: new Date(p.criado_em).toLocaleDateString("pt-BR"),
          inspiracoes: (p.kore_inspiracoes || []).map((i: any) => ({
             id: i.id,
             titulo: i.titulo,
             url: i.url,
             nota: i.nota,
             criadoEm: new Date(i.criado_em).toLocaleDateString("pt-BR")
          })),
          campanhas: (p.kore_campanhas || []).map((c: any) => ({
             id: c.id,
             nome: c.nome,
             descricao: c.descricao,
             status: c.status,
             criadoEm: new Date(c.criado_em).toLocaleDateString("pt-BR"),
             posts: (c.kore_posts || []).map((post: any) => ({
               id: post.id,
               titulo: post.titulo,
               descricao: post.descricao,
               tipo: post.tipo,
               status: post.status,
               link: post.link,
               imagemUrl: post.imagem_url,
               observacao: post.observacao,
               data: post.data,
               criadoEm: new Date(post.criado_em).toLocaleDateString("pt-BR")
             }))
          }))
        })));
      }
    }
    loadData();
  }, []);

  // --- Eventos ---
  const addEvento = async (e: Omit<Evento, "id" | "criadoEm">) => {
    if (!userId) return;
    const { data, error } = await supabase.from('kore_eventos').insert({
      user_id: userId,
      titulo: e.titulo,
      data: e.data,
      alarme: e.alarme,
      notificacao: e.notificacao
    }).select().single();

    if (data && !error) {
      setEventos(prev => [{ ...e, id: data.id, criadoEm: new Date(data.criado_em).toLocaleDateString("pt-BR") }, ...prev]);
    }
  };

  const deleteEvento = async (id: string) => {
    await supabase.from('kore_eventos').delete().eq('id', id);
    setEventos(prev => prev.filter(ev => ev.id !== id));
  };

  const updateConfiguracoes = async (changes: Partial<Configuracoes>) => {
    if (!userId) return;
    const newConfig = { ...configuracoes, ...changes };
    setConfiguracoes(newConfig);
    await supabase.from('kore_configuracoes').update({
      nome: newConfig.nome,
      agencia: newConfig.agencia,
      tema: newConfig.tema,
      foto: newConfig.foto,
      notificacoes: newConfig.notificacoes,
      ia: newConfig.ia
    }).eq('user_id', userId);
  };

  // --- Execucoes ---
  const addExecucao = async (e: Omit<Execucao, "id" | "criadoEm" | "status" | "progresso">) => {
    if (!userId) return;
    const { data, error } = await supabase.from('kore_execucoes').insert({
      user_id: userId,
      titulo: e.titulo,
      categoria: e.categoria,
      entrega: e.entrega,
      prioridade: e.prioridade,
      tipo_planejamento: e.tipoPlanejamento,
      status: "Aguardando",
      progresso: 0
    }).select().single();

    if (data && !error) {
      setExecucoes(prev => [{
        ...e, id: data.id, status: "Aguardando", progresso: 0,
        criadoEm: new Date(data.criado_em).toLocaleDateString("pt-BR"),
      }, ...prev]);
    }
  };

  const deleteExecucao = async (id: string) => {
    await supabase.from('kore_execucoes').delete().eq('id', id);
    setExecucoes(prev => prev.filter(e => e.id !== id));
  };

  const updateExecucao = async (id: string, changes: Partial<Execucao>) => {
    setExecucoes((prev) => prev.map((e) => {
      if (e.id !== id) return e;
      const newStatus = changes.status ?? e.status;
      const progresso = changes.progresso !== undefined ? changes.progresso : STATUS_PROGRESS[newStatus as ExecucaoStatus] ?? e.progresso;
      return { ...e, ...changes, progresso };
    }));

    // Find new values
    const e = execucoes.find(x => x.id === id);
    if (!e) return;
    const newStatus = changes.status ?? e.status;
    const progresso = changes.progresso !== undefined ? changes.progresso : STATUS_PROGRESS[newStatus as ExecucaoStatus] ?? e.progresso;

    await supabase.from('kore_execucoes').update({
      titulo: changes.titulo ?? e.titulo,
      categoria: changes.categoria ?? e.categoria,
      entrega: changes.entrega ?? e.entrega,
      prioridade: changes.prioridade ?? e.prioridade,
      status: newStatus,
      progresso: progresso
    }).eq('id', id);
  };

  // --- Projetos ---
  const addProjeto = async (p: Omit<Projeto, "id" | "criadoEm" | "campanhas" | "inspiracoes">) => {
    if (!userId) return;
    const { data, error } = await supabase.from('kore_projetos').insert({
      user_id: userId,
      nome: p.nome,
      cliente: p.cliente,
      inicio: p.inicio,
      fim: p.fim
    }).select().single();

    if (data && !error) {
      setProjetos(prev => [{ ...p, id: data.id, campanhas: [], inspiracoes: [], criadoEm: new Date(data.criado_em).toLocaleDateString("pt-BR") }, ...prev]);
    }
  };

  const addCampanha = async (projetoId: string, c: Omit<Campanha, "id" | "criadoEm" | "posts">) => {
    if (!userId) return;
    const { data, error } = await supabase.from('kore_campanhas').insert({
      user_id: userId,
      projeto_id: projetoId,
      nome: c.nome,
      descricao: c.descricao,
      status: c.status
    }).select().single();

    if (data && !error) {
      setProjetos(prev => prev.map((p) => p.id !== projetoId ? p : {
        ...p, campanhas: [{ ...c, id: data.id, posts: [], criadoEm: new Date(data.criado_em).toLocaleDateString("pt-BR") }, ...p.campanhas],
      }));
    }
  };

  const addPostCampanha = async (projetoId: string, campanhaId: string, post: Omit<Post, "id" | "criadoEm">) => {
    if (!userId) return;
    const { data, error } = await supabase.from('kore_posts').insert({
      user_id: userId,
      campanha_id: campanhaId,
      titulo: post.titulo,
      descricao: post.descricao,
      tipo: post.tipo,
      status: post.status,
      link: post.link,
      imagem_url: post.imagemUrl,
      observacao: post.observacao,
      data: post.data
    }).select().single();

    if (data && !error) {
      setProjetos(prev => prev.map((p) => p.id !== projetoId ? p : {
        ...p, campanhas: p.campanhas.map(c => c.id !== campanhaId ? c : {
          ...c, posts: [{ ...post, id: data.id, criadoEm: new Date(data.criado_em).toLocaleDateString("pt-BR") }, ...c.posts]
        })
      }));
    }
  };

  const updatePostCampanha = async (projetoId: string, campanhaId: string, postId: string, changes: Partial<Post>) => {
    setProjetos(prev => prev.map(p => p.id !== projetoId ? p : {
      ...p, campanhas: p.campanhas.map(c => c.id !== campanhaId ? c : {
        ...c, posts: c.posts.map(post => post.id !== postId ? post : { ...post, ...changes })
      })
    }));

    await supabase.from('kore_posts').update({
      titulo: changes.titulo,
      descricao: changes.descricao,
      tipo: changes.tipo,
      status: changes.status,
      link: changes.link,
      imagem_url: changes.imagemUrl,
      observacao: changes.observacao,
      data: changes.data
    }).eq('id', postId);
  };

  const addInspiracao = async (projetoId: string, i: Omit<Inspiracao, "id" | "criadoEm">) => {
    if (!userId) return;
    const { data, error } = await supabase.from('kore_inspiracoes').insert({
      user_id: userId,
      projeto_id: projetoId,
      titulo: i.titulo,
      url: i.url,
      nota: i.nota
    }).select().single();

    if (data && !error) {
      setProjetos(prev => prev.map(p => p.id !== projetoId ? p : {
        ...p, inspiracoes: [{ ...i, id: data.id, criadoEm: new Date(data.criado_em).toLocaleDateString("pt-BR") }, ...p.inspiracoes]
      }));
    }
  };

  const deleteProjeto = async (id: string) => {
    await supabase.from('kore_projetos').delete().eq('id', id);
    setProjetos(prev => prev.filter(p => p.id !== id));
  };

  // --- Metas ---
  const addMeta = (m: Omit<Meta, "id" | "criadoEm" | "progresso" | "updates">) => {
    setMetas(prev => [{ ...m, id: "m" + Date.now(), progresso: 0, updates: [], criadoEm: new Date().toLocaleDateString("pt-BR") }, ...prev]);
  };
  const updateMetaProgresso = (id: string, progresso: number, nota: string) => {
    setMetas(prev => prev.map(m => m.id !== id ? m : {
      ...m, progresso, updates: [{ data: new Date().toLocaleDateString("pt-BR"), progresso, nota }, ...m.updates]
    }));
  };
  const deleteMeta = (id: string) => setMetas(prev => prev.filter(m => m.id !== id));

  // --- Planejamento ---
  const savePlanejamentos = async (newPlans: Planejamento[]) => {
    setPlanejamentos(newPlans);
    // Since we update deep nested JSON for planejamentos, it's easier to just update the row if we know the ID
    // For simplicity, find the one that changed and update it
  };

  const addPlanejamento = async (pl: Omit<Planejamento, "id" | "criadoEm" | "clientes">) => {
    if (!userId) return;
    const { data, error } = await supabase.from('kore_planejamentos').insert({
      user_id: userId,
      nome: pl.nome,
      clientes: []
    }).select().single();

    if (data && !error) {
      setPlanejamentos(prev => [{ ...pl, id: data.id, clientes: [], criadoEm: new Date(data.criado_em).toLocaleDateString("pt-BR") }, ...prev]);
    }
  };

  const updatePlanInDb = async (plan: Planejamento) => {
    await supabase.from('kore_planejamentos').update({
      nome: plan.nome,
      clientes: plan.clientes
    }).eq('id', plan.id);
  };

  const addClientePlano = (planejamentoId: string, nome: string) => {
    setPlanejamentos(prev => {
      const newPlans = prev.map(p => p.id !== planejamentoId ? p : {
        ...p, clientes: [...p.clientes, { id: "c" + Date.now(), nome, postsPorDia: {} }]
      });
      const updatedPlan = newPlans.find(p => p.id === planejamentoId);
      if (updatedPlan) updatePlanInDb(updatedPlan);
      return newPlans;
    });
  };

  const addPostDia = (planejamentoId: string, clienteId: string, data: string, post: Omit<PostDia, "id">) => {
    setPlanejamentos(prev => {
      const newPlans = prev.map(p => p.id !== planejamentoId ? p : {
        ...p, clientes: p.clientes.map(c => c.id !== clienteId ? c : {
          ...c, postsPorDia: {
            ...c.postsPorDia,
            [data]: [...(c.postsPorDia[data] || []), { ...post, id: "pd" + Date.now() }]
          }
        })
      });
      const updatedPlan = newPlans.find(p => p.id === planejamentoId);
      if (updatedPlan) updatePlanInDb(updatedPlan);
      return newPlans;
    });
  };

  const updatePostDia = (planejamentoId: string, clienteId: string, data: string, postId: string, changes: Partial<PostDia>) => {
    setPlanejamentos(prev => {
      const newPlans = prev.map(p => p.id !== planejamentoId ? p : {
        ...p, clientes: p.clientes.map(c => c.id !== clienteId ? c : {
          ...c, postsPorDia: {
            ...c.postsPorDia,
            [data]: (c.postsPorDia[data] || []).map(post => post.id !== postId ? post : { ...post, ...changes })
          }
        })
      });
      const updatedPlan = newPlans.find(p => p.id === planejamentoId);
      if (updatedPlan) updatePlanInDb(updatedPlan);
      return newPlans;
    });
  };

  const deletePostDia = (planejamentoId: string, clienteId: string, data: string, postId: string) => {
    setPlanejamentos(prev => {
      const newPlans = prev.map(p => p.id !== planejamentoId ? p : {
        ...p, clientes: p.clientes.map(c => c.id !== clienteId ? c : {
          ...c, postsPorDia: {
            ...c.postsPorDia,
            [data]: (c.postsPorDia[data] || []).filter(post => post.id !== postId)
          }
        })
      });
      const updatedPlan = newPlans.find(p => p.id === planejamentoId);
      if (updatedPlan) updatePlanInDb(updatedPlan);
      return newPlans;
    });
  };

  const deletePlanejamento = async (id: string) => {
    await supabase.from('kore_planejamentos').delete().eq('id', id);
    setPlanejamentos(prev => prev.filter(p => p.id !== id));
  };

  return (
    <StoreContext.Provider value={{
      execucoes, projetos, metas, planejamentos, eventos, configuracoes,
      addEvento, deleteEvento, updateConfiguracoes,
      addExecucao, updateExecucao, deleteExecucao,
      addProjeto, addCampanha, addPostCampanha, updatePostCampanha, addInspiracao, deleteProjeto,
      addMeta, updateMetaProgresso, deleteMeta,
      addPlanejamento, addClientePlano, addPostDia, updatePostDia, deletePostDia, deletePlanejamento
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
