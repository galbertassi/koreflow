const fs = require('fs');

// 1. Add "Cinza" to Theme Options and use semantic colors in configuracoes
let configPage = fs.readFileSync('src/app/(dashboard)/configuracoes/page.tsx', 'utf8');
configPage = configPage.replace(
  '{["Claro", "Escuro", "Sistema"].map((theme) => (',
  '{["Claro", "Escuro", "Cinza", "Sistema"].map((theme) => ('
);
// replace hardcoded bg-white
configPage = configPage.replace(
  'className="flex-1 bg-white rounded-2xl border border-border/50 p-6"',
  'className="flex-1 glass rounded-2xl p-6"'
);
configPage = configPage.replace(
  'bg-white border border-border',
  'bg-card border border-border'
);
fs.writeFileSync('src/app/(dashboard)/configuracoes/page.tsx', configPage);

// 2. Update Theme Provider for "Cinza"
let themeProv = fs.readFileSync('src/components/providers/theme-provider.tsx', 'utf8');
themeProv = themeProv.replace(
  'root.classList.add("dark");\n    } else if (configuracoes.tema === "Claro") {',
  'root.classList.add("dark");\n      root.classList.remove("gray");\n    } else if (configuracoes.tema === "Cinza") {\n      root.classList.add("dark");\n      root.classList.add("gray");\n    } else if (configuracoes.tema === "Claro") {\n      root.classList.remove("gray");'
);
themeProv = themeProv.replace(
  'root.classList.remove("dark");\n    } else {',
  'root.classList.remove("dark");\n      root.classList.remove("gray");\n    } else {'
);
fs.writeFileSync('src/components/providers/theme-provider.tsx', themeProv);

// 3. Update globals.css to add .glass and .gray theme
let css = fs.readFileSync('src/app/globals.css', 'utf8');
if (!css.includes('.glass')) {
  css = css.replace(
    '@layer base {',
    `@layer utilities {
  .glass {
    @apply bg-white/70 dark:bg-black/40 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)];
  }
}

@custom-variant gray (&:is(.gray *));

.gray {
  --background: #111111;
  --foreground: #EDEDED;
  --card: #1C1C1C;
  --card-foreground: #EDEDED;
  --popover: #1C1C1C;
  --popover-foreground: #EDEDED;
  --primary: #8B5CF6;
  --primary-foreground: #F5F5F2;
  --secondary: #262626;
  --secondary-foreground: #EDEDED;
  --muted: #262626;
  --muted-foreground: #A3A3A3;
  --accent: #262626;
  --accent-foreground: #EDEDED;
  --border: #333333;
  --input: #333333;
  --ring: #8B5CF6;
  --sidebar: #111111;
  --sidebar-foreground: #EDEDED;
  --sidebar-accent: #262626;
  --sidebar-border: #333333;
}

@layer base {`
  );
  
  // change dashboard layout background so glass effect is visible
  css = css.replace(
    '--background: #0A0A0A;',
    '--background: #000000;'
  );
  fs.writeFileSync('src/app/globals.css', css);
}

// 4. Update Dashboard layout to use a nice background for glassmorphism
let layout = fs.readFileSync('src/app/(dashboard)/layout.tsx', 'utf8');
layout = layout.replace(
  'className="flex h-screen bg-secondary/20"',
  'className="flex h-screen bg-gradient-to-br from-background to-secondary/30 relative overflow-hidden"'
);
fs.writeFileSync('src/app/(dashboard)/layout.tsx', layout);

// 5. Update Header and Sidebar to use .glass
let header = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');
header = header.replace(
  'className="h-16 border-b border-border/50 bg-white/50 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-30"',
  'className="h-16 border-b border-border/50 glass px-8 flex items-center justify-between sticky top-0 z-30"'
);
fs.writeFileSync('src/components/layout/Header.tsx', header);

let sidebar = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(
  'className="w-64 border-r border-border/50 bg-sidebar flex flex-col fixed h-full z-40"',
  'className="w-64 border-r border-border/50 glass flex flex-col fixed h-full z-40"'
);
fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebar);

console.log("Glassmorphism and Gray theme applied");
