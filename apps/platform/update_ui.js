const fs = require('fs');

// 1. USE-STORE.TSX
let store = fs.readFileSync('src/hooks/use-store.tsx', 'utf8');
if (!store.includes('deletePostDia:')) {
  store = store.replace(
    'updatePostDia: (planejamentoId: string, clienteId: string, data: string, postId: string, changes: Partial<PostDia>) => void;',
    'updatePostDia: (planejamentoId: string, clienteId: string, data: string, postId: string, changes: Partial<PostDia>) => void;\n  deletePostDia: (planejamentoId: string, clienteId: string, data: string, postId: string) => void;'
  );
}
if (!store.includes('observacao?: string;')) {
  store = store.replace(
    'imagemUrl?: string;',
    'imagemUrl?: string;\n  observacao?: string;'
  );
}
if (!store.includes('const deletePostDia =')) {
  const delPostStr = `  const deletePostDia = (planejamentoId: string, clienteId: string, data: string, postId: string) => {
    setPlanejamentos((prev) => prev.map((pl) => pl.id !== planejamentoId ? pl : {
      ...pl, clientes: pl.clientes.map((cl) => cl.id !== clienteId ? cl : {
        ...cl, postsPorDia: {
          ...cl.postsPorDia,
          [data]: (cl.postsPorDia[data] || []).filter(p => p.id !== postId)
        }
      })
    }));
  };`;
  store = store.replace(
    'return (\n    <StoreContext.Provider value={{',
    delPostStr + '\n\n  return (\n    <StoreContext.Provider value={{'
  );
  store = store.replace(
    'addPostDia, updatePostDia, deletePlanejamento,',
    'addPostDia, updatePostDia, deletePostDia, deletePlanejamento,'
  );
}
fs.writeFileSync('src/hooks/use-store.tsx', store);


// 2. PAGE.TSX
let page = fs.readFileSync('src/app/(dashboard)/planejamento/[id]/page.tsx', 'utf8');
if (!page.includes('Trash2')) {
  page = page.replace(
    'Link as LinkIcon } from "lucide-react";',
    'Link as LinkIcon, Trash2 } from "lucide-react";'
  );
}
if (!page.includes('deletePostDia } = useStore()')) {
  page = page.replace(
    'const { planejamentos, addClientePlano, addPostDia, updatePostDia } = useStore();',
    'const { planejamentos, addClientePlano, addPostDia, updatePostDia, deletePostDia } = useStore();'
  );
}
const selectSearch = '                              </select>';
const selectReplacement = `                              </select>
                              <button onClick={() => deletePostDia(planejamentoId, activeCliente.id, dia, p.id)} className="w-6 h-6 ml-2 flex items-center justify-center rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>`;
if (!page.includes('deletePostDia(planejamentoId, activeCliente.id, dia, p.id)')) {
  page = page.replace(selectSearch, selectReplacement);
}
fs.writeFileSync('src/app/(dashboard)/planejamento/[id]/page.tsx', page);


// 3. RELATORIO PAGE.TSX
let relatorio = fs.readFileSync('src/app/(dashboard)/planejamento/[id]/relatorio/page.tsx', 'utf8');
if (!relatorio.includes('updatePostDia } = useStore()')) {
  relatorio = relatorio.replace(
    'const { planejamentos } = useStore();',
    'const { planejamentos, updatePostDia } = useStore();'
  );
}

const relatorioOldBlockStr = `{post.link ? (
                        <div className="flex items-center gap-2 mt-4 bg-secondary/30 p-3 rounded-lg border border-border">
                          <ExternalLink className="w-4 h-4 text-[#8B5CF6]" />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-medium text-muted-foreground">Link Anexado (Video/Referencia)</span>
                            <a href={post.link} target="_blank" rel="noreferrer" className="text-sm text-[#8B5CF6] hover:underline truncate">
                              {post.link}
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <div className="flex-1 relative">
                            <input type="text" placeholder="Adicionar link de referencia..." className="w-full text-xs pl-3 pr-10 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/50" />
                            <ExternalLink className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          </div>
                          <button className="text-xs font-medium text-[#8B5CF6] hover:underline whitespace-nowrap">Adicionar Observacao</button>
                        </div>
                      )}`;

const relatorioNewBlockStr = `
                      <div className="space-y-3 mt-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 relative">
                            <input 
                              type="text" 
                              defaultValue={post.link || ""}
                              onBlur={(e) => updatePostDia(planejamentoId, cliente.id, post.dia, post.id, { link: e.target.value })}
                              placeholder="Adicionar link de referencia..." 
                              className="w-full text-xs pl-3 pr-10 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/50" 
                            />
                            <ExternalLink className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="flex-1 relative">
                          <textarea 
                            defaultValue={post.observacao || ""}
                            onBlur={(e) => updatePostDia(planejamentoId, cliente.id, post.dia, post.id, { observacao: e.target.value })}
                            placeholder="Adicionar observações..." 
                            rows={2}
                            className="w-full text-xs p-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/50 resize-none" 
                          />
                        </div>
                      </div>
`;
relatorio = relatorio.replace(relatorioOldBlockStr, relatorioNewBlockStr);
fs.writeFileSync('src/app/(dashboard)/planejamento/[id]/relatorio/page.tsx', relatorio);


// 4. HEADER.TSX
let headerCode = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

// remove addEvento
headerCode = headerCode.replace(
  'const { planejamentos, addEvento } = useStore();',
  'const { planejamentos } = useStore();'
);
// remove handleAddEvento
const regexHandler = /const handleAddEvento = \(\) => \{[\s\S]*?\};\n\n  /;
headerCode = headerCode.replace(regexHandler, '');

// remove button
const btnSearch = '<button onClick={handleAddEvento} className="w-full mt-4 flex items-center justify-center gap-2 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/20 py-2.5 rounded-xl text-sm font-medium transition-colors">\n                <PlusCircle className="w-4 h-4" /> Agendar Evento\n              </button>';
headerCode = headerCode.replace(btnSearch, '');

fs.writeFileSync('src/components/layout/Header.tsx', headerCode);

console.log("All requested tasks implemented.");
