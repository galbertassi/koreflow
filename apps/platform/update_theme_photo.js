const fs = require('fs');

// 1. CREATE THEME PROVIDER
const themeProviderCode = `"use client";

import { useEffect } from "react";
import { useStore } from "@/hooks/use-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { configuracoes } = useStore();

  useEffect(() => {
    const root = document.documentElement;
    if (configuracoes.tema === "Escuro") {
      root.classList.add("dark");
    } else if (configuracoes.tema === "Claro") {
      root.classList.remove("dark");
    } else {
      // Sistema
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [configuracoes.tema]);

  return <>{children}</>;
}
`;
fs.writeFileSync('src/components/providers/theme-provider.tsx', themeProviderCode);

// 2. ADD THEME PROVIDER TO LAYOUT
let layout = fs.readFileSync('src/app/layout.tsx', 'utf8');
if (!layout.includes('ThemeProvider')) {
  layout = layout.replace('import "./globals.css";', 'import "./globals.css";\nimport { ThemeProvider } from "@/components/providers/theme-provider";');
  layout = layout.replace('<body className="min-h-full flex flex-col">{children}</body>', '<body className="min-h-full flex flex-col"><ThemeProvider>{children}</ThemeProvider></body>');
  fs.writeFileSync('src/app/layout.tsx', layout);
}

// 3. UPDATE SIDEBAR FOR PHOTO
let sidebar = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace('import { usePathname } from "next/navigation";', 'import { usePathname } from "next/navigation";\nimport { useStore } from "@/hooks/use-store";');
sidebar = sidebar.replace('const pathname = usePathname();', 'const pathname = usePathname();\n  const { configuracoes } = useStore();');
sidebar = sidebar.replace(
  '<div className="w-8 h-8 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">',
  '{(configuracoes?.foto) ? (\n            <img src={configuracoes.foto} alt="Perfil" className="w-8 h-8 rounded-full object-cover shrink-0" />\n          ) : (\n            <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">\n              <span className="text-xs font-semibold text-[#8B5CF6]">{configuracoes?.nome?.substring(0,2)?.toUpperCase() || "US"}</span>\n            </div>\n          )}'
);
sidebar = sidebar.replace(
  '<span className="text-xs font-semibold text-[#8B5CF6]">US</span>\n          </div>',
  '' // Already replaced above, wait, let's fix this properly
);

// Better sidebar replace
sidebar = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
if (!sidebar.includes('useStore()')) {
  sidebar = sidebar.replace('import { usePathname } from "next/navigation";', 'import { usePathname } from "next/navigation";\nimport { useStore } from "@/hooks/use-store";');
  sidebar = sidebar.replace('const pathname = usePathname();', 'const pathname = usePathname();\n  const { configuracoes } = useStore();');
  sidebar = sidebar.replace(
    '<div className="w-8 h-8 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">\n            <span className="text-xs font-semibold text-[#8B5CF6]">US</span>\n          </div>',
    '{(configuracoes?.foto) ? (\n            <img src={configuracoes.foto} alt="Perfil" className="w-8 h-8 rounded-full object-cover shrink-0" />\n          ) : (\n            <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">\n              <span className="text-xs font-semibold text-[#8B5CF6]">{configuracoes?.nome?.substring(0,2)?.toUpperCase() || "US"}</span>\n            </div>\n          )}'
  );
  sidebar = sidebar.replace('<p className="text-sm font-semibold text-foreground">Usuário</p>', '<p className="text-sm font-semibold text-foreground">{configuracoes?.nome || "Usuário"}</p>');
  fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebar);
}


// 4. UPDATE CONFIGURACOES PAGE FOR PHOTO AND BUTTONS
let page = fs.readFileSync('src/app/(dashboard)/configuracoes/page.tsx', 'utf8');

// Add file input logic
if (!page.includes('const handleImageUpload')) {
  page = page.replace('const handleSaveNested =', `
  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateConfiguracoes({ foto: event.target?.result as string });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleIntegrationToggle = (tool: string) => {
    // Simulating connection
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const handleSaveNested =`);
}

// Update Perfil tab
page = page.replace(
  '<div className="flex items-center gap-4 mb-6">\n                <div className="w-16 h-16 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] text-xl font-bold">{configuracoes.nome.substring(0, 2).toUpperCase()}</div>\n                <button className="px-3 py-1.5 border border-border rounded-lg text-sm font-medium hover:bg-secondary/50 transition-colors">Alterar foto</button>\n              </div>',
  `<div className="flex items-center gap-4 mb-6">
                {configuracoes.foto ? (
                  <img src={configuracoes.foto} alt="Perfil" className="w-16 h-16 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] text-xl font-bold">{configuracoes.nome.substring(0, 2).toUpperCase()}</div>
                )}
                <div>
                  <input type="file" id="foto-upload" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <label htmlFor="foto-upload" className="px-3 py-1.5 border border-border rounded-lg text-sm font-medium hover:bg-secondary/50 transition-colors cursor-pointer inline-block">
                    Alterar foto
                  </label>
                  {configuracoes.foto && (
                    <button onClick={() => updateConfiguracoes({ foto: undefined })} className="ml-2 px-3 py-1.5 text-red-500 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors">
                      Remover
                    </button>
                  )}
                </div>
              </div>`
);

// Update Integrations button
page = page.replace(
  '<button className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-white transition-colors">\n                      Conectar\n                    </button>',
  '<button onClick={() => handleIntegrationToggle(tool)} className="px-3 py-1.5 border border-[#8B5CF6] text-[#8B5CF6] rounded-lg text-xs font-medium hover:bg-[#8B5CF6]/10 transition-colors">\n                      Conectar\n                    </button>'
);

fs.writeFileSync('src/app/(dashboard)/configuracoes/page.tsx', page);
console.log("ThemeProvider added, Sidebar updated, Configurações photo upload and integrations updated");

