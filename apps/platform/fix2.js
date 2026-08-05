const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/projetos/[id]/page.tsx', 'utf8');
c = c.replace(/            addPostCampanha\(projetoId, campId, \{\r?\n      addPostCampanha\(projetoId, campId, \{/, '      addPostCampanha(projetoId, campId, {');
fs.writeFileSync('src/app/(dashboard)/projetos/[id]/page.tsx', c);
