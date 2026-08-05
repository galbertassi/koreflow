const fs = require('fs');

let page = fs.readFileSync('src/app/(dashboard)/configuracoes/page.tsx', 'utf8');

// Fix accents
const replacements = {
  "Configuracoes": "Configurações",
  "Aparencia": "Aparência",
  "Notificacoes": "Notificações",
  "Integracoes": "Integrações",
  "Inteligencia Artificial": "Inteligência Artificial",
  "preferencias e integracoes": "preferências e integrações",
  "seguranca": "segurança",
  "Informacoes": "Informações",
  "voce": "você",
  "Agencia": "Agência",
  "agencia": "agência",
  "Amigavel": "Amigável",
  "Tecnico": "Técnico",
  "Necessaria": "Necessária",
  "Atualizacoes": "Atualizações"
};

for (const [key, val] of Object.entries(replacements)) {
  page = page.replaceAll(key, val);
}

fs.writeFileSync('src/app/(dashboard)/configuracoes/page.tsx', page);
console.log("Accents fixed");
