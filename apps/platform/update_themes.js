const fs = require('fs');

// 1. UPDATE USE-STORE
let store = fs.readFileSync('src/hooks/use-store.tsx', 'utf8');
store = store.replace(
  'tema: "Claro" | "Escuro" | "Sistema";',
  'tema: "Original" | "Dark" | "Cinza";'
);
store = store.replace(
  'tema: "Claro",',
  'tema: "Original",'
);
fs.writeFileSync('src/hooks/use-store.tsx', store);

// 2. UPDATE CONFIGURACOES
let configPage = fs.readFileSync('src/app/(dashboard)/configuracoes/page.tsx', 'utf8');
configPage = configPage.replace(
  '{["Claro", "Escuro", "Sistema"].map((theme) => (',
  '{["Original", "Dark", "Cinza"].map((theme) => ('
);
configPage = configPage.replace(
  '<div className={`w-10 h-10 rounded-lg ${theme === "Escuro" ? "bg-[#141414] border border-[#262626]" : theme === "Sistema" ? "bg-gradient-to-br from-gray-100 to-gray-800 border border-gray-300 dark:border-gray-700" : "bg-white border border-gray-200"}`} />',
  '<div className={`w-10 h-10 rounded-lg ${theme === "Dark" ? "bg-[#141414] border border-[#262626]" : theme === "Cinza" ? "bg-black/40 backdrop-blur-md border border-white/10" : "bg-white border border-gray-200"}`} />'
);
fs.writeFileSync('src/app/(dashboard)/configuracoes/page.tsx', configPage);

// 3. UPDATE THEME-PROVIDER
let themeProv = fs.readFileSync('src/components/providers/theme-provider.tsx', 'utf8');
themeProv = themeProv.replace(
  `    if (configuracoes.tema === "Escuro") {
      root.classList.add("dark");
    } else if (configuracoes.tema === "Claro") {
      root.classList.remove("dark");
    } else {
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }`,
  `    if (configuracoes.tema === "Dark") {
      root.classList.add("dark");
      root.classList.remove("gray");
    } else if (configuracoes.tema === "Cinza") {
      root.classList.add("dark");
      root.classList.add("gray");
    } else {
      // Original
      root.classList.remove("dark");
      root.classList.remove("gray");
    }`
);
fs.writeFileSync('src/components/providers/theme-provider.tsx', themeProv);

// 4. UPDATE GLOBALS.CSS
let css = fs.readFileSync('src/app/globals.css', 'utf8');
css = css.replace(
  `@layer utilities {
  .glass {
    @apply bg-white/70 dark:bg-black/40 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)];
  }
}`,
  `@layer utilities {
  .glass {
    @apply bg-card border-border;
  }
  .gray .glass {
    @apply bg-black/40 backdrop-blur-2xl border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] text-[#EDEDED];
  }
}`
);

// We need to ensure that the layout background works for Cinza (glass) and Original/Dark (solid).
css = css.replace(
  '.gray {\n  --background: #111111;',
  '.gray {\n  --background: #000000; /* Darker to make glass pop */'
);

fs.writeFileSync('src/app/globals.css', css);

console.log("Updated themes to Original, Dark, Cinza");
