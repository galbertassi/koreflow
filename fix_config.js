const fs = require('fs');
let code = fs.readFileSync('src/hooks/use-store.tsx', 'utf8');

const oldLogic = `      const { data: configData } = await supabase.from('kore_configuracoes').select('*').eq('user_id', user.id).single();
      if (configData) {
        setConfiguracoes({
          nome: configData.nome, email: configData.email, agencia: configData.agencia,
          tema: configData.tema as any, foto: configData.foto, notificacoes: configData.notificacoes, ia: configData.ia
        });
      }`;

const newLogic = `      const { data: configData } = await supabase.from('kore_configuracoes').select('*').eq('user_id', user.id).single();
      if (configData) {
        setConfiguracoes({
          nome: configData.nome, email: configData.email, agencia: configData.agencia,
          tema: configData.tema as any, foto: configData.foto, notificacoes: configData.notificacoes, ia: configData.ia
        });
      } else {
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

if (code.includes(oldLogic)) {
  code = code.replace(oldLogic, newLogic);
  fs.writeFileSync('src/hooks/use-store.tsx', code, 'utf8');
  console.log('Fixed config logic');
} else {
  console.log('Could not find logic');
}
