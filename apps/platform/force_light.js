const fs = require('fs');

// 1. Force Light Mode in theme-provider.tsx
let themeProv = fs.readFileSync('src/components/providers/theme-provider.tsx', 'utf8');
const newEffect = `  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.classList.remove("gray");
  }, []);`;
themeProv = themeProv.replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[.*?\]\);/, newEffect);
fs.writeFileSync('src/components/providers/theme-provider.tsx', themeProv);

// 2. Remove Aparência from configuracoes/page.tsx
let configPage = fs.readFileSync('src/app/(dashboard)/configuracoes/page.tsx', 'utf8');

// remove tab
configPage = configPage.replace('{ id: "aparencia", label: "Aparência", icon: Palette },', '');

// remove block
const startStr = '{activeTab === "aparencia" && (';
const endStr = '{activeTab === "notificacoes" && (';

const startIndex = configPage.indexOf(startStr);
const endIndex = configPage.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const blockToRemove = configPage.substring(startIndex, endIndex);
  configPage = configPage.replace(blockToRemove, '');
}

fs.writeFileSync('src/app/(dashboard)/configuracoes/page.tsx', configPage);

console.log("Forced light mode and removed Aparencia tab.");
