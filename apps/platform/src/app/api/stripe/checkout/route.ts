import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { stripe } from "@/lib/stripe/server";
import { billingConfig, STRIPE_PRICE_MAP, type BillingPlan } from "@/lib/billing/config";

export async function POST(req: Request) {
  if (!billingConfig.enabled) {
    return NextResponse.json(
      { error: "Billing is currently disabled." },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const planKey = body.plan as BillingPlan;

    // 1. Validar allowlist
    const priceId = STRIPE_PRICE_MAP[planKey];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Resolver o Workspace Pessoal e verificar Customer
    const { data: company, error: companyError } = await supabaseAdmin
      .from("kore_companies")
      .select("id, stripe_customer_id, kore_subscriptions(status, cancel_at_period_end)")
      .eq("personal_owner_user_id", user.id)
      .eq("workspace_type", "personal")
      .single();

    if (companyError || !company) {
      console.error("[Stripe Checkout] Company Error:", companyError, "Company:", company, "User ID:", user.id);
      return NextResponse.json(
        { error: "Personal workspace not found or you are not the owner. Detail: " + (companyError?.message || "") },
        { status: 403 }
      );
    }

    // Se já tiver sub ativa, não criar checkout novo, avisar pro client redirecionar pro portal
    const activeSub = company.kore_subscriptions?.find(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );

    if (activeSub && !activeSub.cancel_at_period_end) {
      return NextResponse.json(
        { error: "Already subscribed", redirect_to_portal: true },
        { status: 400 }
      );
    }

    let customerId = company.stripe_customer_id;

    // 3. Criar Customer caso não exista
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          company_id: company.id,
          user_id: user.id,
        },
      });
      customerId = customer.id;

      await supabaseAdmin
        .from("kore_companies")
        .update({ stripe_customer_id: customerId })
        .eq("id", company.id);
    }

    // 4. Construir metadata exigida
    const sessionMetadata = {
      company_id: company.id,
      user_id: user.id,
      billing_plan: planKey,
    };

    // 5. Criar a sessão no Stripe
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: sessionMetadata,
      subscription_data: {
        metadata: sessionMetadata,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}${billingConfig.returnUrls.success}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}${billingConfig.returnUrls.cancel}`,
    });

    if (!session.url) {
      throw new Error("Failed to create checkout session URL.");
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("[Stripe Checkout Error]:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
