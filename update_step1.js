const fs = require('fs');

// 1. HEADER
let header = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');
header = header.replace('import { usePathname } from "next/navigation";', 'import { usePathname } from "next/navigation";\nimport { useStore } from "@/hooks/use-store";');
header = header.replace('const pathname = usePathname();', 'const pathname = usePathname();\n  const { planejamentos } = useStore();\n  const isPlanejamento = pathname.startsWith("/planejamento/");\n  const plId = isPlanejamento ? pathname.split("/")[2] : null;\n  const pl = plId ? planejamentos.find(p => p.id === plId) : null;');
header = header.replace(
  '01/05/2025 <span className="font-normal text-sidebar-foreground/40 mx-1.5">-</span> 31/05/2025',
  '{pl?.inicio || "01/05/2025"} <span className="font-normal text-sidebar-foreground/40 mx-1.5">-</span> {pl?.fim || "31/05/2025"}'
);
fs.writeFileSync('src/components/layout/Header.tsx', header);


// 2. EXECUCOES
let exec = fs.readFileSync('src/app/(dashboard)/execucoes/page.tsx', 'utf8');
exec = exec.replace(
  'import { useStore, STATUS_COLORS, STATUS_PROGRESS, ExecucaoStatus } from "@/hooks/use-store";',
  'import { useStore, STATUS_COLORS, STATUS_PROGRESS, ExecucaoStatus } from "@/hooks/use-store";\nimport { Trash2 } from "lucide-react";'
);
exec = exec.replace('const { execucoes } = useStore();', 'const { execucoes, deleteExecucao } = useStore();');
exec = exec.replace(
  '<th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Progresso</th>',
  '<th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Progresso</th>\n                <th className="py-3 px-4"></th>'
);
exec = exec.replace(
  '<td className="py-4 px-4">\n                    <div className="flex items-center gap-2 min-w-[100px]">\n                      <div className="flex-1 h-1.5 bg-secondary rounded-full ">\n                        <div className="h-full bg-[#8B5CF6] rounded-full transition-all duration-500" style={{ width: `${row.progresso}%` }}></div>\n                      </div>\n                      <span className="text-[11px] font-medium text-muted-foreground w-8 text-right">{row.progresso}%</span>\n                    </div>\n                  </td>',
  '<td className="py-4 px-4">\n                    <div className="flex items-center gap-2 min-w-[100px]">\n                      <div className="flex-1 h-1.5 bg-secondary rounded-full ">\n                        <div className="h-full bg-[#8B5CF6] rounded-full transition-all duration-500" style={{ width: `${row.progresso}%` }}></div>\n                      </div>\n                      <span className="text-[11px] font-medium text-muted-foreground w-8 text-right">{row.progresso}%</span>\n                    </div>\n                  </td>\n                  <td className="py-4 px-4 text-right">\n                    <button onClick={() => deleteExecucao(row.id)} className="text-muted-foreground hover:text-red-500 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>\n                  </td>'
);
fs.writeFileSync('src/app/(dashboard)/execucoes/page.tsx', exec);

console.log("Header and Execucoes done");
