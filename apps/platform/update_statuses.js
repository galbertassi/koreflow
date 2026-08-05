const fs = require('fs');

// 1. UPDATE USE-STORE.TSX
let store = fs.readFileSync('src/hooks/use-store.tsx', 'utf8');
store = store.replace(
  'status: "Planejado" | "Producao" | "Aprovado" | "Publicado";',
  'status: "Planejado" | "Producao" | "Em analise para aprovação" | "Aprovado" | "Publicado" | "Pausado";'
);
fs.writeFileSync('src/hooks/use-store.tsx', store);

// 2. UPDATE PLANEJAMENTO DETALHES PAGE
let page = fs.readFileSync('src/app/(dashboard)/planejamento/[id]/page.tsx', 'utf8');

if (!page.includes('updatePostDia')) {
  page = page.replace(
    'const { planejamentos, addClientePlano, addPostDia } = useStore();',
    'const { planejamentos, addClientePlano, addPostDia, updatePostDia } = useStore();'
  );
}

const oldSpan = '<span className="text-[10px] font-medium px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 border border-amber-200 shrink-0">{p.status}</span>';
const newSelect = `<select 
                                value={p.status}
                                onChange={(e) => updatePostDia(planejamentoId, activeCliente.id, dia, p.id, { status: e.target.value as any })}
                                className={\`text-[10px] font-medium px-1 py-1 rounded-md shrink-0 border outline-none cursor-pointer \${
                                  p.status === 'Aprovado' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' :
                                  p.status === 'Em analise para aprovação' ? 'bg-blue-500/10 text-blue-600 border-blue-200' :
                                  p.status === 'Pausado' ? 'bg-red-500/10 text-red-600 border-red-200' :
                                  'bg-amber-500/10 text-amber-600 border-amber-200'
                                }\`}
                              >
                                <option value="Planejado">Planejado</option>
                                <option value="Em analise para aprovação">Em análise para aprovação</option>
                                <option value="Aprovado">Aprovado</option>
                                <option value="Pausado">Pausado</option>
                              </select>`;

page = page.replace(oldSpan, newSelect);
fs.writeFileSync('src/app/(dashboard)/planejamento/[id]/page.tsx', page);

console.log("Updated statuses and UI to select.");
