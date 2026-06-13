const fs = require('fs');

// PLANEJAMENTO
let plan = fs.readFileSync('src/app/(dashboard)/planejamento/page.tsx', 'utf8');
plan = plan.replace('const { planejamentos } = useStore();', 'const { planejamentos, deletePlanejamento } = useStore();');
plan = plan.replace('import { Plus, ClipboardCheck, Calendar, MoreHorizontal, ArrowRight } from "lucide-react";', 'import { Plus, ClipboardCheck, Calendar, MoreHorizontal, ArrowRight, Trash2 } from "lucide-react";');
plan = plan.replace(
  '<button key={pl.id} onClick={() => router.push(`/planejamento/${pl.id}`)} className="text-left bg-white rounded-2xl border border-border/50 p-5 hover:border-[#8B5CF6]/30 transition-all group">',
  '<div key={pl.id} onClick={() => router.push(`/planejamento/${pl.id}`)} className="text-left bg-white rounded-2xl border border-border/50 p-5 hover:border-[#8B5CF6]/30 transition-all cursor-pointer group">'
);
plan = plan.replace(
  '</button>\n          ))',
  '</div>\n          ))'
);
plan = plan.replace(
  '<ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-[#8B5CF6] transition-colors" />',
  '<div className="flex items-center gap-2">\n                  <button onClick={(e) => { e.stopPropagation(); deletePlanejamento(pl.id); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">\n                    <Trash2 className="w-4 h-4" />\n                  </button>\n                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-[#8B5CF6] transition-colors" />\n                </div>'
);
fs.writeFileSync('src/app/(dashboard)/planejamento/page.tsx', plan);


// PROJETOS
try {
let proj = fs.readFileSync('src/app/(dashboard)/projetos/page.tsx', 'utf8');
proj = proj.replace('const { projetos } = useStore();', 'const { projetos, deleteProjeto } = useStore();');
proj = proj.replace('import { Plus, Folder, Search, Filter, FolderKanban } from "lucide-react";', 'import { Plus, Folder, Search, Filter, FolderKanban, Trash2 } from "lucide-react";');
proj = proj.replace(
  '<button key={proj.id} onClick={() => router.push(`/projetos/${proj.id}`)} className="text-left bg-white rounded-2xl border border-border/50 p-5 hover:border-[#8B5CF6]/30 transition-all group block">',
  '<div key={proj.id} onClick={() => router.push(`/projetos/${proj.id}`)} className="text-left bg-white rounded-2xl border border-border/50 p-5 hover:border-[#8B5CF6]/30 transition-all cursor-pointer group block">'
);
proj = proj.replace(
  '</button>\n          ))',
  '</div>\n          ))'
);
proj = proj.replace(
  '<span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-secondary text-foreground">Aberto</span>',
  '<div className="flex items-center gap-2"><span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-secondary text-foreground">Aberto</span><button onClick={(e) => { e.stopPropagation(); deleteProjeto(proj.id); }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></div>'
);
fs.writeFileSync('src/app/(dashboard)/projetos/page.tsx', proj);
} catch(e) {}

// METAS
try {
let metas = fs.readFileSync('src/app/(dashboard)/metas/page.tsx', 'utf8');
metas = metas.replace('const { metas } = useStore();', 'const { metas, deleteMeta } = useStore();');
metas = metas.replace('import { Plus, Target, Search, Filter, TrendingUp, ChevronRight } from "lucide-react";', 'import { Plus, Target, Search, Filter, TrendingUp, ChevronRight, Trash2 } from "lucide-react";');
metas = metas.replace(
  '<div key={meta.id} className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm">',
  '<div key={meta.id} className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm relative group">'
);
metas = metas.replace(
  '<div className="flex items-center justify-between mb-4">',
  '<button onClick={() => deleteMeta(meta.id)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>\n              <div className="flex items-center justify-between mb-4">'
);
fs.writeFileSync('src/app/(dashboard)/metas/page.tsx', metas);
} catch(e) {}

console.log("Delete buttons added");
