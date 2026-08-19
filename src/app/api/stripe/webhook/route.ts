import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy_key_for_build", {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "dummy_secret";

// Usar client admin para poder atualizar a tabela no webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy_key"
);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      
      const customerId = session.customer as string;
      const companyId = session.metadata?.company_id;

      if (!companyId) {
        console.error("No company_id found in session metadata");
        return new NextResponse("Webhook error: No company_id", { status: 400 });
      }

      // Determinar o plano pelo preço
      const priceId = subscription.items.data[0].price.id;
      let plan = "Free";
      if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) plan = "Pro";
      if (priceId === process.env.STRIPE_PRICE_PRO_ANNUAL) plan = "Pro";

      await supabaseAdmin
        .from("kore_companies")
        .update({
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customerId,
          stripe_price_id: priceId,
          stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          plan_status: "active",
          plan: plan,
        })
        .eq("id", companyId);
        
    }

    if (event.type === "invoice.payment_succeeded") {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      
      const priceId = subscription.items.data[0].price.id;
      let plan = "Free";
      if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) plan = "Pro";
      if (priceId === process.env.STRIPE_PRICE_PRO_ANNUAL) plan = "Pro";

      await supabaseAdmin
        .from("kore_companies")
        .update({
          stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          plan_status: "active",
          plan: plan,
        })
        .eq("stripe_subscription_id", subscription.id);
    }

    if (event.type === "invoice.payment_failed") {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      
      await supabaseAdmin
        .from("kore_companies")
        .update({
          plan_status: "past_due",
          plan: "Free",
        })
        .eq("stripe_subscription_id", subscription.id);
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      
      await supabaseAdmin
        .from("kore_companies")
        .update({
          plan_status: "canceled",
          plan: "Free",
        })
        .eq("stripe_subscription_id", subscription.id);
    }

    return new NextResponse("Webhook handled successfully", { status: 200 });
  } catch (error: any) {
    console.error("[STRIPE_WEBHOOK_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
