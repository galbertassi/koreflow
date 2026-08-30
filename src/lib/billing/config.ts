import { PlanTier } from "./types";

export const BILLING_CONFIG = {
  // Dias de carência para faturas atrasadas (grace period)
  GRACE_PERIOD_DAYS: 3,

  // Fallbacks de produtos/ofertas caso não definidos em env
  HOTMART: {
    DEFAULT_PRODUCT_ID: process.env.HOTMART_PRODUCT_ID || "DEFAULT_HOTMART_PRODUCT_ID",
    OFFERS: {
      PRO_MONTHLY: process.env.HOTMART_OFFER_PRO_MONTHLY || "KORE_FLOW_PRO_MONTHLY",
      PRO_ANNUAL: process.env.HOTMART_OFFER_PRO_ANNUAL || "KORE_FLOW_PRO_ANNUAL",
      BUSINESS: process.env.HOTMART_OFFER_BUSINESS || "KORE_FLOW_BUSINESS",
    },
  },

  STRIPE: {
    PRICES: {
      PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || "price_1TvjuSKVkoKsHX0OioHGjH2U",
      PRO_ANNUAL: process.env.STRIPE_PRICE_PRO_ANNUAL || "price_1TvjuSKVkoKsHX0O5vsgNKRO",
    },
  },
};

/**
 * Mapeia o Product ID e Offer Code da Hotmart para o PlanTier do KORE Flow.
 * A estrutura permite adicionar novas ofertas e planos sem alterar a lógica de consumo.
 */
export function resolveHotmartPlanTier(
  productId?: number | string | null,
  offerCode?: string | null
): PlanTier {
  const normalizedOffer = (offerCode || "").trim().toUpperCase();

  if (normalizedOffer.includes("BUSINESS")) {
    return "Business";
  }

  // Ofertas PRO padrão (Mensal, Anual, Vitalício ou Promoções)
  if (
    normalizedOffer === (process.env.HOTMART_OFFER_PRO_MONTHLY || "KORE_FLOW_PRO_MONTHLY").toUpperCase() ||
    normalizedOffer === (process.env.HOTMART_OFFER_PRO_ANNUAL || "KORE_FLOW_PRO_ANNUAL").toUpperCase() ||
    normalizedOffer.includes("PRO") ||
    normalizedOffer.includes("ANUAL") ||
    normalizedOffer.includes("MENSAL")
  ) {
    return "Pro";
  }

  // Se o Product ID corresponder ao produto cadastrado, retorna Pro como padrão
  if (
    productId &&
    String(productId) === String(process.env.HOTMART_PRODUCT_ID || BILLING_CONFIG.HOTMART.DEFAULT_PRODUCT_ID)
  ) {
    return "Pro";
  }

  // Fallback seguro: se a compra foi aprovada na Hotmart para o produto KORE Flow, o plano base comercializado é Pro
  return "Pro";
}
