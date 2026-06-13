const fs = require('fs');
let code = fs.readFileSync('src/app/(dashboard)/kore-ai/page.tsx', 'utf8');

// 1. Add 'eventos' to StoreData interface
code = code.replace(
  'interface StoreData {\n  execucoes: any[];\n  projetos: any[];\n  planejamentos: any[];\n  metas: any[];\n  configuracoes: any;\n}',
  'interface StoreData {\n  execucoes: any[];\n  projetos: any[];\n  planejamentos: any[];\n  metas: any[];\n  eventos: any[];\n  configuracoes: any;\n}'
);

// 2. Add 'eventos' to destructuring inside generateAIResponse
code = code.replace(
  '  const { execucoes, projetos, planejamentos, metas } = store;',
  '  const { execucoes, projetos, planejamentos, metas, eventos } = store;'
);

// 3. Add MESES map and the event handler right after the destructuring line
const MESES_MAP = `
  const MESES_NOMES: Record<string, number> = {
    janeiro: 0, fevereiro: 1, março: 2, marco: 2, abril: 3, maio: 4,
    junho: 5, julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11
  };

  // Eventos agendados
  if (t.includes("event") || t.includes("agendad")) {
    const hoje = new Date();
    let mesFiltro = hoje.getMonth();
    let anoFiltro = hoje.getFullYear();
    let nomesMes = "";
    let isEspecifico = false;

    // Detect specific month name in the query
    for (const [nome, idx] of Object.entries(MESES_NOMES)) {
      if (t.includes(nome)) {
        mesFiltro = idx;
        isEspecifico = true;
        nomesMes = nome.charAt(0).toUpperCase() + nome.slice(1);
        // If the month is before current month, probably next year
        if (idx < hoje.getMonth()) anoFiltro = hoje.getFullYear() + 1;
        else anoFiltro = hoje.getFullYear();
        break;
      }
    }
    if (!isEspecifico) {
      nomesMes = hoje.toLocaleString("pt-BR", { month: "long" });
      nomesMes = nomesMes.charAt(0).toUpperCase() + nomesMes.slice(1);
    }

    const eventosMes = (eventos || []).filter(ev => {
      try {
        const d = new Date(ev.data);
        return d.getMonth() === mesFiltro && d.getFullYear() === anoFiltro;
      } catch { return false; }
    });

    if (eventosMes.length === 0) {
      return \`## 📅 Eventos — \${nomesMes}/\${anoFiltro}\n\nNenhum evento agendado para \${nomesMes}.\n\nUse a página **Calendário** para criar novos eventos, ou diga "Agendar evento" e eu te ajudo!\`;
    }

    const lista = eventosMes
      .sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .map((ev: any) => {
        const d = new Date(ev.data);
        const dia = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        const alarme = ev.alarme ? "🔔" : "";
        const notif = ev.notificacao ? "🔔" : "";
        return \`- **\${dia}** — \${ev.titulo} \${alarme}\`;
      }).join("\n");

    return \`## 📅 Eventos Agendados — \${nomesMes}/\${anoFiltro}

**Total de eventos:** \${eventosMes.length}

---

\${lista}

---

*Dados lidos diretamente da sua agenda no KORE FLOW.*\`;
  }
`;

code = code.replace(
  '  const { execucoes, projetos, planejamentos, metas, eventos } = store;\n\n  // Relatório de execuções',
  '  const { execucoes, projetos, planejamentos, metas, eventos } = store;\n' + MESES_MAP + '\n  // Relatório de execuções'
);

// 4. Update useStore destructuring in component to include 'eventos'
code = code.replace(
  'const { configuracoes, execucoes, projetos, planejamentos, metas, addPlanejamento, addProjeto, addExecucao } = useStore();',
  'const { configuracoes, execucoes, projetos, planejamentos, metas, eventos, addPlanejamento, addProjeto, addExecucao } = useStore();'
);

// 5. Pass 'eventos' to generateAIResponse call
code = code.replace(
  'generateAIResponse(text, configuracoes.nome, { execucoes, projetos, planejamentos, metas, configuracoes })',
  'generateAIResponse(text, configuracoes.nome, { execucoes, projetos, planejamentos, metas, eventos, configuracoes })'
);

fs.writeFileSync('src/app/(dashboard)/kore-ai/page.tsx', code);

const ok1 = code.includes('eventos: any[];') ? 'OK' : 'FAIL';
const ok2 = code.includes('const { execucoes, projetos, planejamentos, metas, eventos } = store;') ? 'OK' : 'FAIL';
const ok3 = code.includes('if (t.includes("event") || t.includes("agendad"))') ? 'OK' : 'FAIL';
const ok4 = code.includes('eventos, configuracoes }') ? 'OK' : 'FAIL';
console.log('StoreData:', ok1, '| Destructure:', ok2, '| Handler:', ok3, '| Pass eventos:', ok4);
