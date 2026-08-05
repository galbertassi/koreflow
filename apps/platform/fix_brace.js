const fs = require('fs');
let code = fs.readFileSync('src/hooks/use-store.tsx', 'utf8');

const target = `        setConfiguracoes({
          nome: defaultSettings.nome,
          email: defaultSettings.email,
          agencia: defaultSettings.agencia,
          tema: defaultSettings.tema as any,
          notificacoes: defaultSettings.notificacoes,
          ia: defaultSettings.ia
        });

      const { data: execData }`;

const replacement = `        setConfiguracoes({
          nome: defaultSettings.nome,
          email: defaultSettings.email,
          agencia: defaultSettings.agencia,
          tema: defaultSettings.tema as any,
          notificacoes: defaultSettings.notificacoes,
          ia: defaultSettings.ia
        });
      }

      const { data: execData }`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/hooks/use-store.tsx', code, 'utf8');
  console.log('Fixed missing brace');
} else {
  console.log('Target not found');
}
