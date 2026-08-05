export type AccessReason =
  | "INTERNAL_TRIAL"
  | "STRIPE_TRIAL"
  | "ACTIVE_SUBSCRIPTION"
  | "PAST_DUE_GRACE_PERIOD"
  | "CANCELED_UNTIL_PERIOD_END"
  | "FREE_PLAN"
  | "TRIAL_EXPIRED"
  | "SUBSCRIPTION_INACTIVE";

export type PlanType = "FREE" | "PRO";

export interface Entitlements {
  effectivePlan: PlanType;
  accessReason: AccessReason;
  features: {
    canUseAI: boolean;
    canExportReports: boolean;
    canUseAdvancedReports: boolean;
    canUseAdvancedTimer: boolean;
    canAccessCompleteHistory: boolean;
  };
  limits: {
    maxActiveDemands: number | null; // null = unlimited
  };
}

export interface WorkspaceContext {
  userId: string;
  companyId: string;
}
