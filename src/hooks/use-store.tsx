"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";
import { PLANS, PlanType } from "@/config/plans";
import { UpgradeModal } from "@/components/ui/UpgradeModal";

// --- Types ---
export type ExecucaoStatus = string;

export interface Etiqueta {
  id?: string;
  nome: string;
  cor: string;
}

export const DEFAULT_ETIQUETAS: Etiqueta[] = [
  { id: "1", nome: "Pendente", cor: "#9ca3af" }, // gray-400
  { id: "2", nome: "Em andamento", cor: "#0ea5e9" }, // sky-500
  { id: "3", nome: "Pausada", cor: "#f59e0b" }, // amber-500
  { id: "4", nome: "Em revisão", cor: "#a855f7" }, // purple-500
  { id: "5", nome: "Concluída", cor: "#10b981" }, // emerald-500
  { id: "6", nome: "Cancelada", cor: "#ef4444" }, // red-500
];

export const normalizeEtiquetas = (etiquetas: any[]) => {
  if (!etiquetas || !Array.isArray(etiquetas)) return DEFAULT_ETIQUETAS;
  return etiquetas.map((e: any) => {
    let nome = e.nome;
    if (nome.includes("Aprova") || nome.includes("Revisao")) nome = "Em revisão";
    if (nome.includes("início") || nome.includes("producao") || nome.includes("produção") || nome.includes("Andamento")) nome = "Em andamento";
    if (nome.includes("Concluida")) nome = "Concluída";
    if (nome.includes("Aguardando")) nome = "Pendente";
    if (nome.includes("Risco")) nome = "Cancelada";
    
    if (!e.cor || !e.cor.startsWith('#')) {
      const fallback = DEFAULT_ETIQUETAS.find(d => d.nome === nome);
      return { ...e, nome, cor: fallback ? fallback.cor : "#9ca3af" };
    }
    return { ...e, nome };
  });
};

export const STATUS_COLORS: Record<string, string> = DEFAULT_ETIQUETAS.reduce((acc, eq) => ({ ...acc, [eq.nome]: eq.cor }), {});

export const STATUS_PROGRESS: Record<string, number> = {
  "Pendente": 0,
  "Em andamento": 30,
  "Pausada": 30,
  "Em revisão": 80,
  "Concluída": 100,
  "Cancelada": 0,
};

export interface Execucao {
  id: string;
  titulo: string;
  projetoId?: string;
  cliente?: string;
  categoria: string;
  entrega: string;
  prioridade: string;
  data?: string;
  status: ExecucaoStatus | string;
  progresso: number;
  tipoPlanejamento?: string;
  observacao?: string;
  tempoGasto?: number; // em segundos
  timerStart?: number | null; // timestamp de inicio
  criadoEm: string;
}

export interface Post {
  id: string;
  titulo: string;
  descricao?: string;
  tipo?: string;
  status: "A fazer" | "Fazendo" | "Aprovacao" | "Feito" | "Ideia" | "Producao" | "Aprovado" | "Publicado";
  criadoEm: string;
  dataEntrega?: string;
  responsavel?: string;
}

export interface Campanha {
  id: string;
  nome: string;
  descricao?: string;
  status?: string;
  posts: Post[];
  criadoEm: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface Inspiracao {
  id: string;
  titulo: string;
  url: string;
  descricao: string;
  criadoEm: string;
}

export interface Projeto {
  id: string;
  nome: string;
  cliente?: string;
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

export interface AppNotification {
  id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  data: string;
  tipo: "Info" | "Aviso" | "Urgente";
  actionUrl?: string;
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
    demandOrder?: string[];
  };
  ia: {
    chaveApi: string;
    tom: string;
  };
  etiquetas: Etiqueta[];
}

export interface PostDia {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "Post" | "Reels" | "Story" | "Carrossel" | "Outro";
  status: "Planejado" | "Producao" | "Em analise para aprova├º├úo" | "Aprovado" | "Publicado" | "Pausado";
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
  appNotificacoes: AppNotification[];
  welcomeEnviado: boolean;
  setWelcomeEnviado: (v: boolean) => void;
  addNotificacao: (n: Omit<AppNotification, "id" | "data" | "lida">) => void;
  marcarNotificacaoComoLida: (id: string) => void;
  limparNotificacoes: () => void;
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
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  companyPlan: PlanType;
  companyUsage: { demandsCreated: number, minutesUsed: number };
  openUpgradeModal: () => void;
}

export const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const [execucoes, setExecucoes] = useState<Execucao[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [planejamentos, setPlanejamentos] = useState<Planejamento[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [appNotificacoes, setAppNotificacoes] = useState<AppNotification[]>([]);
  const [welcomeEnviado, setWelcomeEnviado] = useState(false);
  const [configuracoes, setConfiguracoes] = useState<Configuracoes>({
    nome: "Carregando...",
    email: "",
    agencia: "Carregando...",
    tema: "Original",
    notificacoes: { atraso: true, demandasExtras: true, resumoSemanal: true, atualizacoes: false, demandOrder: [] },
    ia: { chaveApi: "", tom: "Profissional e direto" },
    etiquetas: DEFAULT_ETIQUETAS
  });

  const [companyPlan, setCompanyPlan] = useState<PlanType>("Free");
  const [companyUsage, setCompanyUsage] = useState({ demandsCreated: 0, minutesUsed: 0 });
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const openUpgradeModal = () => setUpgradeModalOpen(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const saved = localStorage.getItem("koreflow_data");
        if (saved) {
          try {
            const data = JSON.parse(saved);
            if (data.execucoes) setExecucoes(data.execucoes);
            if (data.projetos) setProjetos(data.projetos);
            if (data.metas) setMetas(data.metas);
            if (data.planejamentos) setPlanejamentos(data.planejamentos);
            if (data.eventos) setEventos(data.eventos);
            if (data.appNotificacoes) setAppNotificacoes(data.appNotificacoes);
            if (data.welcomeEnviado !== undefined) setWelcomeEnviado(data.welcomeEnviado);
            if (data.configuracoes) {
              const conf = data.configuracoes;
              if (conf.etiquetas) {
                conf.etiquetas = normalizeEtiquetas(conf.etiquetas);
              }
              setConfiguracoes(prev => ({ ...prev, ...conf }));
            }
          } catch (e) {
            console.error("Failed to parse local storage", e);
          }
        } else {
          setConfiguracoes(prev => ({ ...prev, nome: "Visitante", agencia: "Visitante" }));
        }
        
        const usageData = JSON.parse(localStorage.getItem("koreflow_usage") || '{"demandsCreated": 0}');
        setCompanyUsage(usageData);
        return;
      }
      
      setUserId(user.id);

      try {
        const { data: configData, error: configError } = await supabase.from('kore_configuracoes').select('*').eq('user_id', user.id).maybeSingle();
        if (configData) {
          setConfiguracoes({
            nome: configData.nome, email: configData.email, agencia: configData.agencia,
            tema: configData.tema as any, foto: configData.foto, notificacoes: configData.notificacoes, ia: configData.ia,
            etiquetas: normalizeEtiquetas(configData.etiquetas)
          });
        } else {
        const { data: defaultSettings, error: insertError } = await supabase.from('kore_configuracoes').insert({
            user_id: user.id,
            nome: user.user_metadata?.full_name || "Seu Nome",
            email: user.email || "",
            notificacoes: { atraso: true, demandasExtras: true, resumoSemanal: true, atualizacoes: false, demandOrder: [] },
            ia: { chaveApi: "", tom: "Profissional e direto" },
            etiquetas: DEFAULT_ETIQUETAS
          }).select().single();
          
          if (defaultSettings) {
            setConfiguracoes({
              nome: defaultSettings.nome, email: defaultSettings.email, agencia: defaultSettings.agencia,
              tema: "Original", notificacoes: defaultSettings.notificacoes, ia: defaultSettings.ia, etiquetas: normalizeEtiquetas(defaultSettings.etiquetas)
            });
          }
          if (insertError) {
             console.error("Failed to insert default settings (tabelas n├úo existem?)", insertError);
          }
        }

        let { data: companyUser } = await supabase.from('kore_company_users').select('company_id').eq('user_id', user.id).maybeSingle();
        
        if (!companyUser) {
          const fullName = user.user_metadata?.full_name || user.email || "Usu├írio";
          const { error: rpcError } = await supabase.rpc("ensure_my_personal_workspace", { p_full_name: fullName });
          if (!rpcError) {
            const { data: retryUser } = await supabase.from('kore_company_users').select('company_id').eq('user_id', user.id).maybeSingle();
            companyUser = retryUser;
          }
        }

        if (companyUser) {
          setCompanyId(companyUser.company_id);
          const { data: company } = await supabase.from('kore_companies').select('plan, workspace_type, trial_ends_at').eq('id', companyUser.company_id).maybeSingle();
          if (company) {
             setCompanyPlan((company.plan as PlanType) || "Free");
          }

          const monthYear = new Date().toISOString().slice(0, 7);
          const { data: usage } = await supabase.from('kore_company_usage')
            .select('demands_created, minutes_used')
            .eq('company_id', companyUser.company_id)
            .eq('month_year', monthYear)
            .maybeSingle();
          
          if (usage) {
            setCompanyUsage({ 
              demandsCreated: usage.demands_created || 0,
              minutesUsed: usage.minutes_used || 0
            });
          }
        }

        const { data: execData } = await supabase.from('kore_execucoes').select('*').eq('user_id', user.id).order('criado_em', { ascending: false });
        if (execData) {
          setExecucoes(execData.map(e => ({
            id: e.id, titulo: e.titulo, projetoId: e.projeto_id, categoria: e.categoria, entrega: e.entrega, prioridade: e.prioridade, tipoPlanejamento: e.tipo_planejamento, data: e.data, status: e.status as any, progresso: e.progresso, observacao: e.observacao, tempoGasto: 0, timerStart: null, criadoEm: e.criado_em
          })));
        }

        const { data: projData } = await supabase.from('kore_projetos').select('*').eq('user_id', user.id).order('criado_em', { ascending: false });
        if (projData) {
          setProjetos(projData.map(p => ({
            id: p.id, nome: p.nome, cliente: p.cliente, status: p.status as any, campanhas: p.campanhas, inspiracoes: p.inspiracoes, criadoEm: p.criado_em
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

  const saveStateLocal = (newState: any) => {
    if (userId) return;
    const current = JSON.parse(localStorage.getItem("koreflow_data") || "{}");
    localStorage.setItem("koreflow_data", JSON.stringify({ ...current, ...newState }));
  };

  const saveNotificationsLocal = (newState: any) => {
    // Sempre salva notificações no localStorage, independente de userId
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
        tema: newConfig.tema, 
        foto: newConfig.foto, 
        notificacoes: newConfig.notificacoes, 
        ia: newConfig.ia,
        etiquetas: newConfig.etiquetas
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
    const limit = PLANS[companyPlan].maxDemandsPerMonth;
    const isFree = !PLANS[companyPlan].hasUnlimitedDemands;
    
    if (isFree && companyUsage.demandsCreated >= limit) {
      openUpgradeModal();
      setAppNotificacoes(prev => [{
        id: crypto.randomUUID(), titulo: "Limite de Demandas Atingido", 
        mensagem: "Você atingiu o limite do seu plano Free. Faça um upgrade para continuar criando novas demandas.",
        tipo: "Urgente", lida: false, data: new Date().toISOString(), actionUrl: "/vendas"
      }, ...prev]);
      return;
    }

    if (isFree && companyUsage.demandsCreated === Math.floor(limit * 0.8)) {
      setAppNotificacoes(prev => [{
        id: crypto.randomUUID(), titulo: "Atenção ao Limite!", 
        mensagem: `Você já usou ${Math.floor(limit * 0.8)} das suas ${limit} demandas gratuitas.`,
        tipo: "Aviso", lida: false, data: new Date().toISOString(), actionUrl: "/vendas"
      }, ...prev]);
    }

    const newEx = { ...e, id: crypto.randomUUID(), status: "Pendente" as const, progresso: 0, tempoGasto: 0, timerStart: null, criadoEm: new Date().toISOString() };
    setExecucoes(prev => [...prev, newEx]);
    
    const nextUsage = { ...companyUsage, demandsCreated: companyUsage.demandsCreated + 1 };
    setCompanyUsage(nextUsage);
    
    if (userId) {
      const { error: insertError } = await supabase.from('kore_execucoes').insert({
        id: newEx.id, user_id: userId, titulo: newEx.titulo, projeto_id: newEx.projetoId, categoria: newEx.categoria, entrega: newEx.entrega, prioridade: newEx.prioridade, tipo_planejamento: newEx.tipoPlanejamento, data: newEx.data, status: newEx.status, progresso: newEx.progresso, criado_em: newEx.criadoEm, observacao: newEx.observacao
      });
      if (insertError) {
        console.error("ERRO AO SALVAR EXECUCAO NO SUPABASE:", insertError);
      }
      if (companyId) {
        const monthYear = new Date().toISOString().slice(0, 7);
        await supabase.from('kore_company_usage').upsert({
          company_id: companyId,
          month_year: monthYear,
          demands_created: nextUsage.demandsCreated,
          minutes_used: nextUsage.minutesUsed || 0
        }, { onConflict: 'company_id,month_year' });
      }
    } else {
      saveStateLocal({ execucoes: [...execucoes, newEx] });
      localStorage.setItem("koreflow_usage", JSON.stringify(nextUsage));
    }
  };

  const updateExecucao = async (id: string, changes: Partial<Execucao>) => {
    if (changes.timerStart !== undefined && changes.timerStart !== null) {
      const limitMins = PLANS[companyPlan].maxMinutesPerMonth;
      const isFree = !PLANS[companyPlan].hasUnlimitedDemands;
      if (isFree && companyUsage.minutesUsed >= limitMins) {
        openUpgradeModal();
        setAppNotificacoes(n => [{
          id: crypto.randomUUID(), titulo: "Limite de Tempo Atingido", 
          mensagem: "Você atingiu o limite de 10 horas do seu plano Free. Faça um upgrade para continuar registrando tempo.",
          tipo: "Urgente", lida: false, data: new Date().toISOString(), actionUrl: "/vendas"
        }, ...n]);
        return; // Bloqueia o início do timer
      }
    }

    let deltaMinutes = 0;
    setExecucoes(prev => prev.map(e => {
      if (e.id === id) {
        if (changes.tempoGasto !== undefined && changes.tempoGasto > (e.tempoGasto || 0)) {
          deltaMinutes = (changes.tempoGasto - (e.tempoGasto || 0)) / 60;
        }
        return { ...e, ...changes };
      }
      return e;
    }));

    if (deltaMinutes > 0) {
      const prevUsage = companyUsage;
      const nextUsage = { ...prevUsage, minutesUsed: (prevUsage.minutesUsed || 0) + deltaMinutes };
      const limitMins = PLANS[companyPlan].maxMinutesPerMonth;
      const isFree = !PLANS[companyPlan].hasUnlimitedDemands;
      
      setCompanyUsage(nextUsage);
      
      if (isFree && nextUsage.minutesUsed >= limitMins && prevUsage.minutesUsed < limitMins) {
        setAppNotificacoes(n => [{
          id: crypto.randomUUID(), titulo: "Limite de Tempo Atingido", 
          mensagem: "Você atingiu o limite de 10 horas do seu plano Free. Faça um upgrade para continuar registrando tempo.",
          tipo: "Urgente", lida: false, data: new Date().toISOString(), actionUrl: "/vendas"
        }, ...n]);
      }
      
      if (isFree && nextUsage.minutesUsed >= (limitMins * 0.8) && prevUsage.minutesUsed < (limitMins * 0.8)) {
        setAppNotificacoes(n => [{
          id: crypto.randomUUID(), titulo: "Atenção ao Limite de Tempo!", 
          mensagem: `Você já usou 8 horas das suas 10 horas gratuitas.`,
          tipo: "Aviso", lida: false, data: new Date().toISOString(), actionUrl: "/vendas"
        }, ...n]);
      }
      
      if (!userId) {
        localStorage.setItem("koreflow_usage", JSON.stringify(nextUsage));
      } else {
        const monthYear = new Date().toISOString().slice(0, 7);
        // Supabase async save without await blocking
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            supabase.from('users').select('company_id').eq('id', user.id).single().then(({ data: companyUser }) => {
              if (companyUser) {
                supabase.from('kore_company_usage')
                  .update({ minutes_used: nextUsage.minutesUsed })
                  .eq('company_id', companyUser.company_id)
                  .eq('month_year', monthYear)
                  .then();
              }
            });
          }
        });
      }
    }

    if (userId) {
      const dbChanges: any = { ...changes };
      delete dbChanges.tempoGasto;
      delete dbChanges.timerStart;
      
      if (changes.projetoId !== undefined) {
        dbChanges.projeto_id = changes.projetoId;
        delete dbChanges.projetoId;
      }
      if (changes.tipoPlanejamento !== undefined) {
        dbChanges.tipo_planejamento = changes.tipoPlanejamento;
        delete dbChanges.tipoPlanejamento;
      }
      if (Object.keys(dbChanges).length > 0) {
        const { error } = await supabase.from('kore_execucoes').update(dbChanges).eq('id', id);
        if (error) console.error("Error updating execucao:", error);
      }
    } else {
      setExecucoes(prev => {
        saveStateLocal({ execucoes: prev });
        return prev;
      });
    }
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
        id: newProj.id, user_id: userId, nome: newProj.nome, cliente: newProj.cliente, status: newProj.status, campanhas: [], inspiracoes: [], criado_em: newProj.criadoEm
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
      addEvento,
      deleteEvento,
      appNotificacoes,
      welcomeEnviado,
      setWelcomeEnviado: (v) => {
        setWelcomeEnviado(v);
        saveNotificationsLocal({ welcomeEnviado: v });
      },
      addNotificacao: (n) => {
        setAppNotificacoes(prev => {
          const id = crypto.randomUUID();
          const nova = { ...n, id, lida: false, data: new Date().toISOString() };
          const newArr = [nova, ...prev];
          saveNotificationsLocal({ appNotificacoes: newArr });
          return newArr;
        });
      },
      marcarNotificacaoComoLida: (id) => {
        setAppNotificacoes(prev => {
          const newArr = prev.map(notif => notif.id === id ? { ...notif, lida: true } : notif);
          saveNotificationsLocal({ appNotificacoes: newArr });
          return newArr;
        });
      },
      limparNotificacoes: () => {
        setAppNotificacoes([]);
        saveNotificationsLocal({ appNotificacoes: [] });
      },
      configuracoes, updateConfiguracoes,
      addExecucao, updateExecucao, deleteExecucao,
      addProjeto, addCampanha, addPostCampanha, updatePostCampanha, addInspiracao, deleteProjeto,
      addMeta, updateMetaProgresso, deleteMeta,
      addPlanejamento, addClientePlano, addPostDia, updatePostDia, deletePostDia, deletePlanejamento,
      isSidebarOpen, toggleSidebar,
      companyPlan, companyUsage, openUpgradeModal
    }}>
      {children}
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} />
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
