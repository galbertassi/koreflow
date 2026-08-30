import { SupabaseClient } from "@supabase/supabase-js";
import { PLANS, PlanType } from "@/config/plans";
import { BILLING_CONFIG } from "./config";
import { CompanyEntitlements, PlanTier, SubscriptionRecord, SubscriptionStatus, BillingProvider } from "./types";

/**
 * Determina o PlanTier a partir de um priceId ou plan_tier ou plan_status.
 */
function resolvePlanTierFromRecord(sub: any): PlanTier {
  if (sub.plan_tier) return sub.plan_tier as PlanTier;
  const priceId = sub.stripe_price_id || "";
  if (
    priceId === BILLING_CONFIG.STRIPE.PRICES.PRO_MONTHLY ||
    priceId === BILLING_CONFIG.STRIPE.PRICES.PRO_ANNUAL ||
    priceId.toLowerCase().includes("pro")
  ) {
    return "Pro";
  }
  if (sub.billing_provider === "hotmart" || (sub.stripe_subscription_id && sub.stripe_subscription_id.startsWith("hp_"))) {
    return "Pro";
  }
  return "Pro"; // Assinaturas ativas no KORE Flow são do nível Pro por padrão
}

/**
 * Calcula os entitlements consolidados e efetivos de uma empresa/workspace,
 * avaliando TODAS as assinaturas registradas em kore_subscriptions (Stripe, Hotmart, Manual).
 * 
 * Regra de Coexistência:
 * - Se a empresa possui uma assinatura Pro ativa via Stripe e outra cancelada/reembolsada via Hotmart,
 *   a empresa PERMANECE Pro devido à assinatura Stripe ativa (e vice-versa).
 */
export async function getCompanyEntitlements(
  companyId: string,
  supabase: SupabaseClient
): Promise<CompanyEntitlements> {
  const now = new Date();

  // 1. Buscar dados do workspace
  const { data: company, error: compError } = await supabase
    .from("kore_companies")
    .select("*")
    .eq("id", companyId)
    .maybeSingle();

  if (compError) {
    console.error("[ENTITLEMENTS] Erro ao buscar empresa:", compError);
  }

  // 2. Buscar todas as assinaturas associadas a esta empresa
  const { data: subscriptions, error: subsError } = await supabase
    .from("kore_subscriptions")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (subsError) {
    console.warn("[ENTITLEMENTS] Aviso ao buscar assinaturas:", subsError.message);
  }

  const allSubs: any[] = subscriptions || [];

  let bestPlan: PlanTier = "Free";
  let bestStatus: SubscriptionStatus = "active";
  let activeProvider: BillingProvider | "none" = "none";
  let isGracePeriod = false;
  let latestPeriodEnd: string | null = company?.current_period_end || company?.stripe_current_period_end || null;
  let cancelAtPeriodEnd = false;
  let activeCount = 0;

  // Avaliar cada assinatura individualmente
  for (const sub of allSubs) {
    const isProviderActive = sub.status === "active";
    const periodEnd = sub.current_period_end ? new Date(sub.current_period_end) : null;
    const hasValidPeriod = periodEnd ? periodEnd.getTime() > now.getTime() : false;
    const tier = resolvePlanTierFromRecord(sub);
    const provider: BillingProvider = sub.billing_provider || (sub.stripe_subscription_id?.startsWith("hp_") ? "hotmart" : "stripe");

    // Cenário A: Assinatura explicitamente ativa
    if (isProviderActive) {
      activeCount++;
      if (tier === "Business") {
        bestPlan = "Business";
        bestStatus = "active";
        activeProvider = provider;
        latestPeriodEnd = sub.current_period_end || latestPeriodEnd;
        cancelAtPeriodEnd = !!sub.cancel_at_period_end;
        break; // Prioridade máxima atingida
      } else if (tier === "Pro" && bestPlan !== "Business") {
        bestPlan = "Pro";
        bestStatus = "active";
        activeProvider = provider;
        latestPeriodEnd = sub.current_period_end || latestPeriodEnd;
        cancelAtPeriodEnd = !!sub.cancel_at_period_end;
      }
    }
    // Cenário B: Cancelamento de renovação, mas o período pago ainda não expirou
    else if (sub.cancel_at_period_end && hasValidPeriod && (sub.status === "canceled" || sub.status === "active")) {
      activeCount++;
      if (bestPlan === "Free") {
        bestPlan = tier || "Pro";
        bestStatus = "active";
        activeProvider = provider;
        latestPeriodEnd = sub.current_period_end || null;
        cancelAtPeriodEnd = true;
      }
    }
    // Cenário C: Pagamento atrasado (past_due) dentro do Grace Period
    else if (sub.status === "past_due") {
      const updatedAt = new Date(sub.updated_at || sub.created_at);
      const graceEnd = new Date(updatedAt.getTime() + BILLING_CONFIG.GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
      
      if (graceEnd.getTime() > now.getTime()) {
        if (bestPlan === "Free") {
          bestPlan = tier || "Pro";
          bestStatus = "past_due";
          activeProvider = provider;
          isGracePeriod = true;
          latestPeriodEnd = sub.current_period_end || latestPeriodEnd;
        }
      }
    }
  }

  // 3. Fallback: Se não há registros em kore_subscriptions mas kore_companies tem stripe_subscription_id ativo
  if (bestPlan === "Free" && company) {
    if (company.plan_status === "active" && company.stripe_subscription_id) {
      bestPlan = "Pro";
      bestStatus = "active";
      activeProvider = "stripe";
      latestPeriodEnd = company.stripe_current_period_end || null;
      activeCount++;
    }
  }

  // 4. Avaliar se o workspace possui Trial ativo (se ainda for Free)
  if (bestPlan === "Free" && company?.trial_ends_at) {
    const trialEnd = new Date(company.trial_ends_at);
    if (trialEnd.getTime() > now.getTime()) {
      bestPlan = "Pro";
      bestStatus = "trialing";
      activeProvider = "manual";
      latestPeriodEnd = company.trial_ends_at;
    }
  }

  // Obter limites configurados para o plano efetivo
  const planLimits = PLANS[bestPlan as PlanType] || PLANS.Free;

  return {
    companyId,
    effectivePlan: bestPlan,
    effectiveStatus: bestStatus,
    activeProvider,
    hasUnlimitedDemands: planLimits.hasUnlimitedDemands,
    maxDemandsPerMonth: planLimits.maxDemandsPerMonth,
    maxMinutesPerMonth: planLimits.maxMinutesPerMonth,
    aiFeatures: planLimits.aiFeatures,
    canExportPDF: planLimits.canExportPDF,
    hasAdvancedReports: planLimits.hasAdvancedReports,
    canUseTags: planLimits.canUseTags,
    canUploadAttachments: planLimits.canUploadAttachments,
    customBranding: planLimits.customBranding,
    isGracePeriod,
    currentPeriodEnd: latestPeriodEnd,
    cancelAtPeriodEnd,
    activeSubscriptionsCount: activeCount,
  };
}

/**
 * Recalcula e materializa o entitlement efetivo na tabela kore_companies (cache),
 * garantindo sincronia perfeita com as assinaturas em kore_subscriptions.
 */
export async function recalculateCompanyEntitlement(
  companyId: string,
  supabase: SupabaseClient
): Promise<CompanyEntitlements> {
  const entitlements = await getCompanyEntitlements(companyId, supabase);

  // Payload seguro com campos garantidos
  const safePayload: Record<string, any> = {
    plan_status: entitlements.effectiveStatus,
  };

  if (entitlements.currentPeriodEnd) {
    safePayload.stripe_current_period_end = entitlements.currentPeriodEnd;
  }

  // Tentar primeiro update completo (com novas colunas)
  const extendedPayload = {
    ...safePayload,
    plan: entitlements.effectivePlan,
    billing_provider: entitlements.activeProvider,
    current_period_end: entitlements.currentPeriodEnd,
    cancel_at_period_end: entitlements.cancelAtPeriodEnd,
  };

  const { error: extErr } = await supabase
    .from("kore_companies")
    .update(extendedPayload)
    .eq("id", companyId);

  // Se der erro de coluna não existente no schema legado, faz update apenas dos campos base
  if (extErr) {
    await supabase
      .from("kore_companies")
      .update(safePayload)
      .eq("id", companyId);
  }

  return entitlements;
}

/**
 * Consulta os entitlements de um usuário a partir do seu ID.
 */
export async function getUserEntitlements(
  userId: string,
  supabase: SupabaseClient
): Promise<CompanyEntitlements | null> {
  const { data: companyUser, error } = await supabase
    .from("kore_company_users")
    .select("company_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !companyUser?.company_id) {
    return null;
  }

  return getCompanyEntitlements(companyUser.company_id, supabase);
}
