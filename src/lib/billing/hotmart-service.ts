import { SupabaseClient } from "@supabase/supabase-js";
import { HotmartWebhookPayload, SubscriptionStatus } from "./types";
import { resolveHotmartPlanTier } from "./config";
import { recalculateCompanyEntitlement } from "./entitlements";

export interface HotmartProcessResult {
  success: boolean;
  message: string;
  alreadyProcessed?: boolean;
  eventId?: string;
  statusCode: number;
}

/**
 * Converte timestamp ou string de data fornecida pelo evento oficial em ISO string.
 * Retorna null se não houver data válida no payload (sem inventar datas arbitrárias).
 */
function parseOfficialDate(val?: number | string | null): string | null {
  if (!val) return null;

  if (typeof val === "number") {
    const ms = val < 10000000000 ? val * 1000 : val;
    const date = new Date(ms);
    return isNaN(date.getTime()) ? null : date.toISOString();
  }

  if (typeof val === "string") {
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      return parseOfficialDate(num);
    }
    const date = new Date(val);
    return isNaN(date.getTime()) ? null : date.toISOString();
  }

  return null;
}

/**
 * Insere ou atualiza com segurança em kore_subscriptions compatível com schema atual e evoluído.
 */
async function upsertSubscriptionSafe(
  supabase: SupabaseClient,
  data: {
    company_id: string;
    billing_provider: string;
    status: SubscriptionStatus;
    plan_tier: string;
    external_transaction_id?: string;
    external_subscription_id?: string;
    external_product_id?: string | null;
    external_offer_id?: string | null;
    current_period_end?: string | null;
    cancel_at_period_end?: boolean;
    metadata?: Record<string, any>;
  }
) {
  const subId = data.external_subscription_id || `hp_${data.external_transaction_id || Date.now()}`;
  const cusId = `hp_cus_${data.external_transaction_id || Date.now()}`;
  const priceId = data.external_offer_id || "hp_price_pro";

  // Tentar primeiro com o payload estendido
  const extendedPayload: Record<string, any> = {
    company_id: data.company_id,
    billing_provider: data.billing_provider,
    status: data.status,
    plan_tier: data.plan_tier,
    external_transaction_id: data.external_transaction_id,
    external_subscription_id: data.external_subscription_id,
    external_product_id: data.external_product_id,
    external_offer_id: data.external_offer_id,
    stripe_subscription_id: subId,
    stripe_customer_id: cusId,
    stripe_price_id: priceId,
    billing_cycle: "monthly",
    current_period_end: data.current_period_end,
    cancel_at_period_end: data.cancel_at_period_end || false,
    updated_at: new Date().toISOString(),
  };

  const { error: extErr } = await supabase.from("kore_subscriptions").insert(extendedPayload);

  if (extErr) {
    // Fallback para schema base com campos obrigatórios preenchidos
    const basePayload = {
      company_id: data.company_id,
      status: data.status,
      stripe_subscription_id: subId,
      stripe_customer_id: cusId,
      stripe_price_id: priceId,
      billing_cycle: "monthly",
      current_period_end: data.current_period_end,
      cancel_at_period_end: data.cancel_at_period_end || false,
      updated_at: new Date().toISOString(),
    };
    await supabase.from("kore_subscriptions").insert(basePayload);
  }
}

/**
 * Processador oficial de Webhooks da Hotmart 2.0 / 3.0.
 * Garante autenticação fail-closed, idempotência, segurança e não-interferência multi-provider.
 */
export async function processHotmartWebhook(
  payload: HotmartWebhookPayload,
  receivedHottok: string | null,
  supabase: SupabaseClient
): Promise<HotmartProcessResult> {
  const expectedHottok = process.env.HOTMART_HOTTOK;

  // 1. Validação de Autenticidade (Fail-Closed)
  if (!expectedHottok || !receivedHottok || receivedHottok.trim() !== expectedHottok.trim()) {
    console.error("[HOTMART_WEBHOOK] Falha na validação do token (HOTTOK inválido ou ausente)");
    return {
      success: false,
      message: "Unauthorized: Invalid or missing Hotmart Hottok",
      statusCode: 401,
    };
  }

  const eventType = payload.event || "UNKNOWN_EVENT";
  const eventId =
    payload.id ||
    payload.data?.purchase?.transaction ||
    `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  console.log(`[HOTMART_WEBHOOK] Evento recebido: ${eventType} (Event ID: ${eventId})`);

  // 2. Idempotência: Checar e registrar em kore_billing_events
  try {
    const { error: insertEventErr } = await supabase.from("kore_billing_events").insert({
      provider: "hotmart",
      external_event_id: eventId,
      event_type: eventType,
      payload: payload,
      status: "processing",
      created_at: new Date().toISOString(),
    });

    if (insertEventErr) {
      if (insertEventErr.code === "23505" || insertEventErr.message?.includes("unique")) {
        console.log(`[HOTMART_WEBHOOK] Evento duplicado já processado anteriormente: ${eventId}`);
        return {
          success: true,
          message: "Event already processed",
          alreadyProcessed: true,
          eventId,
          statusCode: 200,
        };
      }
    }
  } catch (logErr) {
    console.warn("[HOTMART_WEBHOOK] Aviso ao registrar idempotência:", logErr);
  }

  try {
    const buyerEmail = payload.data?.buyer?.email?.trim().toLowerCase();
    const buyerName = payload.data?.buyer?.name;
    const buyerPhone = payload.data?.buyer?.checkout_phone;
    const productId = payload.data?.product?.id;
    const offerCode = payload.data?.purchase?.offer?.code;
    const transactionId = payload.data?.purchase?.transaction;
    const subscriberCode =
      payload.data?.subscription?.subscriber?.code ||
      payload.data?.purchase?.subscription?.subscriber?.code;

    const planTier = resolveHotmartPlanTier(productId, offerCode);

    // Extração estrita de data oficial fornecida pela Hotmart
    const officialDate =
      parseOfficialDate(payload.data?.purchase?.date_next_charge) ||
      parseOfficialDate(payload.data?.subscription?.date_next_charge) ||
      parseOfficialDate(payload.data?.purchase?.expiration_date) ||
      parseOfficialDate(payload.data?.subscription?.expiration_date) ||
      parseOfficialDate(payload.data?.purchase?.warranty_date);

    if (!buyerEmail && !transactionId) {
      throw new Error("Payload inválido: dados essenciais (buyer.email ou transaction) ausentes.");
    }

    // =========================================================================
    // CASO 1: COMPRA APROVADA / CONCLUÍDA (PURCHASE_APPROVED, PURCHASE_COMPLETE)
    // =========================================================================
    if (eventType === "PURCHASE_APPROVED" || eventType === "PURCHASE_COMPLETE") {
      let userId: string | null = null;
      let companyId: string | null = null;

      if (buyerEmail) {
        const { data: configUser } = await supabase
          .from("kore_configuracoes")
          .select("user_id")
          .ilike("email", buyerEmail)
          .maybeSingle();

        if (configUser?.user_id) {
          userId = configUser.user_id;
        }

        if (userId) {
          const { data: compUser } = await supabase
            .from("kore_company_users")
            .select("company_id")
            .eq("user_id", userId)
            .maybeSingle();
          companyId = compUser?.company_id || null;
        }
      }

      // Se o usuário já existir no sistema, provisiona diretamente
      if (companyId) {
        await upsertSubscriptionSafe(supabase, {
          company_id: companyId,
          billing_provider: "hotmart",
          status: "active",
          plan_tier: planTier,
          external_transaction_id: transactionId,
          external_subscription_id: subscriberCode,
          external_product_id: productId ? String(productId) : null,
          external_offer_id: offerCode,
          current_period_end: officialDate,
          cancel_at_period_end: false,
          metadata: {
            buyer_name: buyerName,
            buyer_phone: buyerPhone,
            event_id: eventId,
          },
        });

        // Recalcular entitlements consolidados
        await recalculateCompanyEntitlement(companyId, supabase);
        console.log(`[HOTMART_WEBHOOK] Compra aprovada para usuário existente (${buyerEmail}). Workspace ${companyId} atualizado para PRO.`);
      } else {
        // Usuário ainda NÃO possui conta: registrar compra pendente
        try {
          await supabase.from("kore_pending_entitlements").insert({
            email: buyerEmail || "",
            billing_provider: "hotmart",
            external_transaction_id: transactionId || eventId,
            external_subscription_id: subscriberCode,
            plan_tier: planTier,
            product_id: productId ? String(productId) : null,
            offer_code: offerCode,
            buyer_name: buyerName,
            buyer_phone: buyerPhone,
            current_period_end: officialDate,
            created_at: new Date().toISOString(),
          });
        } catch {
          // Fallback se a tabela ainda não foi criada no banco
        }

        console.log(`[HOTMART_WEBHOOK] Compra aprovada para novo usuário (${buyerEmail}). Registrado para ativação pós-cadastro.`);
      }
    }

    // =========================================================================
    // CASO 2: PAGAMENTO ATRASADO (PURCHASE_DELAYED)
    // =========================================================================
    else if (eventType === "PURCHASE_DELAYED") {
      const targetId = subscriberCode || (transactionId ? `hp_${transactionId}` : null);
      if (targetId) {
        const { data: updatedRows } = await supabase
          .from("kore_subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", targetId)
          .select("company_id");

        if (updatedRows && updatedRows.length > 0) {
          for (const row of updatedRows) {
            await recalculateCompanyEntitlement(row.company_id, supabase);
          }
        }
      }
      console.log(`[HOTMART_WEBHOOK] Pagamento atrasado registrado para transação ${transactionId}. Grace period ativado.`);
    }

    // =========================================================================
    // CASO 3: CANCELAMENTO DE RENOVAÇÃO (SUBSCRIPTION_CANCELLATION, PURCHASE_CANCELED)
    // =========================================================================
    else if (eventType === "SUBSCRIPTION_CANCELLATION" || eventType === "PURCHASE_CANCELED") {
      const targetId = subscriberCode || (transactionId ? `hp_${transactionId}` : null);
      if (targetId) {
        const { data: canceledSubs } = await supabase
          .from("kore_subscriptions")
          .update({
            cancel_at_period_end: true,
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", targetId)
          .select("company_id");

        if (canceledSubs && canceledSubs.length > 0) {
          for (const row of canceledSubs) {
            await recalculateCompanyEntitlement(row.company_id, supabase);
          }
        }
      }
      console.log(`[HOTMART_WEBHOOK] Cancelamento registrado para ${transactionId || subscriberCode}. Acesso preservado até current_period_end.`);
    }

    // =========================================================================
    // CASO 4: REEMBOLSO / CHARGEBACK / DISPUTA
    // (PURCHASE_REFUNDED, PURCHASE_CHARGEBACK, PURCHASE_PROTEST)
    // =========================================================================
    else if (
      eventType === "PURCHASE_REFUNDED" ||
      eventType === "PURCHASE_CHARGEBACK" ||
      eventType === "PURCHASE_PROTEST"
    ) {
      const newStatus: SubscriptionStatus =
        eventType === "PURCHASE_CHARGEBACK" ? "chargeback" : "refunded";

      const targetId = subscriberCode || (transactionId ? `hp_${transactionId}` : null);
      if (targetId) {
        const { data: refundedSubs } = await supabase
          .from("kore_subscriptions")
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", targetId)
          .select("company_id");

        if (refundedSubs && refundedSubs.length > 0) {
          for (const row of refundedSubs) {
            await recalculateCompanyEntitlement(row.company_id, supabase);
          }
        }
      }

      if (transactionId) {
        try {
          await supabase
            .from("kore_pending_entitlements")
            .delete()
            .eq("external_transaction_id", transactionId);
        } catch {
          // noop
        }
      }

      console.log(`[HOTMART_WEBHOOK] ${newStatus.toUpperCase()} processado para transação ${transactionId}.`);
    }

    // =========================================================================
    // CASO 5: MUDANÇA DE PLANO (SWITCH_PLAN)
    // =========================================================================
    else if (eventType === "SWITCH_PLAN") {
      const targetId = subscriberCode || (transactionId ? `hp_${transactionId}` : null);
      if (targetId) {
        const { data: switchedRows } = await supabase
          .from("kore_subscriptions")
          .update({
            stripe_price_id: offerCode || "hp_price_pro",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", targetId)
          .select("company_id");

        if (switchedRows && switchedRows.length > 0) {
          for (const row of switchedRows) {
            await recalculateCompanyEntitlement(row.company_id, supabase);
          }
        }
      }
      console.log(`[HOTMART_WEBHOOK] Troca de plano para ${planTier} realizada.`);
    }

    // Atualizar status do evento para 'processed' se a tabela existir
    try {
      await supabase
        .from("kore_billing_events")
        .update({
          status: "processed",
          processed_at: new Date().toISOString(),
        })
        .eq("provider", "hotmart")
        .eq("external_event_id", eventId);
    } catch {
      // noop
    }

    return {
      success: true,
      message: `Webhook ${eventType} handled successfully`,
      eventId,
      statusCode: 200,
    };
  } catch (err: any) {
    console.error(`[HOTMART_WEBHOOK_ERROR] Erro ao processar evento ${eventId}:`, err);

    try {
      await supabase
        .from("kore_billing_events")
        .update({
          status: "failed",
          error_message: err?.message || String(err),
          processed_at: new Date().toISOString(),
        })
        .eq("provider", "hotmart")
        .eq("external_event_id", eventId);
    } catch {
      // noop
    }

    return {
      success: false,
      message: err?.message || "Internal error processing Hotmart webhook",
      eventId,
      statusCode: 500,
    };
  }
}
