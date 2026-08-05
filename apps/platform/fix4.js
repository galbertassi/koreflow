const fs = require('fs');
let c = fs.readFileSync('src/components/providers/modal-manager.tsx', 'utf8');
c = c.replace(/addProjeto\(\{ nome, cliente, inicio, fim \}\);/g, 'addProjeto({ nome, cliente, status: "Ativo" });');
fs.writeFileSync('src/components/providers/modal-manager.tsx', c);
