export const billingConfig = {
  enabled: true,
  provider: "stripe",
  trialDays: 14,
  freeDemandLimit: 10,
  pastDueGraceDays: 3,
  plans: {
    PRO_MONTHLY: "PRO_MONTHLY",
    PRO_ANNUAL: "PRO_ANNUAL",
  },
  returnUrls: {
    success: "/configuracoes/assinatura/sucesso",
    cancel: "/configuracoes/assinatura/cancelado",
  },
  mode: process.env.STRIPE_ENVIRONMENT || "test",
};

// Validar variáveis de ambiente na inicialização (somente no lado do servidor)
if (typeof window === "undefined" && billingConfig.enabled) {
  const requiredEnvVars = [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRICE_PRO_MONTHLY",
    "STRIPE_PRICE_PRO_ANNUAL",
    "NEXT_PUBLIC_APP_URL",
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`[Billing] Missing required environment variable: ${envVar}`);
    }
  }
}

export const STRIPE_PRICE_MAP = {
  PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY as string,
  PRO_ANNUAL: process.env.STRIPE_PRICE_PRO_ANNUAL as string,
} as const;

export type BillingPlan = keyof typeof STRIPE_PRICE_MAP;
