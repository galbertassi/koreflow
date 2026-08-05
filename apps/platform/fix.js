const fs = require('fs');

// 1. Fix use-store.tsx
let useStore = fs.readFileSync('src/hooks/use-store.tsx', 'utf8');
useStore = useStore.replace(
  /export interface Post \{\n  id: string;\n  titulo: string;\n  status: "A fazer" \| "Fazendo" \| "Aprovacao" \| "Feito";\n  criadoEm: string;\n  dataEntrega\?: string;\n  responsavel\?: string;\n\}/g,
  `export interface Post {\n  id: string;\n  titulo: string;\n  descricao?: string;\n  tipo?: string;\n  status: "A fazer" | "Fazendo" | "Aprovacao" | "Feito" | "Ideia" | "Producao";\n  criadoEm: string;\n  dataEntrega?: string;\n  responsavel?: string;\n}`
);
fs.writeFileSync('src/hooks/use-store.tsx', useStore);

// 2. Fix kore-ai/page.tsx
let koreAi = fs.readFileSync('src/app/(dashboard)/kore-ai/page.tsx', 'utf8');
koreAi = koreAi.replace(
  /addProjeto\(\{\n      nome: `Projeto KORE AI — \$\{new Date\(\)\.toLocaleDateString\("pt-BR"\)\}`,\n      cliente: configuracoes\.agencia,\n      inicio: new Date\(\)\.toISOString\(\)\.split\("T"\)\[0\],\n      fim: new Date\(new Date\(\)\.setDate\(new Date\(\)\.getDate\(\) \+ 30\)\)\.toISOString\(\)\.split\("T"\)\[0\],\n    \} as any\);/g,
  `addProjeto({\n      nome: \`Projeto KORE AI — \${new Date().toLocaleDateString("pt-BR")}\`,\n      cliente: configuracoes.agencia,\n      status: "Ativo",\n    });`
);
koreAi = koreAi.replace(
  /addExecucao\(\{\n        projetoId: "1", \n        titulo: `Execução KORE AI - \$\{new Date\(\)\.toLocaleDateString\("pt-BR"\)\}`,\n        categoria: "Planejamento",\n        entrega: new Date\(new Date\(\)\.setDate\(new Date\(\)\.getDate\(\) \+ 7\)\)\.toLocaleDateString\("pt-BR"\),\n        prioridade: "Alta",\n        tipoPlanejamento: "Previsto",\n      \} as any\);/g,
  `addExecucao({\n        projetoId: "1", \n        titulo: \`Execução KORE AI - \${new Date().toLocaleDateString("pt-BR")}\`,\n        categoria: "Planejamento",\n        entrega: new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleDateString("pt-BR"),\n        prioridade: "Alta",\n        tipoPlanejamento: "Previsto",\n      });`
);
fs.writeFileSync('src/app/(dashboard)/kore-ai/page.tsx', koreAi);

// 3. Fix projetos/[id]/page.tsx
let projPage = fs.readFileSync('src/app/(dashboard)/projetos/[id]/page.tsx', 'utf8');
projPage = projPage.replace(/\{ nome, descricao, status: "Planejamento" \} as any/g, `{ nome, descricao, status: "Planejamento" }`);
projPage = projPage.replace(/\{ nome: "Geral", descricao: "", status: "Planejamento" \} as any/g, `{ nome: "Geral", descricao: "", status: "Planejamento" }`);
projPage = projPage.replace(/\{ titulo: nome, url: descricao \} as any/g, `{ titulo: nome, url: descricao, descricao: "" }`);
projPage = projPage.replace(/\} as any\);/g, `});`);
fs.writeFileSync('src/app/(dashboard)/projetos/[id]/page.tsx', projPage);

console.log("Fixes applied successfully.");
