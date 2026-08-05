import { createClient } from "@/utils/supabase/server";
import { billingConfig } from "./config";
import type { Entitlements, WorkspaceContext, AccessReason } from "./types";

/**
 * Returns the default entitlements for the FREE plan.
 */
const getFreeEntitlements = (reason: AccessReason = "FREE_PLAN"): Entitlements => ({
  effectivePlan: "FREE",
  accessReason: reason,
  features: {
    canUseAI: false,
    canExportReports: false,
    canUseAdvancedReports: false,
    canUseAdvancedTimer: false,
    canAccessCompleteHistory: false,
  },
  limits: {
    maxActiveDemands: billingConfig.freeDemandLimit,
  },
});

/**
 * Returns the default entitlements for the PRO plan.
 */
const getProEntitlements = (reason: AccessReason): Entitlements => ({
  effectivePlan: "PRO",
  accessReason: reason,
  features: {
    canUseAI: true,
    canExportReports: true,
    canUseAdvancedReports: true,
    canUseAdvancedTimer: true,
    canAccessCompleteHistory: true,
  },
  limits: {
    maxActiveDemands: null, // Unlimited
  },
});

/**
 * Resolves the entitlements for a given user and workspace.
 * This is the ONLY source of truth for authorization in the application.
 */
export async function getUserEntitlements({ userId, companyId }: WorkspaceContext): Promise<Entitlements> {
  // If billing is disabled, default to PRO for everything to avoid blocking development.
  if (!billingConfig.enabled) {
    return getProEntitlements("INTERNAL_TRIAL");
  }

  const supabase = await createClient();

  // 1. Verify if the user actually belongs to this company (security check)
  const { data: membership, error: membershipError } = await supabase
    .from("kore_company_users")
    .select("id")
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .single();

  if (membershipError || !membership) {
    // If the user doesn't belong to the company, fallback to free limits (or throw).
    // In our architecture, middleware should block this earlier, but we are defensive.
    return getFreeEntitlements();
  }

  // 2. Fetch company and subscription data
  const { data: company, error: companyError } = await supabase
    .from("kore_companies")
    .select(`
      trial_started_at,
      trial_ends_at,
      kore_subscriptions (
        status,
        past_due_since,
        cancel_at_period_end
      )
    `)
    .eq("id", companyId)
    .single();

  if (companyError || !company) {
    return getFreeEntitlements();
  }

  const subscription = company.kore_subscriptions?.[0];

  // 3. Evaluate Subscription State first (Stripe overrides internal trial)
  if (subscription) {
    const { status, past_due_since, cancel_at_period_end } = subscription;

    if (status === "active") {
      if (cancel_at_period_end) {
        return getProEntitlements("CANCELED_UNTIL_PERIOD_END");
      }
      return getProEntitlements("ACTIVE_SUBSCRIPTION");
    }

    if (status === "trialing") {
      return getProEntitlements("STRIPE_TRIAL");
    }

    if (status === "past_due") {
      if (past_due_since) {
        const pastDueSinceDate = new Date(past_due_since);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - billingConfig.pastDueGraceDays);

        if (pastDueSinceDate >= cutoffDate) {
          // Still within grace period
          return getProEntitlements("PAST_DUE_GRACE_PERIOD");
        }
      }
      // Past the grace period or no past_due_since recorded
      return getFreeEntitlements("SUBSCRIPTION_INACTIVE");
    }

    // For canceled, incomplete, incomplete_expired, unpaid, etc.
    return getFreeEntitlements("SUBSCRIPTION_INACTIVE");
  }

  // 4. Evaluate Internal Trial (If no subscription exists)
  if (company.trial_ends_at) {
    const trialEndsAt = new Date(company.trial_ends_at);
    const now = new Date();
    
    if (trialEndsAt > now) {
      return getProEntitlements("INTERNAL_TRIAL");
    }
    
    // Trial expired, fallback to free
    return getFreeEntitlements("TRIAL_EXPIRED");
  }

  // 5. Default Fallback
  return getFreeEntitlements("FREE_PLAN");
}
