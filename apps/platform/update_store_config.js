const fs = require('fs');

let store = fs.readFileSync('src/hooks/use-store.tsx', 'utf8');

// Add configuracoes types and state
const configType = `
export interface Configuracoes {
  nome: string;
  email: string;
  agencia: string;
  tema: "Claro" | "Escuro" | "Sistema";
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
`;

store = store.replace('export interface Execucao {', configType + '\nexport interface Execucao {');

store = store.replace('eventos: Evento[];\n  addEvento: (e: Omit<Evento, "id" | "criadoEm">) => void;\n  deleteEvento: (id: string) => void;', 'eventos: Evento[];\n  addEvento: (e: Omit<Evento, "id" | "criadoEm">) => void;\n  deleteEvento: (id: string) => void;\n  configuracoes: Configuracoes;\n  updateConfiguracoes: (changes: Partial<Configuracoes>) => void;');

store = store.replace('const [eventos, setEventos] = useState<Evento[]>([]);', 'const [eventos, setEventos] = useState<Evento[]>([]);\n  const [configuracoes, setConfiguracoes] = useState<Configuracoes>({\n    nome: "Usuário",\n    email: "seu@email.com",\n    agencia: "Minha Agência",\n    tema: "Claro",\n    notificacoes: {\n      atraso: true,\n      demandasExtras: true,\n      resumoSemanal: true,\n      atualizacoes: false,\n    },\n    ia: {\n      chaveApi: "",\n      tom: "Profissional e direto",\n    }\n  });');

store = store.replace('const deleteEvento = (id: string) => setEventos(prev => prev.filter(ev => ev.id !== id));', 'const deleteEvento = (id: string) => setEventos(prev => prev.filter(ev => ev.id !== id));\n  const updateConfiguracoes = (changes: Partial<Configuracoes>) => setConfiguracoes(prev => ({ ...prev, ...changes }));');

store = store.replace('addEvento, deleteEvento,', 'addEvento, deleteEvento,\n      configuracoes, updateConfiguracoes,');

fs.writeFileSync('src/hooks/use-store.tsx', store);
console.log("Store updated for Configuracoes");
