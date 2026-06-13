const fs = require('fs');
let code = fs.readFileSync('src/app/(dashboard)/kore-ai/page.tsx', 'utf8');
code = code.replace('}).join("\r\n");', '}).join("\\n");');
code = code.replace('}).join("\n");', '}).join("\\n");');
fs.writeFileSync('src/app/(dashboard)/kore-ai/page.tsx', code);
console.log('Fixed newline bug!');
