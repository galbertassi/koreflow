const fs = require('fs');
let c = fs.readFileSync('src/components/providers/modal-manager.tsx', 'utf8');
c = c.replace(/addMeta\(\{ titulo, valorAlvo, prazo \}\);/g, 'addMeta({ titulo, prazo });');
fs.writeFileSync('src/components/providers/modal-manager.tsx', c);
