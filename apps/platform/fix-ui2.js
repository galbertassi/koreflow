const fs = require('fs');

// 1. Update Sidebar.tsx
let sidebar = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// Import useStore
if (!sidebar.includes('useStore')) {
  sidebar = sidebar.replace('import { createClient } from "@/utils/supabase/client";', 'import { createClient } from "@/utils/supabase/client";\nimport { useStore } from "@/hooks/use-store";');
}

// Update Sidebar component
sidebar = sidebar.replace(
  'const supabase = createClient();',
  'const supabase = createClient();\n  const { configuracoes } = useStore();\n  const nomeUsuario = configuracoes?.nome || "Usuário";\n  const iniciais = nomeUsuario.substring(0, 2).toUpperCase();'
);

// Remove "Kore Flow" text
sidebar = sidebar.replace(
  '<h1 className="font-medium tracking-[0.15em] text-lg uppercase leading-none text-sidebar-foreground/90 -mt-4">Kore Flow</h1>',
  ''
);

// Update user info section
sidebar = sidebar.replace(
  /<div className="h-7 w-7 rounded-full bg-primary\/20 flex items-center justify-center text-primary font-bold text-\[10px\]">\s*EU\s*<\/div>\s*<div className="flex-1 overflow-hidden">\s*<p className="text-xs font-medium truncate">Usuário<\/p>\s*<p className="text-\[10px\] text-muted-foreground truncate">Administrador<\/p>\s*<\/div>/g,
  `{configuracoes?.foto ? (
            <div className="h-7 w-7 rounded-full overflow-hidden relative">
              <Image src={configuracoes.foto} alt={nomeUsuario} fill className="object-cover" />
            </div>
          ) : (
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[10px]">
              {iniciais}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-medium truncate">{nomeUsuario}</p>
            <p className="text-[10px] text-muted-foreground truncate">Administrador</p>
          </div>`
);

fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebar);

// 2. Empty mock data in Dashboard (page.tsx)
let page = fs.readFileSync('src/app/(dashboard)/page.tsx', 'utf8');

// Replace topCards values with 0
page = page.replace(/value: "\d+"/g, 'value: "0"');
page = page.replace(/trendValue: "[^"]+"/g, 'trendValue: "0%"');

// Clear arrays
page = page.replace(/const fluxoData = \[[^]*?\];/m, 'const fluxoData: any[] = [];');
page = page.replace(/const distribuicaoData = \[[^]*?\];/m, 'const distribuicaoData: any[] = [];');
page = page.replace(/const demandasExtras = \[[^]*?\];/m, 'const demandasExtras: any[] = [];');
page = page.replace(/const tableData = \[[^]*?\];/m, 'const tableData: any[] = [];');

fs.writeFileSync('src/app/(dashboard)/page.tsx', page);
