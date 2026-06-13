const fs = require('fs');
let lines = fs.readFileSync('src/hooks/use-store.tsx', 'utf8').split('\n');
// We want to delete the duplicated block from line 227 up to 246 where the second `}` of the else is.
// Actually let's just find the duplicate using string replacement.
let code = fs.readFileSync('src/hooks/use-store.tsx', 'utf8');

const duplicated = `      } else {
        const defaultSettings = {
          user_id: user.id,
          nome: user.user_metadata?.full_name || "Seu Nome",
          email: user.email || "seu@email.com",
          agencia: "Sua Agência",
          tema: "Original",
          notificacoes: { atraso: true, demandasExtras: true, resumoSemanal: true, atualizacoes: false },
          ia: { chaveApi: "", tom: "Profissional e direto" }
        };
        await supabase.from('kore_configuracoes').insert(defaultSettings);
        setConfiguracoes({
          nome: defaultSettings.nome,
          email: defaultSettings.email,
          agencia: defaultSettings.agencia,
          tema: defaultSettings.tema as any,
          notificacoes: defaultSettings.notificacoes,
          ia: defaultSettings.ia
        });
      }`;

if (code.indexOf(duplicated) !== code.lastIndexOf(duplicated)) {
  code = code.replace(duplicated + '\n', '');
  fs.writeFileSync('src/hooks/use-store.tsx', code, 'utf8');
  console.log('Fixed duplication');
} else {
  console.log('Not duplicated or exact match not found');
}
