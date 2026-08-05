const fs = require('fs');
let modal = fs.readFileSync('src/components/providers/modal-manager.tsx', 'utf8');

modal = modal.replace(
  'const [prioridade, setPrioridade] = useState("Media");',
  'const [prioridade, setPrioridade] = useState("Media");\n  const [tipoPlanejamento, setTipoPlanejamento] = useState("Previsto");'
);

modal = modal.replace(
  'addExecucao({ titulo, categoria, entrega, prioridade });',
  'addExecucao({ titulo, categoria, entrega, prioridade, tipoPlanejamento: tipoPlanejamento as any });'
);

modal = modal.replace(
  'setPrioridade("Media");',
  'setPrioridade("Media");\n    setTipoPlanejamento("Previsto");'
);

const selectHtml = `
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="exec-tipo">Planejamento</Label>
              <select id="exec-tipo" value={tipoPlanejamento} onChange={(e) => setTipoPlanejamento(e.target.value)} className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring/20">
                <option value="Previsto">Previsto</option>
                <option value="Demanda Extra">Demanda Extra</option>
              </select>
            </div>`;

modal = modal.replace(
  '<div className="grid grid-cols-2 gap-3">\n            <div className="flex flex-col gap-1.5">\n              <Label htmlFor="exec-delivery">Data de entrega</Label>',
  '<div className="grid grid-cols-3 gap-3">\n' + selectHtml + '\n            <div className="flex flex-col gap-1.5">\n              <Label htmlFor="exec-delivery">Data de entrega</Label>'
);

fs.writeFileSync('src/components/providers/modal-manager.tsx', modal);
console.log('Modal manager updated');
