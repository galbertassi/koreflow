import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-06-24.dahlia" as any });

const TEST_EMAIL = "e2e-billing@koreflow.test";
const BACKUP_DIR = path.join(process.cwd(), "backups");

async function runCleanup() {
  console.log("=== INICIANDO LIMPEZA DIRECIONADA E AUDITORIA ===");

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
  }

  // 1. BACKUP DAS TABELAS
  console.log("\n[1] Realizando Backup das tabelas afetadas...");
  const { data: allSubs } = await supabase.from("kore_subscriptions").select("*");
  const { data: allEvents } = await supabase.from("kore_stripe_events").select("*");
  const { data: allCompanies } = await supabase.from("kore_companies").select("*");

  fs.writeFileSync(path.join(BACKUP_DIR, "kore_subscriptions_backup.json"), JSON.stringify(allSubs, null, 2));
  fs.writeFileSync(path.join(BACKUP_DIR, "kore_stripe_events_backup.json"), JSON.stringify(allEvents, null, 2));
  fs.writeFileSync(path.join(BACKUP_DIR, "kore_companies_backup.json"), JSON.stringify(allCompanies, null, 2));
  console.log("Backup concluído em ./backups/");

  // 2. IDENTIFICAR DADOS DE TESTE
  console.log("\n[2] Identificando registros de teste...");
  let { data: usersData } = await supabase.auth.admin.listUsers();
  let user = usersData.users.find((u: any) => u.email === TEST_EMAIL);

  if (!user) {
    console.log(`Usuário de teste ${TEST_EMAIL} não encontrado. Nenhuma limpeza profunda necessária.`);
    return;
  }

  const { data: testCompanies } = await supabase
    .from("kore_companies")
    .select("id, stripe_customer_id")
    .eq("personal_owner_user_id", user.id);

  const testCompanyIds = testCompanies?.map(c => c.id) || [];
  const testCustomerIds = testCompanies?.map(c => c.stripe_customer_id).filter(Boolean) || [];

  console.log(`- Usuário E2E ID: ${user.id}`);
  console.log(`- Workspaces E2E encontrados: ${testCompanyIds.length}`);
  console.log(`- Stripe Customers vinculados: ${testCustomerIds.length}`);

  // 3. LIMPEZA NA STRIPE (APENAS TEST MODE)
  console.log("\n[3] Limpando Stripe (Test Mode)...");
  let stripeDeleted = 0;
  for (const customerId of testCustomerIds) {
    try {
      const customer = await stripe.customers.retrieve(customerId as string);
      if (!customer.deleted && !customer.livemode) { // GARANTIA DE TEST MODE
        // Delete the customer (this automatically cancels their subscriptions)
        await stripe.customers.del(customerId as string);
        stripeDeleted++;
        console.log(`Customer ${customerId} deletado da Stripe.`);
      } else {
        console.log(`Customer ${customerId} ignorado (Já deletado ou é Livemode).`);
      }
    } catch (e: any) {
      console.log(`Erro ao buscar/deletar customer ${customerId}: ${e.message}`);
    }
  }

  // 4. LIMPEZA NO BANCO DE DADOS
  console.log("\n[4] Limpando Banco de Dados...");
  
  // A. Remover assinaturas dos workspaces de teste
  let subsDeleted = 0;
  if (testCompanyIds.length > 0) {
    const { data: deletedSubs, error: errSubs } = await supabase
      .from("kore_subscriptions")
      .delete()
      .in("company_id", testCompanyIds)
      .select();
    subsDeleted = deletedSubs?.length || 0;
    console.log(`Assinaturas removidas: ${subsDeleted}`);
  }

  // B. Limpar stripe_customer_id das companies de teste
  let companiesCleared = 0;
  if (testCompanyIds.length > 0) {
    const { data: updatedComps } = await supabase
      .from("kore_companies")
      .update({ stripe_customer_id: null })
      .in("id", testCompanyIds)
      .select();
    companiesCleared = updatedComps?.length || 0;
    console.log(`stripe_customer_id removido de ${companiesCleared} workspaces.`);
  }

  // C. Remover eventos gerados artificialmente no E2E
  const { data: deletedEvents } = await supabase
    .from("kore_stripe_events")
    .delete()
    .like("id", "evt_test_%")
    .select();
  const eventsDeleted = deletedEvents?.length || 0;
  console.log(`Eventos artificiais de E2E (evt_test_...) removidos: ${eventsDeleted}`);

  // 5. AUDITORIA FINAL
  console.log("\n[5] Auditoria Pós-Limpeza...");
  const { count: finalSubsCount } = await supabase.from("kore_subscriptions").select("*", { count: "exact", head: true });
  const { count: finalEventsCount } = await supabase.from("kore_stripe_events").select("*", { count: "exact", head: true });
  
  console.log("=== RELATÓRIO DE AUDITORIA ===");
  console.log(`Registros Removidos/Limpados:`);
  console.log(`- Subscriptions no BD: ${subsDeleted}`);
  console.log(`- Eventos no BD: ${eventsDeleted}`);
  console.log(`- Workspaces limpos: ${companiesCleared}`);
  console.log(`- Customers Stripe removidos: ${stripeDeleted}`);
  console.log(`\nRegistros Preservados (Estado Final):`);
  console.log(`- kore_subscriptions total: ${finalSubsCount}`);
  console.log(`- kore_stripe_events total: ${finalEventsCount}`);
  console.log(`\nDocumentação gerada: DOCUMENTACAO_BILLING.md (em Artifacts)`);
}

runCleanup();
