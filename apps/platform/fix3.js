const fs = require('fs');
let c = fs.readFileSync('src/hooks/use-store.tsx', 'utf8');
c = c.replace(
  /status: "A fazer" \| "Fazendo" \| "Aprovacao" \| "Feito" \| "Ideia" \| "Producao";/g,
  'status: "A fazer" | "Fazendo" | "Aprovacao" | "Feito" | "Ideia" | "Producao" | "Aprovado" | "Publicado";'
);
fs.writeFileSync('src/hooks/use-store.tsx', c);
