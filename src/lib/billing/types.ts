export type BillingProvider = "stripe" | "hotmart" | "manual";

export type PlanTier = "Free" | "Pro" | "Business";

export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "refunded"
  | "chargeback"
  | "trialing";

export interface SubscriptionRecord {
  id: string;
  company_id: string;
  billing_provider: BillingProvider;
  status: SubscriptionStatus;
  plan_tier: PlanTier;
  external_subscription_id?: string | null;
  external_customer_id?: string | null;
  external_transaction_id?: string | null;
  external_product_id?: string | null;
  external_offer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_customer_id?: string | null;
  stripe_price_id?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CompanyEntitlements {
  companyId: string;
  effectivePlan: PlanTier;
  effectiveStatus: SubscriptionStatus;
  activeProvider: BillingProvider | "none";
  hasUnlimitedDemands: boolean;
  maxDemandsPerMonth: number;
  maxMinutesPerMonth: number;
  aiFeatures: "Limited" | "Full";
  canExportPDF: boolean;
  hasAdvancedReports: boolean;
  canUseTags: boolean;
  canUploadAttachments: boolean;
  customBranding: boolean;
  isGracePeriod: boolean;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  activeSubscriptionsCount: number;
}

export type HotmartEvent =
  | "PURCHASE_APPROVED"
  | "PURCHASE_COMPLETE"
  | "PURCHASE_DELAYED"
  | "PURCHASE_CANCELED"
  | "PURCHASE_REFUNDED"
  | "PURCHASE_CHARGEBACK"
  | "PURCHASE_PROTEST"
  | "SUBSCRIPTION_CANCELLATION"
  | "SWITCH_PLAN"
  | string;

export interface HotmartBuyer {
  email: string;
  name?: string;
  checkout_phone?: string;
  ucode?: string;
}

export interface HotmartProduct {
  id: number | string;
  name?: string;
  ucode?: string;
}

export interface HotmartPurchase {
  transaction?: string;
  order_date?: number | string;
  approved_date?: number | string;
  status?: string;
  warranty_date?: number | string;
  expiration_date?: number | string;
  date_next_charge?: number | string;
  price?: {
    value?: number;
    currency_value?: string;
  };
  offer?: {
    code?: string;
  };
  subscription?: {
    subscriber?: {
      code?: string;
    };
    plan?: {
      id?: number | string;
      name?: string;
    };
  };
}

export interface HotmartSubscriptionData {
  subscriber?: {
    code?: string;
  };
  status?: string;
  plan?: {
    id?: number | string;
    name?: string;
  };
  date_next_charge?: number | string;
  expiration_date?: number | string;
}

export interface HotmartWebhookPayload {
  id?: string;
  creation_date?: number;
  event?: HotmartEvent;
  version?: string;
  data?: {
    product?: HotmartProduct;
    buyer?: HotmartBuyer;
    purchase?: HotmartPurchase;
    subscription?: HotmartSubscriptionData;
    affiliates?: Array<{
      affiliate_code?: string;
      name?: string;
    }>;
  };
  hottok?: string;
}
