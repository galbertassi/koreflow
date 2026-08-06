import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@supabase/supabase-js"; // Usamos service_role client para webhooks!
import { billingConfig } from "@/lib/billing/config";
import type Stripe from "stripe";

// Usando o Supabase Admin (Service Role) para Webhooks (Bypass RLS)
// Envolvido em função para evitar que o Next.js falhe no build por falta de variáveis
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    {
      auth: { persistSession: false },
    }
  );
}

// Trata todos os eventos do stripe relacionados a assinatura
const RELEVANT_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.payment_action_required",
]);

export async function POST(req: Request) {
  if (!billingConfig.enabled) {
    return NextResponse.json({ error: "Billing disabled" }, { status: 400 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`[Webhook] Signature verification failed: ${err.message}`);
    return NextResponse.json({ error: "Webhook Error: Invalid signature" }, { status: 400 });
  }

  if (!RELEVANT_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true }); // Ignora outros eventos
  }

  // Verificar Livemode (Ambiente)
  if (
    (billingConfig.mode === "test" && event.livemode) ||
    (billingConfig.mode === "live" && !event.livemode)
  ) {
    console.error(`[Webhook] Event livemode mismatch. Config: ${billingConfig.mode}`);
    return NextResponse.json({ error: "Environment mismatch" }, { status: 400 });
  }

  try {
    // IDEMPOTÊNCIA: Inserir em kore_stripe_events como 'pending'
    const { data: insertedEvent, error: insertError } = await getSupabaseAdmin()
      .from("kore_stripe_events")
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        livemode: event.livemode,
        stripe_created_at: new Date(event.created * 1000).toISOString(),
        status: "pending",
        attempt_count: 1,
      })
      .select("id")
      .single();

    if (insertError) {
      if (insertError.code === "23505") { // Unique violation
        // Evento já foi processado ou está em processamento.
        return NextResponse.json({ received: true, note: "Already processed or pending." });
      }
      throw new Error(`Failed to log stripe event: ${insertError.message}`);
    }

    const eventId = insertedEvent.id;

    // Processamento Transacional
    try {
      await processStripeEvent(event);

      // Sucesso -> Marcar processed
      await getSupabaseAdmin()
        .from("kore_stripe_events")
        .update({ status: "processed", processed_at: new Date().toISOString() })
        .eq("id", eventId);

      return NextResponse.json({ received: true });
    } catch (processError: any) {
      // Erro -> Marcar failed
      console.error(`[Webhook] Error processing event ${event.id}:`, processError);
      await getSupabaseAdmin().rpc("increment_stripe_event_attempt", {
        event_uuid: eventId,
        err_msg: processError.message,
      });
      // Para o Retry funcionar (até 3 dias), temos que devolver erro HTTP
      return NextResponse.json({ error: processError.message, stack: processError.stack }, { status: 500 });
    }
  } catch (err: any) {
    console.error(`[Webhook] Global error:`, err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

async function processStripeEvent(event: Stripe.Event) {
  let subscriptionId: string | null = null;
  let customerId: string | null = null;
  let metadata: Record<string, string> = {};

  // Extrair ID da assinatura do evento (cada objeto tem propriedades diferentes)
  const obj = event.data.object as any;

  if (event.type.startsWith("checkout.session.")) {
    const session = obj as Stripe.Checkout.Session;
    if (session.mode !== "subscription") return;
    subscriptionId = session.subscription as string;
    customerId = session.customer as string;
    metadata = session.metadata || {};
  } else if (event.type.startsWith("invoice.")) {
    const invoice = obj as any;
    subscriptionId = invoice.subscription as string;
    customerId = invoice.customer as string;
  } else if (event.type.startsWith("customer.subscription.")) {
    const sub = obj as Stripe.Subscription;
    subscriptionId = sub.id;
    customerId = sub.customer as string;
    metadata = sub.metadata || {};
  }

  if (!subscriptionId) return;

  // Em todos os casos, a fonte de verdade para UPSERT é o objeto Subscription direto da API da Stripe.
  // Isso evita dependência de ordem dos webhooks!
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  if (!subscription) {
    throw new Error(`Subscription ${subscriptionId} not found in Stripe API`);
  }

  const mergedMetadata = { ...metadata, ...subscription.metadata };
  const companyId = mergedMetadata.company_id;

  if (!companyId) {
    throw new Error(`Missing company_id in metadata for subscription ${subscriptionId}`);
  }

  console.log("Stripe Subscription Retrieved:", JSON.stringify(subscription, null, 2));

  const subAny = subscription as any;
  const currentPeriodStart = subAny.current_period_start 
    ? new Date(subAny.current_period_start * 1000).toISOString() 
    : new Date().toISOString();
    
  const currentPeriodEnd = subAny.current_period_end 
    ? new Date(subAny.current_period_end * 1000).toISOString() 
    : new Date().toISOString();

  // Prepara o objeto para UPSERT em kore_subscriptions
  const upsertData = {
    company_id: companyId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: subscription.items.data[0]?.price.id || "",
    billing_cycle: subscription.items.data[0]?.plan.interval === "year" ? "annual" : "monthly",
    status: subscription.status,
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodEnd,
    cancel_at_period_end: subscription.cancel_at_period_end,
    status_changed_at: new Date().toISOString(), // aproximação do evento atual
    last_synced_at: new Date().toISOString(),
    last_stripe_event_id: event.id,
  };

  // Tratar `past_due_since` logic:
  // Se o status for past_due e não existia, setamos o timestamp atual.
  // Se for active, cancelamos. Mas para não apagar no Upsert, faremos em duas etapas ou via RPC.
  // Vamos buscar a assinatura local atual primeiro:
  const { data: localSub } = await getSupabaseAdmin()
    .from("kore_subscriptions")
    .select("status, past_due_since")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  let finalPastDueSince = localSub?.past_due_since;

  if (subscription.status === "past_due") {
    if (localSub?.status !== "past_due" || !finalPastDueSince) {
      finalPastDueSince = new Date().toISOString();
    }
  } else if (subscription.status === "active" || subscription.status === "canceled") {
    finalPastDueSince = null; // limpa o past_due_since
  }

  // Executa o UPSERT usando constraint no stripe_subscription_id
  const { error: upsertError } = await getSupabaseAdmin()
    .from("kore_subscriptions")
    .upsert(
      { ...upsertData, past_due_since: finalPastDueSince },
      { onConflict: "stripe_subscription_id" }
    );

  if (upsertError) {
    throw new Error(`Failed to upsert subscription: ${upsertError.message}`);
  }
}
