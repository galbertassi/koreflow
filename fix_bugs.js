const fs = require('fs');

// 1. Revert Configuracoes theme options
let configPage = fs.readFileSync('src/app/(dashboard)/configuracoes/page.tsx', 'utf8');
configPage = configPage.replace(
  '{["Claro", "Escuro", "Cinza", "Sistema"].map((theme) => (',
  '{["Claro", "Escuro", "Sistema"].map((theme) => ('
);
fs.writeFileSync('src/app/(dashboard)/configuracoes/page.tsx', configPage);

// 2. Revert Theme Provider
let themeProv = fs.readFileSync('src/components/providers/theme-provider.tsx', 'utf8');
themeProv = themeProv.replace(
  'root.classList.add("dark");\n      root.classList.remove("gray");\n    } else if (configuracoes.tema === "Cinza") {\n      root.classList.add("dark");\n      root.classList.add("gray");\n    } else if (configuracoes.tema === "Claro") {\n      root.classList.remove("gray");\n      root.classList.remove("dark");\n    } else {\n      root.classList.remove("dark");\n      root.classList.remove("gray");\n    }',
  'root.classList.add("dark");\n    } else if (configuracoes.tema === "Claro") {\n      root.classList.remove("dark");\n    } else {\n      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {\n        root.classList.add("dark");\n      } else {\n        root.classList.remove("dark");\n      }\n    }'
);
fs.writeFileSync('src/components/providers/theme-provider.tsx', themeProv);

// 3. Fix globals.css backgrounds
let css = fs.readFileSync('src/app/globals.css', 'utf8');
css = css.replace('--background: #000000;', '--background: #0A0A0A;');
fs.writeFileSync('src/app/globals.css', css);

// 4. Fix Sidebar Photo
let sidebar = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(
  '<div className="flex items-center gap-3 px-2 py-1.5 mb-1">\n          <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[10px]">\n            EU\n          </div>\n          <div className="flex-1 overflow-hidden">\n            <p className="text-xs font-medium truncate">Usuário</p>\n            <p className="text-[10px] text-muted-foreground truncate">Administrador</p>\n          </div>\n        </div>',
  `<div className="flex items-center gap-3 px-2 py-1.5 mb-1">
          {configuracoes?.foto ? (
            <img src={configuracoes.foto} alt="Perfil" className="w-8 h-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[10px]">
              {configuracoes?.nome?.substring(0,2)?.toUpperCase() || "EU"}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-medium truncate">{configuracoes?.nome || "Usuário"}</p>
            <p className="text-[10px] text-muted-foreground truncate">Administrador</p>
          </div>
        </div>`
);
fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebar);

// 5. Fix Dashboard Page (Central de Atividades)
let dashPage = fs.readFileSync('src/app/(dashboard)/page.tsx', 'utf8');
if (!dashPage.includes('const { execucoes, configuracoes } = useStore();')) {
  dashPage = dashPage.replace(
    'const { execucoes } = useStore();',
    'const { execucoes, configuracoes } = useStore();'
  );
}

dashPage = dashPage.replace(
  /<td className="py-3 px-4 flex items-center gap-2">[\s\S]*?<div className="w-5 h-5 rounded-full bg-\[#8B5CF6\]\/20 flex items-center justify-center text-\[8px\] font-bold text-\[#8B5CF6\]">GA<\/div>[\s\S]*?<span className="text-xs text-foreground">Você<\/span>[\s\S]*?<\/td>/g,
  `<td className="py-3 px-4 flex items-center gap-2">
                      {configuracoes?.foto ? (
                        <img src={configuracoes.foto} alt="Perfil" className="w-6 h-6 rounded-full object-cover border border-border shrink-0" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center text-[9px] font-bold text-[#8B5CF6] shrink-0">
                          {configuracoes?.nome?.substring(0, 2).toUpperCase() || "GA"}
                        </div>
                      )}
                      <span className="text-xs text-foreground truncate max-w-[80px]">
                        {configuracoes?.nome?.split(' ')[0] || "Você"}
                      </span>
                    </td>`
);
fs.writeFileSync('src/app/(dashboard)/page.tsx', dashPage);

console.log("Fixes applied.");
