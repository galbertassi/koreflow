
"use client";

import { useState, useEffect, Suspense } from "react";
import { User, Palette, Bell, Plug, Bot, Shield, Check, Tag, CreditCard } from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { useSearchParams } from "next/navigation";

const tabs = [
  { id: "conta", label: "Conta", icon: Shield },
  { id: "perfil", label: "Perfil", icon: User },
  { id: "assinatura", label: "Assinatura", icon: CreditCard },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "etiquetas", label: "Etiquetas", icon: Tag },
  { id: "ia", label: "Inteligência Artificial", icon: Bot },
];

function ConfiguracoesContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "conta";
  const [activeTab, setActiveTab] = useState(initialTab);
  const { configuracoes, updateConfiguracoes } = useStore();
  const [saved, setSaved] = useState(false);
  
  // Local state for forms
  const [localConfig, setLocalConfig] = useState(configuracoes);

  useEffect(() => {
    setLocalConfig(configuracoes);
  }, [configuracoes]);

  const handleSave = async (key: string, value: any) => {
    await updateConfiguracoes({ [key]: value });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveAll = async () => {
    await updateConfiguracoes(localConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fotoUrl = event.target?.result as string;
        setLocalConfig({ ...localConfig, foto: fotoUrl });
        await updateConfiguracoes({ foto: fotoUrl });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = async () => {
    setLocalConfig({ ...localConfig, foto: undefined });
    await updateConfiguracoes({ foto: null as any });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleIntegrationToggle = (tool: string) => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveNested = async (parent: string, key: string, value: any) => {
    const updatedNested = { ...localConfig[parent as keyof typeof localConfig] as any, [key]: value };
    setLocalConfig({ ...localConfig, [parent]: updatedNested });
    await updateConfiguracoes({ [parent]: updatedNested });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl relative">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie sua conta, preferências e integrações do KORE FLOW.</p>
      </div>

      {saved && (
        <div className="absolute top-0 right-0 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 border border-emerald-200">
          <Check className="w-4 h-4" /> Salvo com sucesso!
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 flex-1">
        {/* Sidebar Nav */}
        <nav className="w-full md:w-52 shrink-0">
          <ul className="flex flex-row md:flex-col gap-2 overflow-x-auto hide-scrollbar pb-2 md:pb-0">
            {tabs.map((tab) => (
              <li key={tab.id}>
                  <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left shrink-0 md:w-full ${
                    activeTab === tab.id
                      ? "bg-[#8B5CF6]/10 text-[#8B5CF6]"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 glass rounded-2xl p-6">
          {activeTab === "conta" && (
            <div>
              <h2 className="text-base font-semibold mb-1">Conta</h2>
              <p className="text-sm text-muted-foreground mb-6">Informações de acesso e segurança da sua conta.</p>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Email</label>
                  <input type="email" value={localConfig.email} onChange={(e) => setLocalConfig({...localConfig, email: e.target.value})} className="h-9 px-3 rounded-lg border border-input text-sm bg-secondary/20 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Senha atual</label>
                  <input type="password" placeholder="••••••••" className="h-9 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Nova senha</label>
                  <input type="password" placeholder="••••••••" className="h-9 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
                </div>
                <button onClick={() => handleSave('email', localConfig.email)} className="self-start mt-2 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors">
                  Salvar alterações
                </button>
              </div>
            </div>
          )}
          {activeTab === "perfil" && (
            <div>
              <h2 className="text-base font-semibold mb-1">Perfil</h2>
              <p className="text-sm text-muted-foreground mb-6">Personalize como você aparece no sistema.</p>
              <div className="flex items-center gap-4 mb-6">
                {localConfig.foto ? (
                  <img src={localConfig.foto} alt="Perfil" className="w-16 h-16 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] text-xl font-bold">
                    {localConfig.nome !== "Carregando..." ? localConfig.nome.substring(0, 2).toUpperCase() : "KF"}
                  </div>
                )}
                <div>
                  <input type="file" id="foto-upload" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <label htmlFor="foto-upload" className="px-3 py-1.5 border border-border rounded-lg text-sm font-medium hover:bg-secondary/50 transition-colors cursor-pointer inline-block">
                    Alterar foto
                  </label>
                  {localConfig.foto && (
                    <button onClick={handleRemoveImage} className="ml-2 px-3 py-1.5 text-red-500 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors">
                      Remover
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Nome</label>
                  <input type="text" value={localConfig.nome} onChange={(e) => setLocalConfig({...localConfig, nome: e.target.value})} className="h-9 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Nome da agência / empresa</label>
                  <input type="text" value={localConfig.agencia} onChange={(e) => setLocalConfig({...localConfig, agencia: e.target.value})} className="h-9 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
                </div>
                <button onClick={handleSaveAll} className="self-start mt-2 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors">
                  Salvar perfil
                </button>
              </div>
            </div>
          )}
          {activeTab === "assinatura" && (
            <div>
              <h2 className="text-base font-semibold mb-1">Assinatura e Cobrança</h2>
              <p className="text-sm text-muted-foreground mb-6">Gerencie seu plano atual e informações de pagamento.</p>
              
              <div className="bg-[#111] border border-[#8B5CF6]/30 rounded-2xl p-6 relative overflow-hidden mb-6">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#8B5CF6] to-[#C4B5FD]"></div>
                <h3 className="text-white text-lg font-bold mb-2">Plano KORE Flow PRO</h3>
                <p className="text-gray-400 text-sm mb-4">Você está atualmente no período de teste (Free Trial) ou plano padrão.</p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/stripe/checkout", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ plan: "PRO_MONTHLY" })
                        });
                        const data = await res.json();
                        if (data.url) window.location.href = data.url;
                        else if (data.redirect_to_portal) {
                          const p = await fetch("/api/stripe/portal", { method: "POST" });
                          const pData = await p.json();
                          if (pData.url) window.location.href = pData.url;
                          else alert(pData.error || "Erro ao abrir portal.");
                        } else {
                          alert(data.error || "Erro desconhecido no checkout");
                        }
                      } catch (e: any) {
                        alert("Erro de rede: " + e.message);
                      }
                    }}
                    className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    Assinar Mensal (R$ 49,90)
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/stripe/checkout", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ plan: "PRO_ANNUAL" })
                        });
                        const data = await res.json();
                        if (data.url) window.location.href = data.url;
                        else if (data.redirect_to_portal) {
                          const p = await fetch("/api/stripe/portal", { method: "POST" });
                          const pData = await p.json();
                          if (pData.url) window.location.href = pData.url;
                          else alert(pData.error || "Erro ao abrir portal.");
                        } else {
                          alert(data.error || "Erro desconhecido no checkout");
                        }
                      } catch (e: any) {
                        alert("Erro de rede: " + e.message);
                      }
                    }}
                    className="px-4 py-2 border border-[#8B5CF6]/50 text-[#8B5CF6] hover:bg-[#8B5CF6]/10 rounded-xl text-sm font-medium transition-colors"
                  >
                    Assinar Anual (R$ 479,00)
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-2">Portal do Cliente</h3>
                <p className="text-xs text-muted-foreground mb-4">Acesse o portal seguro do Stripe para baixar notas fiscais, alterar cartão de crédito ou cancelar assinatura.</p>
                <button 
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/stripe/portal", { method: "POST" });
                      const data = await res.json();
                      if (data.url) window.location.href = data.url;
                      else alert(data.error || "Você ainda não possui um histórico de faturamento.");
                    } catch (e) {
                      alert("Erro ao abrir portal.");
                    }
                  }}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-sm font-medium transition-colors"
                >
                  Abrir Portal de Faturamento
                </button>
              </div>
            </div>
          )}
          {activeTab === "notificacoes" && (
            <div>
              <h2 className="text-base font-semibold mb-1">Notificações</h2>
              <p className="text-sm text-muted-foreground mb-6">Controle quando e como você recebe alertas.</p>
              <div className="flex flex-col gap-4">
                {[
                  { id: 'atraso', label: 'Execuções em atraso' },
                  { id: 'demandasExtras', label: 'Novas demandas extras' },
                  { id: 'resumoSemanal', label: 'Resumo semanal' },
                  { id: 'atualizacoes', label: 'Atualizações do sistema' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm font-medium">{item.label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={localConfig.notificacoes[item.id as keyof typeof localConfig.notificacoes]} onChange={(e) => handleSaveNested('notificacoes', item.id, e.target.checked)} />
                      <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "etiquetas" && (
            <div>
              <h2 className="text-base font-semibold mb-1">Etiquetas de Execução</h2>
              <p className="text-sm text-muted-foreground mb-6">Configure os status disponíveis para as suas execuções/planejamentos.</p>
              
              <div className="flex flex-col gap-4">
                {localConfig.etiquetas.map((etiqueta, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input 
                      type="text" 
                      value={etiqueta.nome} 
                      onChange={(e) => {
                        const newEts = [...localConfig.etiquetas];
                        newEts[index].nome = e.target.value;
                        setLocalConfig({...localConfig, etiquetas: newEts});
                      }} 
                      className="h-9 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 flex-1" 
                      placeholder="Nome do status"
                    />
                    <select 
                      value={etiqueta.cor} 
                      onChange={(e) => {
                        const newEts = [...localConfig.etiquetas];
                        newEts[index].cor = e.target.value;
                        setLocalConfig({...localConfig, etiquetas: newEts});
                      }}
                      className={`h-9 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 bg-background ${etiqueta.cor.split(' ')[1]}`}
                    >
                      <option value="bg-slate-400/10 text-slate-500 border-slate-400/20">Cinza</option>
                      <option value="bg-indigo-400/10 text-indigo-500 border-indigo-400/20">Índigo</option>
                      <option value="bg-amber-400/10 text-amber-500 border-amber-400/20">Amarelo</option>
                      <option value="bg-blue-400/10 text-blue-500 border-blue-400/20">Azul</option>
                      <option value="bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20">Roxo</option>
                      <option value="bg-emerald-400/10 text-emerald-500 border-emerald-400/20">Verde</option>
                      <option value="bg-red-400/10 text-red-500 border-red-400/20">Vermelho</option>
                      <option value="bg-pink-400/10 text-pink-500 border-pink-400/20">Rosa</option>
                      <option value="bg-cyan-400/10 text-cyan-500 border-cyan-400/20">Ciano</option>
                    </select>
                    <button 
                      onClick={() => {
                        const newEts = localConfig.etiquetas.filter((_, i) => i !== index);
                        setLocalConfig({...localConfig, etiquetas: newEts});
                      }} 
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover"
                    >
                      <span className="text-sm font-medium">Remover</span>
                    </button>
                  </div>
                ))}
                
                <button 
                  onClick={() => {
                    setLocalConfig({...localConfig, etiquetas: [...localConfig.etiquetas, { nome: "Novo Status", cor: "bg-slate-400/10 text-slate-500 border-slate-400/20" }]});
                  }}
                  className="self-start px-3 py-2 text-sm font-medium text-[#8B5CF6] hover:bg-[#8B5CF6]/10 rounded-xl transition-colors mt-2"
                >
                  + Adicionar etiqueta
                </button>
                
                <hr className="my-4 border-border" />
                
                <button onClick={() => handleSave('etiquetas', localConfig.etiquetas)} className="self-start px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors">
                  Salvar Etiquetas
                </button>
              </div>
            </div>
          )}
          {activeTab === "ia" && (
            <div>
              <h2 className="text-base font-semibold mb-1">Inteligência Artificial</h2>
              <p className="text-sm text-muted-foreground mb-6">Configure o comportamento da KORE AI.</p>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Tom de voz principal</label>
                  <select value={localConfig.ia.tom} onChange={(e) => setLocalConfig({...localConfig, ia: {...localConfig.ia, tom: e.target.value}})} className="h-9 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 bg-background">
                    <option>Profissional e direto</option>
                    <option>Criativo e inspirador</option>
                    <option>Amigável e próximo</option>
                    <option>Técnico e detalhista</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Chave API Personalizada (Opcional)</label>
                  <input type="password" value={localConfig.ia.chaveApi} onChange={(e) => setLocalConfig({...localConfig, ia: {...localConfig.ia, chaveApi: e.target.value}})} placeholder="sk-..." className="h-9 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
                  <p className="text-xs text-muted-foreground">Deixe em branco para usar a IA padrão do sistema.</p>
                </div>
                <button onClick={() => handleSave('ia', localConfig.ia)} className="self-start mt-2 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors">
                  Salvar IA
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ConfiguracoesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Carregando configurações...</div>}>
      <ConfiguracoesContent />
    </Suspense>
  );
}
