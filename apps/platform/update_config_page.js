const fs = require('fs');

let page = `
"use client";

import { useState } from "react";
import { User, Palette, Bell, Plug, Bot, Shield, Check } from "lucide-react";
import { useStore } from "@/hooks/use-store";

const tabs = [
  { id: "conta", label: "Conta", icon: Shield },
  { id: "perfil", label: "Perfil", icon: User },
  { id: "aparencia", label: "Aparência", icon: Palette },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "integracoes", label: "Integrações", icon: Plug },
  { id: "ia", label: "Inteligência Artificial", icon: Bot },
];

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState("conta");
  const { configuracoes, updateConfiguracoes } = useStore();
  const [saved, setSaved] = useState(false);

  const handleSave = (key, value) => {
    updateConfiguracoes({ [key]: value });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveNested = (parent, key, value) => {
    updateConfiguracoes({
      [parent]: { ...configuracoes[parent], [key]: value }
    });
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

      <div className="flex gap-8 flex-1">
        {/* Sidebar Nav */}
        <nav className="w-52 shrink-0">
          <ul className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left \${
                    activeTab === tab.id
                      ? "bg-[#8B5CF6]/10 text-[#8B5CF6]"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }\`}
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl border border-border/50 p-6">
          {activeTab === "conta" && (
            <div>
              <h2 className="text-base font-semibold mb-1">Conta</h2>
              <p className="text-sm text-muted-foreground mb-6">Informações de acesso e segurança da sua conta.</p>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Email</label>
                  <input type="email" value={configuracoes.email} onChange={(e) => updateConfiguracoes({ email: e.target.value })} className="h-9 px-3 rounded-lg border border-input text-sm bg-secondary/20 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Senha atual</label>
                  <input type="password" placeholder="••••••••" className="h-9 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Nova senha</label>
                  <input type="password" placeholder="••••••••" className="h-9 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
                </div>
                <button onClick={() => handleSave('email', configuracoes.email)} className="self-start mt-2 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors">
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
                <div className="w-16 h-16 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] text-xl font-bold">{configuracoes.nome.substring(0, 2).toUpperCase()}</div>
                <button className="px-3 py-1.5 border border-border rounded-lg text-sm font-medium hover:bg-secondary/50 transition-colors">Alterar foto</button>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Nome</label>
                  <input type="text" value={configuracoes.nome} onChange={(e) => updateConfiguracoes({ nome: e.target.value })} className="h-9 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Nome da agência / empresa</label>
                  <input type="text" value={configuracoes.agencia} onChange={(e) => updateConfiguracoes({ agencia: e.target.value })} className="h-9 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
                </div>
                <button onClick={() => handleSave('nome', configuracoes.nome)} className="self-start mt-2 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors">
                  Salvar perfil
                </button>
              </div>
            </div>
          )}
          {activeTab === "aparencia" && (
            <div>
              <h2 className="text-base font-semibold mb-1">Aparência</h2>
              <p className="text-sm text-muted-foreground mb-6">Escolha o tema visual do KORE FLOW.</p>
              <div className="grid grid-cols-3 gap-3">
                {["Claro", "Escuro", "Sistema"].map((theme) => (
                  <button key={theme} onClick={() => handleSave('tema', theme)} className={\`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors \${configuracoes.tema === theme ? "border-[#8B5CF6] bg-[#8B5CF6]/5" : "border-border hover:border-border/80"}\`}>
                    <div className={\`w-10 h-10 rounded-lg \${theme === "Escuro" ? "bg-gray-900" : theme === "Sistema" ? "bg-gradient-to-br from-white to-gray-900" : "bg-white border border-border"}\`} />
                    <span className="text-sm font-medium">{theme}</span>
                  </button>
                ))}
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
                  <div key={item.id} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                    <span className="text-sm font-medium">{item.label}</span>
                    <button 
                      onClick={() => handleSaveNested('notificacoes', item.id, !configuracoes.notificacoes[item.id])}
                      className={\`w-10 h-5 rounded-full relative cursor-pointer transition-colors \${configuracoes.notificacoes[item.id] ? "bg-[#8B5CF6]" : "bg-secondary"}\`}
                    >
                      <div className={\`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all \${configuracoes.notificacoes[item.id] ? "right-0.5" : "left-0.5"}\`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "integracoes" && (
            <div>
              <h2 className="text-base font-semibold mb-1">Integrações</h2>
              <p className="text-sm text-muted-foreground mb-6">Conecte o KORE FLOW com outras ferramentas.</p>
              <div className="flex flex-col gap-3">
                {["Google Calendar", "Slack", "Notion", "Trello"].map((tool) => (
                  <div key={tool} className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl border border-border/40">
                    <div>
                      <p className="text-sm font-medium">{tool}</p>
                      <p className="text-xs text-muted-foreground">Não conectado</p>
                    </div>
                    <button className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-white transition-colors">
                      Conectar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "ia" && (
            <div>
              <h2 className="text-base font-semibold mb-1">Inteligência Artificial</h2>
              <p className="text-sm text-muted-foreground mb-6">Configure o comportamento da KORE AI no seu sistema.</p>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Chave de API (OpenAI)</label>
                  <input type="password" value={configuracoes.ia.chaveApi} onChange={(e) => updateConfiguracoes({ ia: { ...configuracoes.ia, chaveApi: e.target.value } })} placeholder="sk-..." className="h-9 px-3 rounded-lg border border-input text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
                  <p className="text-xs text-muted-foreground">Necessária para ativar o assistente inteligente (Opcional no momento).</p>
                </div>
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-sm font-medium">Tom da KORE AI</label>
                  <select value={configuracoes.ia.tom} onChange={(e) => updateConfiguracoes({ ia: { ...configuracoes.ia, tom: e.target.value } })} className="h-9 px-3 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 bg-white">
                    <option>Profissional e direto</option>
                    <option>Amigável e motivador</option>
                    <option>Técnico e detalhado</option>
                  </select>
                </div>
                <button onClick={() => handleSaveNested('ia', 'tom', configuracoes.ia.tom)} className="self-start mt-2 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-medium transition-colors">
                  Salvar configurações de IA
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/app/(dashboard)/configuracoes/page.tsx', page);
console.log("Config page rewritten with state");
