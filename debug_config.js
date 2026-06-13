const fs = require('fs');
let code = fs.readFileSync('src/hooks/use-store.tsx', 'utf8');

const target = `      const { data: configData } = await supabase.from('kore_configuracoes').select('*').eq('user_id', user.id).single();`;
const replacement = `      const { data: configData, error: configError } = await supabase.from('kore_configuracoes').select('*').eq('user_id', user.id).single();
      console.log('Config Load:', { configData, configError });`;

code = code.replace(target, replacement);

const targetInsert = `await supabase.from('kore_configuracoes').insert(defaultSettings);`;
const replacementInsert = `const { error: insertError } = await supabase.from('kore_configuracoes').insert(defaultSettings);
console.log('Config Insert:', { insertError });`;

code = code.replace(targetInsert, replacementInsert);

fs.writeFileSync('src/hooks/use-store.tsx', code, 'utf8');
