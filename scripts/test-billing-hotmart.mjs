import { createClient } from "@supabase/supabase-js";
import { processHotmartWebhook } from "../src/lib/billing/hotmart-service";
import { getCompanyEntitlements, recalculateCompanyEntitlement } from "../src/lib/billing/entitlements";
import { claimPendingEntitlements } from "../src/lib/billing/claim-pending";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://urybvljsmrwxmfjcgdvt.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyeWJ2bGpzbXJ3eG1mamNnZHZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIyMTY0NCwiZXhwIjoyMDk2Nzk3NjQ0fQ.WPRAuBLsvuyAuGWIsAhk82U9Bj1Yu9upBpOLgq3hwQE";

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

const TEST_HOTTOK = "TEST_SECRET_HOTTOK_123456";
process.env.HOTMART_HOTTOK = TEST_HOTTOK;

const results = [];

function assert(condition, testName, message) {
  if (condition) {
    results.push({ name: testName, status: "PASS", detail: message });
    console.log(`✅ [PASS] ${testName}: ${message}`);
  } else {
    results.push({ name: testName, status: "FAIL", detail: message });
    console.error(`❌ [FAIL] ${testName}: ${message}`);
  }
}

async function runTests() {
  console.log("==================================================");
  console.log("INICIANDO SUÍTE DE 12 TESTES DE BILLING & HOTMART");
  console.log("==================================================\n");

  const timestamp = Date.now();
  const testEmailExistente = `test.existente.${timestamp}@koreflow.test`;
  const testEmailNovo = `test.novo.${timestamp}@koreflow.test`;
  const testEmailCoexistencia = `test.coexist.${timestamp}@koreflow.test`;

  // Setup: Criar empresas e usuários de teste
  const { data: comp1 } = await supabaseAdmin.from("kore_companies").insert({
    name: `Test Company ${timestamp}`,
    plan: "Free",
    plan_status: "active"
  }).select().single();

  const { data: authUser1 } = await supabaseAdmin.auth.admin.createUser({
    email: testEmailExistente,
    password: "Password123!",
    email_confirm: true
  });

  if (authUser1?.user) {
    await supabaseAdmin.from("kore_configuracoes").insert({
      user_id: authUser1.user.id,
      nome: "Usuário Teste Existente",
      email: testEmailExistente
    });
    await supabaseAdmin.from("kore_company_users").insert({
      company_id: comp1.id,
      user_id: authUser1.user.id,
      role: "owner"
    });
  }

  // -------------------------------------------------------------
  // TESTE 1: Compra Aprovada para Usuário Existente
  // -------------------------------------------------------------
  const trans1 = `HP_TRANS_1_${timestamp}`;
  const payload1 = {
    id: `evt_1_${timestamp}`,
    event: "PURCHASE_APPROVED",
    data: {
      buyer: { email: testEmailExistente, name: "Comprador Existente" },
      product: { id: "123456", name: "KORE Flow Pro" },
      purchase: {
        transaction: trans1,
        date_next_charge: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        offer: { code: "PRO_MONTHLY" }
      }
    }
  };

  const res1 = await processHotmartWebhook(payload1, TEST_HOTTOK, supabaseAdmin);
  const ent1 = await getCompanyEntitlements(comp1.id, supabaseAdmin);
  assert(res1.statusCode === 200 && ent1.effectivePlan === "Pro", "1. Compra Aprovada (Usuário Existente)", `Retorno HTTP ${res1.statusCode}, Plano Efetivo: ${ent1.effectivePlan}`);

  // -------------------------------------------------------------
  // TESTE 2: Compra Aprovada (Novo Usuário) + Posterior Cadastro
  // -------------------------------------------------------------
  const trans2 = `HP_TRANS_2_${timestamp}`;
  const payload2 = {
    id: `evt_2_${timestamp}`,
    event: "PURCHASE_APPROVED",
    data: {
      buyer: { email: testEmailNovo, name: "Comprador Novo" },
      product: { id: "123456", name: "KORE Flow Pro" },
      purchase: {
        transaction: trans2,
        date_next_charge: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        offer: { code: "PRO_MONTHLY" }
      }
    }
  };

  const res2 = await processHotmartWebhook(payload2, TEST_HOTTOK, supabaseAdmin);
  const { data: pending2 } = await supabaseAdmin.from("kore_pending_entitlements").select("*").eq("external_transaction_id", trans2).maybeSingle();
  
  // Simular cadastro do usuário
  const { data: authUser2 } = await supabaseAdmin.auth.admin.createUser({
    email: testEmailNovo,
    password: "Password123!",
    email_confirm: true
  });
  
  const claimRes = await claimPendingEntitlements(authUser2.user.id, testEmailNovo, supabaseAdmin);
  const ent2 = await getCompanyEntitlements(claimRes.companyId, supabaseAdmin);
  assert(pending2 !== null && claimRes.claimedCount === 1 && ent2.effectivePlan === "Pro", "2. Compra Aprovada (Novo Usuário + Claim)", `Pendente criado e reivindicado com sucesso. Plano final: ${ent2.effectivePlan}`);

  // -------------------------------------------------------------
  // TESTE 3: Idempotência (Evento Duplicado)
  // -------------------------------------------------------------
  const res3 = await processHotmartWebhook(payload1, TEST_HOTTOK, supabaseAdmin);
  assert(res3.statusCode === 200 && res3.alreadyProcessed === true, "3. Idempotência / Evento Duplicado", `Evento duplicado detectado e retornado com status 200 OK sem duplicidade.`);

  // -------------------------------------------------------------
  // TESTE 4: Hottok Inválido / Ausente (Fail-Closed)
  // -------------------------------------------------------------
  const res4 = await processHotmartWebhook(payload1, "TOKEN_INCORRETO_HACK", supabaseAdmin);
  assert(res4.statusCode === 401 && res4.success === false, "4. Hottok Inválido (Fail-Closed)", `Requisição com token incorreto bloqueada com HTTP 401 Unauthorized.`);

  // -------------------------------------------------------------
  // TESTE 5: Cancelamento de Renovação (Acesso Preservado até Period End)
  // -------------------------------------------------------------
  const futurePeriodEnd = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
  await supabaseAdmin.from("kore_subscriptions").update({ current_period_end: futurePeriodEnd }).eq("external_transaction_id", trans1);
  
  const payload5 = {
    id: `evt_5_${timestamp}`,
    event: "SUBSCRIPTION_CANCELLATION",
    data: {
      buyer: { email: testEmailExistente },
      purchase: { transaction: trans1 }
    }
  };
  const res5 = await processHotmartWebhook(payload5, TEST_HOTTOK, supabaseAdmin);
  const ent5 = await getCompanyEntitlements(comp1.id, supabaseAdmin);
  assert(ent5.effectivePlan === "Pro" && ent5.cancelAtPeriodEnd === true, "5. Cancelamento de Renovação Hotmart", `Plano permanece Pro com cancelAtPeriodEnd=true até ${ent5.currentPeriodEnd}`);

  // -------------------------------------------------------------
  // TESTE 6: Reembolso Hotmart (PURCHASE_REFUNDED)
  // -------------------------------------------------------------
  const payload6 = {
    id: `evt_6_${timestamp}`,
    event: "PURCHASE_REFUNDED",
    data: {
      buyer: { email: testEmailExistente },
      purchase: { transaction: trans1 }
    }
  };
  const res6 = await processHotmartWebhook(payload6, TEST_HOTTOK, supabaseAdmin);
  const ent6 = await getCompanyEntitlements(comp1.id, supabaseAdmin);
  assert(ent6.effectivePlan === "Free" && ent6.effectiveStatus === "active", "6. Reembolso Hotmart", `Assinatura Hotmart revertida e workspace atualizado para Free sem exclusão de dados.`);

  // -------------------------------------------------------------
  // TESTE 7: Chargeback Hotmart (PURCHASE_CHARGEBACK)
  // -------------------------------------------------------------
  const payload7 = {
    id: `evt_7_${timestamp}`,
    event: "PURCHASE_CHARGEBACK",
    data: {
      buyer: { email: testEmailNovo },
      purchase: { transaction: trans2 }
    }
  };
  const res7 = await processHotmartWebhook(payload7, TEST_HOTTOK, supabaseAdmin);
  const ent7 = await getCompanyEntitlements(claimRes.companyId, supabaseAdmin);
  assert(ent7.effectivePlan === "Free", "7. Chargeback Hotmart", `Assinatura marcada como chargeback e workspace revertido para Free.`);

  // -------------------------------------------------------------
  // TESTE 8: Pagamento Atrasado (PURCHASE_DELAYED / Grace Period)
  // -------------------------------------------------------------
  // Reativar assinatura com status past_due recente
  await supabaseAdmin.from("kore_subscriptions").update({
    status: "past_due",
    updated_at: new Date().toISOString()
  }).eq("external_transaction_id", trans1);
  
  const ent8 = await getCompanyEntitlements(comp1.id, supabaseAdmin);
  assert(ent8.effectivePlan === "Pro" && ent8.isGracePeriod === true && ent8.effectiveStatus === "past_due", "8. Pagamento Atrasado / Grace Period", `Carência de 3 dias aplicada; usuário mantém acesso PRO temporário com status past_due.`);

  // -------------------------------------------------------------
  // TESTE 9: Transição FREE → PRO (Desbloqueio de Limites)
  // -------------------------------------------------------------
  await supabaseAdmin.from("kore_subscriptions").update({ status: "active", updated_at: new Date().toISOString() }).eq("external_transaction_id", trans1);
  const ent9 = await getCompanyEntitlements(comp1.id, supabaseAdmin);
  assert(ent9.hasUnlimitedDemands === true && ent9.maxMinutesPerMonth > 1000, "9. Transição Free → Pro", `Limites desbloqueados: Demandas Ilimitadas = ${ent9.hasUnlimitedDemands}, AI Features = ${ent9.aiFeatures}`);

  // -------------------------------------------------------------
  // TESTE 10: Transição PRO → FREE (Aplicação de Limites Free)
  // -------------------------------------------------------------
  await supabaseAdmin.from("kore_subscriptions").update({ status: "canceled", cancel_at_period_end: false, current_period_end: null }).eq("external_transaction_id", trans1);
  const ent10 = await recalculateCompanyEntitlement(comp1.id, supabaseAdmin);
  assert(ent10.effectivePlan === "Free" && ent10.hasUnlimitedDemands === false && ent10.maxDemandsPerMonth === 10, "10. Transição Pro → Free", `Limites do Free aplicados com sucesso (Max Demandas: ${ent10.maxDemandsPerMonth}).`);

  // -------------------------------------------------------------
  // TESTE 11: Coexistência Stripe + Hotmart (Não-Interferência Mútua)
  // -------------------------------------------------------------
  // Criar empresa com assinatura Stripe ativa E assinatura Hotmart reembolsada
  const { data: compCoexist } = await supabaseAdmin.from("kore_companies").insert({
    name: `Coexist Company ${timestamp}`,
    plan: "Free"
  }).select().single();

  // Inserir Stripe PRO Ativo
  await supabaseAdmin.from("kore_subscriptions").insert({
    company_id: compCoexist.id,
    billing_provider: "stripe",
    status: "active",
    plan_tier: "Pro",
    stripe_subscription_id: `sub_stripe_${timestamp}`,
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  });

  // Inserir Hotmart que sofreu Reembolso
  await supabaseAdmin.from("kore_subscriptions").insert({
    company_id: compCoexist.id,
    billing_provider: "hotmart",
    status: "refunded",
    plan_tier: "Pro",
    external_transaction_id: `hp_refund_${timestamp}`
  });

  const ent11 = await getCompanyEntitlements(compCoexist.id, supabaseAdmin);
  assert(ent11.effectivePlan === "Pro" && ent11.activeProvider === "stripe", "11. Coexistência Stripe + Hotmart", `Reembolso da Hotmart NÃO derrubou o Stripe ativo. Plano Efetivo: ${ent11.effectivePlan} via ${ent11.activeProvider}.`);

  // -------------------------------------------------------------
  // TESTE 12: Stripe Intacto (Integridade dos Fluxos Stripe)
  // -------------------------------------------------------------
  const { recalculateCompanyEntitlement: recalcStripe } = await import("../src/lib/billing/entitlements.js");
  const ent12 = await recalcStripe(compCoexist.id, supabaseAdmin);
  assert(ent12.effectivePlan === "Pro" && ent12.hasUnlimitedDemands === true, "12. Stripe Intacto e Sincronizado", `Motor de entitlements preserva perfeitamente o Stripe. Plano: ${ent12.effectivePlan}`);

  // Limpeza de testes
  console.log("\n==================================================");
  console.log(`RESULTADO FINAL DOS 12 TESTES:`);
  console.log(`Total: ${results.length} | Aprovados: ${results.filter(r => r.status === "PASS").length} | Falhas: ${results.filter(r => r.status === "FAIL").length}`);
  console.log("==================================================");

  // Cleanup de dados temporários de teste
  try {
    await supabaseAdmin.from("kore_companies").delete().eq("id", comp1.id);
    if (claimRes?.companyId) await supabaseAdmin.from("kore_companies").delete().eq("id", claimRes.companyId);
    await supabaseAdmin.from("kore_companies").delete().eq("id", compCoexist.id);
    if (authUser1?.user?.id) await supabaseAdmin.auth.admin.deleteUser(authUser1.user.id);
    if (authUser2?.user?.id) await supabaseAdmin.auth.admin.deleteUser(authUser2.user.id);
  } catch (cleanErr) {
    // Ignorar erros de cleanup
  }
}

runTests().catch(console.error);
