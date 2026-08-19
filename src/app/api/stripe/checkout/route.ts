import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy_key_for_build", {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Bypass RLS using service role client to avoid infinite recursion error in RLS
    const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: companyUser } = await supabaseAdmin
      .from('kore_company_users')
      .select('company_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!companyUser?.company_id) {
       return new NextResponse("User has no workspace", { status: 400 });
    }

    const { plan } = await req.json();

    // Determinar o Price ID do Stripe baseado no plano
    let priceId = "";
    if (plan === "PRO_MONTHLY") {
      priceId = process.env.STRIPE_PRICE_PRO_MONTHLY || "";
    } else if (plan === "PRO_ANNUAL") {
      priceId = process.env.STRIPE_PRICE_PRO_ANNUAL || "";
    }

    if (!priceId) {
      return new NextResponse("Price ID not configured", { status: 400 });
    }

    // Pegar o customer ID se já existir
    const { data: userData } = await supabaseAdmin
      .from("kore_configuracoes")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    let stripeCustomerId = userData?.stripe_customer_id;

    if (!stripeCustomerId) {
      // Criar novo customer no Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id
        }
      });
      stripeCustomerId = customer.id;

      // Atualizar no banco (upsert garante que a linha vai existir mesmo para usuarios novos)
      await supabaseAdmin
        .from("kore_configuracoes")
        .upsert({ 
          user_id: user.id,
          stripe_customer_id: stripeCustomerId,
          nome: user.email?.split('@')[0] || 'Usuário',
          email: user.email || ''
        }, { onConflict: 'user_id' });
    }

    // Criar a sessão de checkout
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/configuracoes?success=true`,
      cancel_url: `${appUrl}/vendas`,
      metadata: {
        user_id: user.id,
        company_id: companyUser.company_id
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("[STRIPE_CHECKOUT_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}
