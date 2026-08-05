import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { stripe } from "@/lib/stripe/server";
import { billingConfig } from "@/lib/billing/config";

export async function POST(req: Request) {
  if (!billingConfig.enabled) {
    return NextResponse.json(
      { error: "Billing is currently disabled." },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Validação Administrativa Exigida (Apenas owners podem acessar)
    // Aqui buscamos a company baseando no membership = owner. No momento 
    // a estrutura inicial foca no personal workspace.
    const { data: company, error: companyError } = await supabaseAdmin
      .from("kore_companies")
      .select("id, stripe_customer_id")
      .eq("personal_owner_user_id", user.id)
      .eq("workspace_type", "personal")
      .single();

    // Verificando formalmente no link (mesmo sendo personal) se o cara está como owner
    const { data: membership } = await supabaseAdmin
      .from("kore_company_users")
      .select("role")
      .eq("company_id", company?.id || "")
      .eq("user_id", user.id)
      .single();

    if (companyError || !company || membership?.role !== "owner") {
      console.error("[Stripe Portal] Company Error:", companyError, "Company:", company, "User ID:", user.id);
      return NextResponse.json(
        { error: "Personal workspace not found or you are not the owner. Detail: " + (companyError?.message || "") },
        { status: 403 }
      );
    }

    if (!company.stripe_customer_id) {
      return NextResponse.json(
        { error: "No active customer found for this workspace." },
        { status: 404 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: company.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/configuracoes`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("[Stripe Portal Error]:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
