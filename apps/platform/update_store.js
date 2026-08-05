const fs = require('fs');
let code = fs.readFileSync('src/hooks/use-store.tsx', 'utf8');

const replacement = `
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Execucao {
  id: string;
  titulo: string;
  projetoId: string;
  data: string;
  status: "Pendente" | "Em andamento" | "Concluido";
  progresso: number;
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
  updateConfiguracoes: (changes: Partial<Configuracoes>) => void;
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
  const [execucoes, setExecucoes] = useState<Execucao[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [planejamentos, setPlanejamentos] = useState<Planejamento[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [configuracoes, setConfiguracoes] = useState<Configuracoes>({
    nome: "Hellen",
    email: "hellen.rivello@hotmail.com",
    agencia: "KOREFLOW",
    tema: "Original",
    notificacoes: { atraso: true, demandasExtras: true, resumoSemanal: true, atualizacoes: false },
    ia: { chaveApi: "", tom: "Profissional e direto" }
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
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
    }
    setIsLoaded(true);
  }, []);

  const saveState = (newState: any) => {
    if (!isLoaded) return;
    const current = JSON.parse(localStorage.getItem("koreflow_data") || "{}");
    localStorage.setItem("koreflow_data", JSON.stringify({ ...current, ...newState }));
  };

  const updateConfiguracoes = (changes: Partial<Configuracoes>) => {
    setConfiguracoes(prev => {
      const next = { ...prev, ...changes };
      saveState({ configuracoes: next });
      return next;
    });
  };

  const addEvento = (e: Omit<Evento, "id" | "criadoEm">) => {
    const newEv = { ...e, id: crypto.randomUUID(), criadoEm: new Date().toISOString() };
    setEventos(prev => {
      const next = [...prev, newEv];
      saveState({ eventos: next });
      return next;
    });
  };

  const deleteEvento = (id: string) => {
    setEventos(prev => {
      const next = prev.filter(e => e.id !== id);
      saveState({ eventos: next });
      return next;
    });
  };

  const addExecucao = (e: Omit<Execucao, "id" | "criadoEm" | "status" | "progresso">) => {
    const newEx = { ...e, id: crypto.randomUUID(), status: "Pendente" as const, progresso: 0, criadoEm: new Date().toISOString() };
    setExecucoes(prev => {
      const next = [...prev, newEx];
      saveState({ execucoes: next });
      return next;
    });
  };

  const updateExecucao = (id: string, changes: Partial<Execucao>) => {
    setExecucoes(prev => {
      const next = prev.map(e => e.id === id ? { ...e, ...changes } : e);
      saveState({ execucoes: next });
      return next;
    });
  };

  const deleteExecucao = (id: string) => {
    setExecucoes(prev => {
      const next = prev.filter(e => e.id !== id);
      saveState({ execucoes: next });
      return next;
    });
  };

  const addProjeto = (p: Omit<Projeto, "id" | "criadoEm" | "campanhas" | "inspiracoes">) => {
    const newProj = { ...p, id: crypto.randomUUID(), campanhas: [], inspiracoes: [], criadoEm: new Date().toISOString() };
    setProjetos(prev => {
      const next = [...prev, newProj];
      saveState({ projetos: next });
      return next;
    });
  };

  const addCampanha = (projetoId: string, c: Omit<Campanha, "id" | "criadoEm" | "posts">) => {
    const newCamp = { ...c, id: crypto.randomUUID(), posts: [], criadoEm: new Date().toISOString() };
    setProjetos(prev => {
      const next = prev.map(p => p.id === projetoId ? { ...p, campanhas: [...p.campanhas, newCamp] } : p);
      saveState({ projetos: next });
      return next;
    });
  };

  const addPostCampanha = (projetoId: string, campanhaId: string, p: Omit<Post, "id" | "criadoEm">) => {
    const newPost = { ...p, id: crypto.randomUUID(), criadoEm: new Date().toISOString() };
    setProjetos(prev => {
      const next = prev.map(proj => {
        if (proj.id !== projetoId) return proj;
        return {
          ...proj,
          campanhas: proj.campanhas.map(camp => camp.id === campanhaId ? { ...camp, posts: [...camp.posts, newPost] } : camp)
        };
      });
      saveState({ projetos: next });
      return next;
    });
  };

  const updatePostCampanha = (projetoId: string, campanhaId: string, postId: string, changes: Partial<Post>) => {
    setProjetos(prev => {
      const next = prev.map(proj => {
        if (proj.id !== projetoId) return proj;
        return {
          ...proj,
          campanhas: proj.campanhas.map(camp => {
            if (camp.id !== campanhaId) return camp;
            return {
              ...camp,
              posts: camp.posts.map(post => post.id === postId ? { ...post, ...changes } : post)
            };
          })
        };
      });
      saveState({ projetos: next });
      return next;
    });
  };

  const addInspiracao = (projetoId: string, i: Omit<Inspiracao, "id" | "criadoEm">) => {
    const newInsp = { ...i, id: crypto.randomUUID(), criadoEm: new Date().toISOString() };
    setProjetos(prev => {
      const next = prev.map(p => p.id === projetoId ? { ...p, inspiracoes: [...p.inspiracoes, newInsp] } : p);
      saveState({ projetos: next });
      return next;
    });
  };

  const deleteProjeto = (id: string) => {
    setProjetos(prev => {
      const next = prev.filter(p => p.id !== id);
      saveState({ projetos: next });
      return next;
    });
  };

  const addMeta = (m: Omit<Meta, "id" | "criadoEm" | "progresso" | "updates">) => {
    const newMeta = { ...m, id: crypto.randomUUID(), progresso: 0, updates: [], criadoEm: new Date().toISOString() };
    setMetas(prev => {
      const next = [...prev, newMeta];
      saveState({ metas: next });
      return next;
    });
  };

  const updateMetaProgresso = (id: string, progresso: number, nota: string) => {
    setMetas(prev => {
      const next = prev.map(m => {
        if (m.id === id) {
          return {
            ...m,
            progresso,
            updates: [...m.updates, { data: new Date().toISOString(), progressoAnterior: m.progresso, progressoNovo: progresso, nota }]
          };
        }
        return m;
      });
      saveState({ metas: next });
      return next;
    });
  };

  const deleteMeta = (id: string) => {
    setMetas(prev => {
      const next = prev.filter(m => m.id !== id);
      saveState({ metas: next });
      return next;
    });
  };

  const addPlanejamento = (pl: Omit<Planejamento, "id" | "criadoEm" | "clientes">) => {
    const newPl = { ...pl, id: crypto.randomUUID(), clientes: [], criadoEm: new Date().toISOString() };
    setPlanejamentos(prev => {
      const next = [...prev, newPl];
      saveState({ planejamentos: next });
      return next;
    });
  };

  const addClientePlano = (planejamentoId: string, nome: string) => {
    const newCliente: ClientePlano = { id: crypto.randomUUID(), nome, postsPorDia: {} };
    setPlanejamentos(prev => {
      const next = prev.map(pl => pl.id === planejamentoId ? { ...pl, clientes: [...pl.clientes, newCliente] } : pl);
      saveState({ planejamentos: next });
      return next;
    });
  };

  const addPostDia = (planejamentoId: string, clienteId: string, data: string, post: Omit<PostDia, "id">) => {
    const newPost = { ...post, id: crypto.randomUUID() };
    setPlanejamentos(prev => {
      const next = prev.map(pl => {
        if (pl.id !== planejamentoId) return pl;
        return {
          ...pl,
          clientes: pl.clientes.map(cl => {
            if (cl.id !== clienteId) return cl;
            const currentPosts = cl.postsPorDia[data] || [];
            return {
              ...cl,
              postsPorDia: { ...cl.postsPorDia, [data]: [...currentPosts, newPost] }
            };
          })
        };
      });
      saveState({ planejamentos: next });
      return next;
    });
  };

  const updatePostDia = (planejamentoId: string, clienteId: string, data: string, postId: string, changes: Partial<PostDia>) => {
    setPlanejamentos(prev => {
      const next = prev.map(pl => {
        if (pl.id !== planejamentoId) return pl;
        return {
          ...pl,
          clientes: pl.clientes.map(cl => {
            if (cl.id !== clienteId) return cl;
            const currentPosts = cl.postsPorDia[data] || [];
            return {
              ...cl,
              postsPorDia: {
                ...cl.postsPorDia,
                [data]: currentPosts.map(p => p.id === postId ? { ...p, ...changes } : p)
              }
            };
          })
        };
      });
      saveState({ planejamentos: next });
      return next;
    });
  };

  const deletePostDia = (planejamentoId: string, clienteId: string, data: string, postId: string) => {
    setPlanejamentos(prev => {
      const next = prev.map(pl => {
        if (pl.id !== planejamentoId) return pl;
        return {
          ...pl,
          clientes: pl.clientes.map(cl => {
            if (cl.id !== clienteId) return cl;
            const currentPosts = cl.postsPorDia[data] || [];
            return {
              ...cl,
              postsPorDia: {
                ...cl.postsPorDia,
                [data]: currentPosts.filter(p => p.id !== postId)
              }
            };
          })
        };
      });
      saveState({ planejamentos: next });
      return next;
    });
  };

  const deletePlanejamento = (id: string) => {
    setPlanejamentos(prev => {
      const next = prev.filter(pl => pl.id !== id);
      saveState({ planejamentos: next });
      return next;
    });
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
`

fs.writeFileSync('src/hooks/use-store.tsx', replacement, 'utf8');
