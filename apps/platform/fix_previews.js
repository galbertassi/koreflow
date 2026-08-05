const fs = require('fs');
let configPage = fs.readFileSync('src/app/(dashboard)/configuracoes/page.tsx', 'utf8');
configPage = configPage.replace(
  '<div className={`w-10 h-10 rounded-lg ${theme === "Escuro" ? "bg-gray-900" : theme === "Sistema" ? "bg-gradient-to-br from-white to-gray-900" : "bg-card border border-border"}`} />',
  '<div className={`w-10 h-10 rounded-lg ${theme === "Escuro" ? "bg-[#141414] border border-[#262626]" : theme === "Sistema" ? "bg-gradient-to-br from-gray-100 to-gray-800 border border-gray-300 dark:border-gray-700" : "bg-white border border-gray-200"}`} />'
);
fs.writeFileSync('src/app/(dashboard)/configuracoes/page.tsx', configPage);
console.log("Fixed preview boxes");
