"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

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
  tipoPlanejamento?: 'Previsto' | 'Demanda Extra';
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

function genId() {
  return Math.random().toString(36).substring(2, 9).toUpperCase();
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [execucoes, setExecucoes] = useState<Execucao[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [planejamentos, setPlanejamentos] = useState<Planejamento[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [configuracoes, setConfiguracoes] = useState<Configuracoes>({
    nome: "Usuário",
    email: "seu@email.com",
    agencia: "Minha Agência",
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

  // --- Eventos ---

  const addEvento = (e: Omit<Evento, "id" | "criadoEm">) => {
    setEventos((prev) => [{ ...e, id: genId(), criadoEm: new Date().toLocaleDateString("pt-BR") }, ...prev]);
  };
  const deleteEvento = (id: string) => setEventos(prev => prev.filter(ev => ev.id !== id));
  const updateConfiguracoes = (changes: Partial<Configuracoes>) => setConfiguracoes(prev => ({ ...prev, ...changes }));

  // --- Execucoes ---
  const addExecucao = (e: Omit<Execucao, "id" | "criadoEm" | "status" | "progresso">) => {
    setExecucoes((prev) => [{
      ...e, id: genId(), status: "Aguardando", progresso: 0,
      criadoEm: new Date().toLocaleDateString("pt-BR"),
    }, ...prev]);
  };

  const deleteExecucao = (id: string) => setExecucoes(prev => prev.filter(e => e.id !== id));

  const updateExecucao = (id: string, changes: Partial<Execucao>) => {
    setExecucoes((prev) => prev.map((e) => {
      if (e.id !== id) return e;
      const newStatus = changes.status ?? e.status;
      const progresso = changes.progresso !== undefined ? changes.progresso : STATUS_PROGRESS[newStatus as ExecucaoStatus] ?? e.progresso;
      return { ...e, ...changes, progresso };
    }));
  };

  // --- Projetos ---
  const addProjeto = (p: Omit<Projeto, "id" | "criadoEm" | "campanhas" | "inspiracoes">) => {
    setProjetos((prev) => [{ ...p, id: genId(), campanhas: [], inspiracoes: [], criadoEm: new Date().toLocaleDateString("pt-BR") }, ...prev]);
  };

  const addCampanha = (projetoId: string, c: Omit<Campanha, "id" | "criadoEm" | "posts">) => {
    setProjetos((prev) => prev.map((p) => p.id !== projetoId ? p : {
      ...p, campanhas: [{ ...c, id: genId(), posts: [], criadoEm: new Date().toLocaleDateString("pt-BR") }, ...p.campanhas],
    }));
  };

  const addPostCampanha = (projetoId: string, campanhaId: string, post: Omit<Post, "id" | "criadoEm">) => {
    setProjetos((prev) => prev.map((p) => p.id !== projetoId ? p : {
      ...p, campanhas: p.campanhas.map((c) => c.id !== campanhaId ? c : {
        ...c, posts: [{ ...post, id: genId(), criadoEm: new Date().toLocaleDateString("pt-BR") }, ...c.posts],
      }),
    }));
  };

  const updatePostCampanha = (projetoId: string, campanhaId: string, postId: string, changes: Partial<Post>) => {
    setProjetos((prev) => prev.map((p) => p.id !== projetoId ? p : {
      ...p, campanhas: p.campanhas.map((c) => c.id !== campanhaId ? c : {
        ...c, posts: c.posts.map((post) => post.id !== postId ? post : { ...post, ...changes }),
      }),
    }));
  };

  const deleteProjeto = (id: string) => setProjetos(prev => prev.filter(p => p.id !== id));

  const addInspiracao = (projetoId: string, i: Omit<Inspiracao, "id" | "criadoEm">) => {
    setProjetos((prev) => prev.map((p) => p.id !== projetoId ? p : {
      ...p, inspiracoes: [{ ...i, id: genId(), criadoEm: new Date().toLocaleDateString("pt-BR") }, ...p.inspiracoes],
    }));
  };

  // --- Metas ---
  const addMeta = (m: Omit<Meta, "id" | "criadoEm" | "progresso" | "updates">) => {
    setMetas((prev) => [{ ...m, id: genId(), progresso: 0, updates: [], criadoEm: new Date().toLocaleDateString("pt-BR") }, ...prev]);
  };

  const deleteMeta = (id: string) => setMetas(prev => prev.filter(m => m.id !== id));

  const updateMetaProgresso = (id: string, progresso: number, nota: string) => {
    setMetas((prev) => prev.map((m) => m.id !== id ? m : {
      ...m, progresso,
      updates: [{ data: new Date().toLocaleDateString("pt-BR"), progresso, nota }, ...m.updates],
    }));
  };

  // --- Planejamento ---
  const deletePlanejamento = (id: string) => setPlanejamentos(prev => prev.filter(p => p.id !== id));

  const addPlanejamento = (pl: Omit<Planejamento, "id" | "criadoEm" | "clientes">) => {
    setPlanejamentos((prev) => [{ ...pl, id: genId(), clientes: [], criadoEm: new Date().toLocaleDateString("pt-BR") }, ...prev]);
  };

  const addClientePlano = (planejamentoId: string, nome: string) => {
    setPlanejamentos((prev) => prev.map((pl) => pl.id !== planejamentoId ? pl : {
      ...pl, clientes: [...pl.clientes, { id: genId(), nome, postsPorDia: {} }],
    }));
  };

  const addPostDia = (planejamentoId: string, clienteId: string, data: string, post: Omit<PostDia, "id">) => {
    setPlanejamentos((prev) => prev.map((pl) => pl.id !== planejamentoId ? pl : {
      ...pl, clientes: pl.clientes.map((cl) => cl.id !== clienteId ? cl : {
        ...cl, postsPorDia: {
          ...cl.postsPorDia,
          [data]: [...(cl.postsPorDia[data] ?? []), { ...post, id: genId() }],
        },
      }),
    }));
  };

  const updatePostDia = (planejamentoId: string, clienteId: string, data: string, postId: string, changes: Partial<PostDia>) => {
    setPlanejamentos((prev) => prev.map((pl) => pl.id !== planejamentoId ? pl : {
      ...pl, clientes: pl.clientes.map((cl) => cl.id !== clienteId ? cl : {
        ...cl, postsPorDia: {
          ...cl.postsPorDia,
          [data]: (cl.postsPorDia[data] ?? []).map((p) => p.id !== postId ? p : { ...p, ...changes }),
        },
      }),
    }));
  };

    const deletePostDia = (planejamentoId: string, clienteId: string, data: string, postId: string) => {
    setPlanejamentos((prev) => prev.map((pl) => pl.id !== planejamentoId ? pl : {
      ...pl, clientes: pl.clientes.map((cl) => cl.id !== clienteId ? cl : {
        ...cl, postsPorDia: {
          ...cl.postsPorDia,
          [data]: (cl.postsPorDia[data] || []).filter(p => p.id !== postId)
        }
      })
    }));
  };

  return (
    <StoreContext.Provider value={{
      execucoes, projetos, metas, planejamentos, eventos,
      addEvento, deleteEvento,
      configuracoes, updateConfiguracoes,
      addExecucao, updateExecucao, deleteExecucao,
      addProjeto, addCampanha, addPostCampanha, updatePostCampanha, addInspiracao, deleteProjeto,
      addMeta, updateMetaProgresso, deleteMeta,
      addPlanejamento, addClientePlano, addPostDia, updatePostDia, deletePostDia, deletePlanejamento,
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
