"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";

// --- Types ---
export type ExecucaoStatus = "Aguardando" | "Em producao" | "Revisao" | "Concluida" | "Em Risco";

export const STATUS_COLORS: Record<ExecucaoStatus, string> = {
  "Aguardando": "bg-amber-400/10 text-amber-500 border-amber-400/20",
  "Em producao": "bg-blue-400/10 text-blue-500 border-blue-400/20",
  "Revisao": "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20",
  "Concluida": "bg-emerald-400/10 text-emerald-500 border-emerald-400/20",
  "Em Risco": "bg-red-400/10 text-red-500 border-red-400/20",
};

export const STATUS_PROGRESS: Record<ExecucaoStatus, number> = {
  "Aguardando": 0,
  "Em producao": 30,
  "Revisao": 80,
  "Concluida": 100,
  "Em Risco": 50,
};

export interface Execucao {
  id: string;
  titulo: string;
  projetoId?: string;
  categoria: string;
  entrega: string;
  prioridade: string;
  data?: string;
  status: ExecucaoStatus | string;
  progresso: number;
  tipo_planejamento?: string;
  criadoEm: string;
}

export interface Post {
  id: string;
  titulo: string;
  status: "A fazer" | "Fazendo" | "Aprovacao" | "Feito";
  criadoEm: string;
}

export interface Campanha {
  id: string;
  titulo: string;
  posts: Post[];
  criadoEm: string;
}

export interface Inspiracao {
  id: string;
  link: string;
  descricao: string;
  criadoEm: string;
}

export interface Projeto {
  id: string;
  nome: string;
  status: "Ativo" | "Pausado" | "Concluido";
  campanhas: Campanha[];
  inspiracoes: Inspiracao[];
  criadoEm: string;
}

export interface MetaUpdate {
  data: string;
  progressoAnterior: number;
  progressoNovo: number;
  nota: string;
}

export interface Meta {
  id: string;
  titulo: string;
  progresso: number;
  prazo: string;
  updates: MetaUpdate[];
  criadoEm: string;
}

export interface Evento {
  id: string;
  titulo: string;
  data: string;
  hora: string;
  tipo: "Reuniao" | "Lembrete" | "Entrega";
  criadoEm: string;
}

export interface Configuracoes {
  nome: string;
  email: string;
  agencia: string;
  foto?: string;
  tema: "Original" | "Dark" | "Light";
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

export interface PostDia {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "Post" | "Reels" | "Story" | "Carrossel" | "Outro";
  status: "Planejado" | "Producao" | "Em analise para aprovação" | "Aprovado" | "Publicado" | "Pausado";
  link?: string;
  imagemUrl?: string;
}

export interface ClientePlano {
  id: string;
  nome: string;
  postsPorDia: Record<string, PostDia[]>;
}

export interface Planejamento {
  id: string;
  nome: string;
  inicio: string;
  fim: string;
  clientes: ClientePlano[];
  criadoEm: string;
}

interface StoreContextType {
  execucoes: Execucao[];
  projetos: Projeto[];
  metas: Meta[];
  planejamentos: Planejamento[];
  eventos: Evento[];
  addEvento: (e: Omit<Evento, "id" | "criadoEm">) => void;
  deleteEvento: (id: string) => void;
  configuracoes: Configuracoes;
  updateConfiguracoes: (changes: Partial<Configuracoes>) => Promise<void>;
  addExecucao: (e: Omit<Execucao, "id" | "criadoEm" | "status" | "progresso">) => void;
  updateExecucao: (id: string, changes: Partial<Execucao>) => void;
  deleteExecucao: (id: string) => void;
  addProjeto: (p: Omit<Projeto, "id" | "criadoEm" | "campanhas" | "inspiracoes">) => void;
  addCampanha: (projetoId: string, c: Omit<Campanha, "id" | "criadoEm" | "posts">) => void;
  addPostCampanha: (projetoId: string, campanhaId: string, p: Omit<Post, "id" | "criadoEm">) => void;
  updatePostCampanha: (projetoId: string, campanhaId: string, postId: string, changes: Partial<Post>) => void;
  addInspiracao: (projetoId: string, i: Omit<Inspiracao, "id" | "criadoEm">) => void;
  deleteProjeto: (id: string) => void;
  addMeta: (m: Omit<Meta, "id" | "criadoEm" | "progresso" | "updates">) => void;
  updateMetaProgresso: (id: string, progresso: number, nota: string) => void;
  deleteMeta: (id: string) => void;
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
    notificacoes: { atraso: true, demandasExtras: true, resumoSemanal: true, atualizacoes: false },
    ia: { chaveApi: "", tom: "Profissional e direto" }
  });

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Fallback to local storage if not logged in via Supabase
        const saved = localStorage.getItem("koreflow_data");
        if (saved) {
          try {
            const data = JSON.parse(saved);
            if (data.execucoes) setExecucoes(data.execucoes);
            if (data.projetos) setProjetos(data.projetos);
            if (data.metas) setMetas(data.metas);
            if (data.planejamentos) setPlanejamentos(data.planejamentos);
            if (data.eventos) setEventos(data.eventos);
            if (data.configuracoes) setConfiguracoes(prev => ({ ...prev, ...data.configuracoes }));
          } catch (e) {
            console.error("Failed to parse local storage", e);
          }
        } else {
          setConfiguracoes(prev => ({ ...prev, nome: "Visitante", agencia: "Visitante" }));
        }
        return;
      }
      
      setUserId(user.id);

      try {
        const { data: configData, error: configError } = await supabase.from('kore_configuracoes').select('*').eq('user_id', user.id).maybeSingle();
        if (configData) {
          setConfiguracoes({
            nome: configData.nome, email: configData.email, agencia: configData.agencia,
            tema: configData.tema as any, foto: configData.foto, notificacoes: configData.notificacoes, ia: configData.ia
          });
        } else {
          const defaultSettings = {
            user_id: user.id,
            nome: user.user_metadata?.full_name || "Seu Nome",
            email: user.email || "",
            agencia: "Sua Agência",
            notificacoes: { atraso: true, demandasExtras: true, resumoSemanal: true, atualizacoes: false },
            ia: { chaveApi: "", tom: "Profissional e direto" }
          };
          const { error: insertError } = await supabase.from('kore_configuracoes').insert(defaultSettings);
          // Mesmo se falhar (ex: tabelas não criadas ainda), libera o acesso no front-end:
          setConfiguracoes({
            nome: defaultSettings.nome, email: defaultSettings.email, agencia: defaultSettings.agencia,
            tema: "Original", notificacoes: defaultSettings.notificacoes, ia: defaultSettings.ia
          });
          if (insertError) {
             console.error("Failed to insert default settings (tabelas não existem?)", insertError);
          }
        }

        const { data: execData } = await supabase.from('kore_execucoes').select('*').eq('user_id', user.id).order('criado_em', { ascending: false });
        if (execData) {
          setExecucoes(execData.map(e => ({
            id: e.id, titulo: e.titulo, projetoId: e.projeto_id, categoria: e.categoria, entrega: e.entrega, prioridade: e.prioridade, tipo_planejamento: e.tipo_planejamento, data: e.data, status: e.status as any, progresso: e.progresso, criadoEm: e.criado_em
          })));
        }

        const { data: projData } = await supabase.from('kore_projetos').select('*').eq('user_id', user.id).order('criado_em', { ascending: false });
        if (projData) {
          setProjetos(projData.map(p => ({
            id: p.id, nome: p.nome, status: p.status as any, campanhas: p.campanhas, inspiracoes: p.inspiracoes, criadoEm: p.criado_em
          })));
        }

        const { data: metasData } = await supabase.from('kore_metas').select('*').eq('user_id', user.id).order('criado_em', { ascending: false });
        if (metasData) {
          setMetas(metasData.map(m => ({
            id: m.id, titulo: m.titulo, progresso: m.progresso, prazo: m.prazo, updates: m.updates, criadoEm: m.criado_em
          })));
        }

        const { data: planData } = await supabase.from('kore_planejamentos').select('*').eq('user_id', user.id).order('criado_em', { ascending: false });
        if (planData) {
          setPlanejamentos(planData.map(p => ({
            id: p.id, nome: p.nome, inicio: p.inicio, fim: p.fim, clientes: p.clientes, criadoEm: p.criado_em
          })));
        }
        
        const { data: eventData } = await supabase.from('kore_eventos').select('*').eq('user_id', user.id).order('criado_em', { ascending: false });
        if (eventData) {
          setEventos(eventData.map(e => ({
            id: e.id, titulo: e.titulo, data: e.data, hora: e.hora, tipo: e.tipo as any, criadoEm: e.criado_em
          })));
        }

      } catch (err) {
        console.error("Error loading data from Supabase:", err);
      }
    }

    loadData();
  }, [supabase]);

  // Sync to localStorage as fallback
  const saveStateLocal = (newState: any) => {
    if (userId) return; // Only use localstorage if NOT logged into supabase
    const current = JSON.parse(localStorage.getItem("koreflow_data") || "{}");
    localStorage.setItem("koreflow_data", JSON.stringify({ ...current, ...newState }));
  };

  const updateConfiguracoes = async (changes: Partial<Configuracoes>) => {
    const newConfig = { ...configuracoes, ...changes };
    setConfiguracoes(newConfig);
    
    if (userId) {
      const { error } = await supabase.from('kore_configuracoes').upsert({ 
        user_id: userId,
        nome: newConfig.nome, 
        email: newConfig.email || "",
        agencia: newConfig.agencia, 
        tema: newConfig.tema, 
        foto: newConfig.foto, 
        notificacoes: newConfig.notificacoes, 
        ia: newConfig.ia 
      }, { onConflict: 'user_id' });
      if (error) {
        console.error("UPSERT ERROR:", error);
        alert("Erro no Supabase ao salvar: " + error.message);
      }
    } else {
      saveStateLocal({ configuracoes: newConfig });
    }
  };

  const addEvento = async (e: Omit<Evento, "id" | "criadoEm">) => {
    const newEv = { ...e, id: crypto.randomUUID(), criadoEm: new Date().toISOString() };
    setEventos(prev => [...prev, newEv]);
    if (userId) {
      await supabase.from('kore_eventos').insert({
        id: newEv.id, user_id: userId, titulo: newEv.titulo, data: newEv.data, hora: newEv.hora, tipo: newEv.tipo, criado_em: newEv.criadoEm
      });
    } else saveStateLocal({ eventos: [...eventos, newEv] });
  };

  const deleteEvento = async (id: string) => {
    setEventos(prev => prev.filter(e => e.id !== id));
    if (userId) await supabase.from('kore_eventos').delete().eq('id', id);
    else saveStateLocal({ eventos: eventos.filter(e => e.id !== id) });
  };

  const addExecucao = async (e: Omit<Execucao, "id" | "criadoEm" | "status" | "progresso">) => {
    const newEx = { ...e, id: crypto.randomUUID(), status: "Pendente" as const, progresso: 0, criadoEm: new Date().toISOString() };
    setExecucoes(prev => [...prev, newEx]);
    
    if (userId) {
      await supabase.from('kore_execucoes').insert({
        id: newEx.id, user_id: userId, titulo: newEx.titulo, projeto_id: newEx.projetoId, categoria: newEx.categoria, entrega: newEx.entrega, prioridade: newEx.prioridade, tipo_planejamento: newEx.tipo_planejamento, data: newEx.data, status: newEx.status, progresso: newEx.progresso, criado_em: newEx.criadoEm
      });
    } else saveStateLocal({ execucoes: [...execucoes, newEx] });
  };

  const updateExecucao = async (id: string, changes: Partial<Execucao>) => {
    setExecucoes(prev => prev.map(e => e.id === id ? { ...e, ...changes } : e));
    if (userId) {
      const dbChanges: any = { ...changes };
      if (changes.projetoId) dbChanges.projeto_id = changes.projetoId;
      delete dbChanges.projetoId;
      await supabase.from('kore_execucoes').update(dbChanges).eq('id', id);
    } else saveStateLocal({ execucoes: execucoes.map(e => e.id === id ? { ...e, ...changes } : e) });
  };

  const deleteExecucao = async (id: string) => {
    setExecucoes(prev => prev.filter(e => e.id !== id));
    if (userId) await supabase.from('kore_execucoes').delete().eq('id', id);
    else saveStateLocal({ execucoes: execucoes.filter(e => e.id !== id) });
  };

  const addProjeto = async (p: Omit<Projeto, "id" | "criadoEm" | "campanhas" | "inspiracoes">) => {
    const newProj = { ...p, id: crypto.randomUUID(), campanhas: [], inspiracoes: [], criadoEm: new Date().toISOString() };
    setProjetos(prev => [...prev, newProj]);
    if (userId) {
      await supabase.from('kore_projetos').insert({
        id: newProj.id, user_id: userId, nome: newProj.nome, status: newProj.status, campanhas: [], inspiracoes: [], criado_em: newProj.criadoEm
      });
    } else saveStateLocal({ projetos: [...projetos, newProj] });
  };

  const addCampanha = async (projetoId: string, c: Omit<Campanha, "id" | "criadoEm" | "posts">) => {
    const newCamp = { ...c, id: crypto.randomUUID(), posts: [], criadoEm: new Date().toISOString() };
    const nextProjetos = projetos.map(p => p.id === projetoId ? { ...p, campanhas: [...p.campanhas, newCamp] } : p);
    setProjetos(nextProjetos);
    if (userId) {
      const proj = nextProjetos.find(p => p.id === projetoId);
      if (proj) await supabase.from('kore_projetos').update({ campanhas: proj.campanhas }).eq('id', projetoId);
    } else saveStateLocal({ projetos: nextProjetos });
  };

  const addPostCampanha = async (projetoId: string, campanhaId: string, p: Omit<Post, "id" | "criadoEm">) => {
    const newPost = { ...p, id: crypto.randomUUID(), criadoEm: new Date().toISOString() };
    const nextProjetos = projetos.map(proj => {
      if (proj.id !== projetoId) return proj;
      return { ...proj, campanhas: proj.campanhas.map(camp => camp.id === campanhaId ? { ...camp, posts: [...camp.posts, newPost] } : camp) };
    });
    setProjetos(nextProjetos);
    if (userId) {
      const proj = nextProjetos.find(p => p.id === projetoId);
      if (proj) await supabase.from('kore_projetos').update({ campanhas: proj.campanhas }).eq('id', projetoId);
    } else saveStateLocal({ projetos: nextProjetos });
  };

  const updatePostCampanha = async (projetoId: string, campanhaId: string, postId: string, changes: Partial<Post>) => {
    const nextProjetos = projetos.map(proj => {
      if (proj.id !== projetoId) return proj;
      return { ...proj, campanhas: proj.campanhas.map(camp => {
        if (camp.id !== campanhaId) return camp;
        return { ...camp, posts: camp.posts.map(post => post.id === postId ? { ...post, ...changes } : post) };
      })};
    });
    setProjetos(nextProjetos);
    if (userId) {
      const proj = nextProjetos.find(p => p.id === projetoId);
      if (proj) await supabase.from('kore_projetos').update({ campanhas: proj.campanhas }).eq('id', projetoId);
    } else saveStateLocal({ projetos: nextProjetos });
  };

  const addInspiracao = async (projetoId: string, i: Omit<Inspiracao, "id" | "criadoEm">) => {
    const newInsp = { ...i, id: crypto.randomUUID(), criadoEm: new Date().toISOString() };
    const nextProjetos = projetos.map(p => p.id === projetoId ? { ...p, inspiracoes: [...p.inspiracoes, newInsp] } : p);
    setProjetos(nextProjetos);
    if (userId) {
      const proj = nextProjetos.find(p => p.id === projetoId);
      if (proj) await supabase.from('kore_projetos').update({ inspiracoes: proj.inspiracoes }).eq('id', projetoId);
    } else saveStateLocal({ projetos: nextProjetos });
  };

  const deleteProjeto = async (id: string) => {
    setProjetos(prev => prev.filter(p => p.id !== id));
    if (userId) await supabase.from('kore_projetos').delete().eq('id', id);
    else saveStateLocal({ projetos: projetos.filter(p => p.id !== id) });
  };

  const addMeta = async (m: Omit<Meta, "id" | "criadoEm" | "progresso" | "updates">) => {
    const newMeta = { ...m, id: crypto.randomUUID(), progresso: 0, updates: [], criadoEm: new Date().toISOString() };
    setMetas(prev => [...prev, newMeta]);
    if (userId) {
      await supabase.from('kore_metas').insert({
        id: newMeta.id, user_id: userId, titulo: newMeta.titulo, progresso: newMeta.progresso, prazo: newMeta.prazo, updates: [], criado_em: newMeta.criadoEm
      });
    } else saveStateLocal({ metas: [...metas, newMeta] });
  };

  const updateMetaProgresso = async (id: string, progresso: number, nota: string) => {
    const nextMetas = metas.map(m => {
      if (m.id === id) {
        return { ...m, progresso, updates: [...m.updates, { data: new Date().toISOString(), progressoAnterior: m.progresso, progressoNovo: progresso, nota }] };
      }
      return m;
    });
    setMetas(nextMetas);
    if (userId) {
      const m = nextMetas.find(x => x.id === id);
      if (m) await supabase.from('kore_metas').update({ progresso: m.progresso, updates: m.updates }).eq('id', id);
    } else saveStateLocal({ metas: nextMetas });
  };

  const deleteMeta = async (id: string) => {
    setMetas(prev => prev.filter(m => m.id !== id));
    if (userId) await supabase.from('kore_metas').delete().eq('id', id);
    else saveStateLocal({ metas: metas.filter(m => m.id !== id) });
  };

  const addPlanejamento = async (pl: Omit<Planejamento, "id" | "criadoEm" | "clientes">) => {
    const newPl = { ...pl, id: crypto.randomUUID(), clientes: [], criadoEm: new Date().toISOString() };
    setPlanejamentos(prev => [...prev, newPl]);
    if (userId) {
      await supabase.from('kore_planejamentos').insert({
        id: newPl.id, user_id: userId, nome: newPl.nome, inicio: newPl.inicio, fim: newPl.fim, clientes: [], criado_em: newPl.criadoEm
      });
    } else saveStateLocal({ planejamentos: [...planejamentos, newPl] });
  };

  const addClientePlano = async (planejamentoId: string, nome: string) => {
    const newCliente: ClientePlano = { id: crypto.randomUUID(), nome, postsPorDia: {} };
    const nextPlans = planejamentos.map(pl => pl.id === planejamentoId ? { ...pl, clientes: [...pl.clientes, newCliente] } : pl);
    setPlanejamentos(nextPlans);
    if (userId) {
      const p = nextPlans.find(x => x.id === planejamentoId);
      if (p) await supabase.from('kore_planejamentos').update({ clientes: p.clientes }).eq('id', planejamentoId);
    } else saveStateLocal({ planejamentos: nextPlans });
  };

  const addPostDia = async (planejamentoId: string, clienteId: string, data: string, post: Omit<PostDia, "id">) => {
    const newPost = { ...post, id: crypto.randomUUID() };
    const nextPlans = planejamentos.map(pl => {
      if (pl.id !== planejamentoId) return pl;
      return { ...pl, clientes: pl.clientes.map(cl => {
        if (cl.id !== clienteId) return cl;
        return { ...cl, postsPorDia: { ...cl.postsPorDia, [data]: [...(cl.postsPorDia[data] || []), newPost] } };
      })};
    });
    setPlanejamentos(nextPlans);
    if (userId) {
      const p = nextPlans.find(x => x.id === planejamentoId);
      if (p) await supabase.from('kore_planejamentos').update({ clientes: p.clientes }).eq('id', planejamentoId);
    } else saveStateLocal({ planejamentos: nextPlans });
  };

  const updatePostDia = async (planejamentoId: string, clienteId: string, data: string, postId: string, changes: Partial<PostDia>) => {
    const nextPlans = planejamentos.map(pl => {
      if (pl.id !== planejamentoId) return pl;
      return { ...pl, clientes: pl.clientes.map(cl => {
        if (cl.id !== clienteId) return cl;
        return { ...cl, postsPorDia: { ...cl.postsPorDia, [data]: (cl.postsPorDia[data] || []).map(p => p.id === postId ? { ...p, ...changes } : p) } };
      })};
    });
    setPlanejamentos(nextPlans);
    if (userId) {
      const p = nextPlans.find(x => x.id === planejamentoId);
      if (p) await supabase.from('kore_planejamentos').update({ clientes: p.clientes }).eq('id', planejamentoId);
    } else saveStateLocal({ planejamentos: nextPlans });
  };

  const deletePostDia = async (planejamentoId: string, clienteId: string, data: string, postId: string) => {
    const nextPlans = planejamentos.map(pl => {
      if (pl.id !== planejamentoId) return pl;
      return { ...pl, clientes: pl.clientes.map(cl => {
        if (cl.id !== clienteId) return cl;
        return { ...cl, postsPorDia: { ...cl.postsPorDia, [data]: (cl.postsPorDia[data] || []).filter(p => p.id !== postId) } };
      })};
    });
    setPlanejamentos(nextPlans);
    if (userId) {
      const p = nextPlans.find(x => x.id === planejamentoId);
      if (p) await supabase.from('kore_planejamentos').update({ clientes: p.clientes }).eq('id', planejamentoId);
    } else saveStateLocal({ planejamentos: nextPlans });
  };

  const deletePlanejamento = async (id: string) => {
    setPlanejamentos(prev => prev.filter(pl => pl.id !== id));
    if (userId) await supabase.from('kore_planejamentos').delete().eq('id', id);
    else saveStateLocal({ planejamentos: planejamentos.filter(pl => pl.id !== id) });
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
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}






