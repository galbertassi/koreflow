import { SupabaseClient } from "@supabase/supabase-js";
import { recalculateCompanyEntitlement } from "./entitlements";

/**
 * Reivindica compras pendentes (registradas antes da criação da conta) para o usuário autenticado.
 * Chamada de forma segura exclusivamente no servidor (Server Actions / Webhook).
 */
export async function claimPendingEntitlements(
  userId: string,
  userEmail: string,
  supabase: SupabaseClient
): Promise<{ claimedCount: number; companyId?: string }> {
  if (!userId || !userEmail) {
    return { claimedCount: 0 };
  }

  const normalizedEmail = userEmail.trim().toLowerCase();

  // 1. Garantir que o usuário possui um workspace associado
  let { data: companyUser } = await supabase
    .from("kore_company_users")
    .select("company_id")
    .eq("user_id", userId)
    .maybeSingle();

  let companyId = companyUser?.company_id;

  if (!companyId) {
    // Criar workspace pessoal caso ainda não exista
    const workspaceName = `Workspace de ${normalizedEmail.split("@")[0] || "Usuário"}`;
    const { data: newCompany, error: compErr } = await supabase
      .from("kore_companies")
      .insert({
        name: workspaceName,
        workspace_type: "personal",
        personal_owner_user_id: userId,
        plan_status: "active",
      })
      .select("id")
      .maybeSingle();

    if (!compErr && newCompany?.id) {
      companyId = newCompany.id;
      await supabase.from("kore_company_users").insert({
        company_id: companyId,
        user_id: userId,
        role: "owner",
      });
    }
  }

  if (!companyId) {
    console.error(`[CLAIM_PENDING] Não foi possível localizar ou criar workspace para o usuário ${userId}`);
    return { claimedCount: 0 };
  }

  // 2. Buscar compras pendentes para este e-mail
  let pendingList: any[] = [];
  try {
    const { data: list, error: pendingErr } = await supabase
      .from("kore_pending_entitlements")
      .select("*")
      .ilike("email", normalizedEmail)
      .is("claimed_at", null);

    if (!pendingErr && list) {
      pendingList = list;
    }
  } catch (err) {
    console.warn("[CLAIM_PENDING] Tabela kore_pending_entitlements não consultável:", err);
  }

  if (pendingList.length === 0) {
    return { claimedCount: 0, companyId };
  }

  console.log(`[CLAIM_PENDING] Encontradas ${pendingList.length} compra(s) pendente(s) para ${normalizedEmail}`);

  let claimedCount = 0;

  for (const pending of pendingList) {
    const subId = pending.external_subscription_id || `hp_${pending.external_transaction_id || Date.now()}`;
    const cusId = `hp_cus_${pending.external_transaction_id || Date.now()}`;
    const priceId = pending.offer_code || "hp_price_pro";

    // Tentar insert estendido em kore_subscriptions
    const extendedPayload: Record<string, any> = {
      company_id: companyId,
      billing_provider: pending.billing_provider || "hotmart",
      status: "active",
      plan_tier: pending.plan_tier || "Pro",
      external_transaction_id: pending.external_transaction_id,
      external_subscription_id: pending.external_subscription_id,
      external_product_id: pending.product_id,
      external_offer_id: pending.offer_code,
      stripe_subscription_id: subId,
      stripe_customer_id: cusId,
      stripe_price_id: priceId,
      billing_cycle: "monthly",
      current_period_end: pending.current_period_end,
      cancel_at_period_end: false,
      metadata: {
        buyer_name: pending.buyer_name,
        buyer_phone: pending.buyer_phone,
        claimed_at: new Date().toISOString(),
      },
    };

    const { error: subInsertErr } = await supabase.from("kore_subscriptions").insert(extendedPayload);

    if (subInsertErr) {
      // Fallback base
      await supabase.from("kore_subscriptions").insert({
        company_id: companyId,
        status: "active",
        stripe_subscription_id: subId,
        stripe_customer_id: cusId,
        stripe_price_id: priceId,
        billing_cycle: "monthly",
        current_period_end: pending.current_period_end,
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      });
    }

    // Marcar como reivindicado em kore_pending_entitlements
    try {
      await supabase
        .from("kore_pending_entitlements")
        .update({
          claimed_at: new Date().toISOString(),
          claimed_by_user_id: userId,
          claimed_by_company_id: companyId,
        })
        .eq("id", pending.id);
    } catch {
      // noop
    }

    claimedCount++;
  }

  // 3. Recalcular os entitlements consolidados da empresa
  if (claimedCount > 0) {
    await recalculateCompanyEntitlement(companyId, supabase);
    console.log(`[CLAIM_PENDING] ${claimedCount} compra(s) vinculada(s) com sucesso. Plano atualizado para PRO.`);
  }

  return { claimedCount, companyId };
}
