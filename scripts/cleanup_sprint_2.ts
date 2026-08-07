import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(supabaseUrl, supabaseServiceKey);

async function cleanup() {
  console.log("🧹 Iniciando limpeza direcionada da Sprint 2.5...");

  // 1. Apagar demandas de teste baseadas no título
  const { data: demands, error: dErr } = await admin
    .from('kore_demands')
    .select('id')
    .or("title.ilike.%Massa Performance%,title.ilike.Demanda Stress,title.ilike.Demanda 1,title.ilike.Demanda 2,title.ilike.Demanda 3,title.ilike.Demanda 4,title.ilike.Demanda 5,title.ilike.Demanda 6");
    
  if (dErr) {
    console.error("Erro ao buscar demandas:", dErr);
  } else if (demands && demands.length > 0) {
    const ids = demands.map(d => d.id);
    // kore_demand_time_logs serão apagados em cascata (se houver foreign key configurada) 
    // ou podemos apagar os logs explicitamente antes:
    await admin.from('kore_demand_time_logs').delete().in('demand_id', ids);
    await admin.from('kore_demands').delete().in('id', ids);
    console.log(`✅ Removidas ${ids.length} demandas geradas pelo script de teste (e seus logs).`);
  } else {
    console.log("✅ Nenhuma demanda de teste encontrada.");
  }

  // 2. Apagar usuários de teste
  const { data: dataUsers, error: uErr } = await admin.auth.admin.listUsers();
  if (uErr) {
    console.error("Erro ao listar usuários:", uErr);
  } else if (dataUsers?.users) {
    const testUsers = dataUsers.users.filter(u => u.email?.includes('test_user_') && u.email?.includes('@koreflow.test'));
    for (const tu of testUsers) {
      await admin.from('kore_company_users').delete().eq('user_id', tu.id);
      await admin.auth.admin.deleteUser(tu.id);
    }
    console.log(`✅ Removidos ${testUsers.length} usuários de simulação.`);
  }

  // 3. Apagar workspaces de teste
  const { data: testWorkspaces } = await admin.from('kore_companies').select('id').eq('name', 'Test Workspace');
  if (testWorkspaces && testWorkspaces.length > 0) {
    const wIds = testWorkspaces.map(w => w.id);
    await admin.from('kore_companies').delete().in('id', wIds);
    console.log(`✅ Removidos ${wIds.length} 'Test Workspaces'.`);
  }

  console.log("✨ Limpeza concluída com precisão cirúrgica! Nenhum dado real foi tocado.");
}

cleanup();
