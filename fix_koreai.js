const fs = require('fs');
let code = fs.readFileSync('src/app/(dashboard)/kore-ai/page.tsx', 'utf8');

// Fix useStore destructuring
code = code.replace(
  `  const { configuracoes, addPlanejamento, addProjeto, addExecucao } = useStore();`,
  `  const { configuracoes, execucoes, projetos, planejamentos, metas, addPlanejamento, addProjeto, addExecucao } = useStore();`
);

// Fix handleSend to pass store data
code = code.replace(
  `      const response = generateAIResponse(text, configuracoes.nome);`,
  `      const response = generateAIResponse(text, configuracoes.nome, { execucoes, projetos, planejamentos, metas, configuracoes });`
);

fs.writeFileSync('src/app/(dashboard)/kore-ai/page.tsx', code);
console.log('Done. Lines modified:', code.includes('execucoes, projetos, planejamentos, metas, addPlanejamento') ? 'useStore OK' : 'useStore FAIL', code.includes('execucoes, projetos, planejamentos, metas, configuracoes') ? '| handleSend OK' : '| handleSend FAIL');
