const fs = require('fs');

// UPDATE USE STORE
let store = fs.readFileSync('src/hooks/use-store.tsx', 'utf8');

if (!store.includes('foto?: string;')) {
  store = store.replace(
    'export interface Configuracoes {\n  nome: string;\n  email: string;',
    'export interface Configuracoes {\n  nome: string;\n  email: string;\n  foto?: string;'
  );
  fs.writeFileSync('src/hooks/use-store.tsx', store);
  console.log("Store updated with foto");
} else {
  console.log("Store already has foto");
}
