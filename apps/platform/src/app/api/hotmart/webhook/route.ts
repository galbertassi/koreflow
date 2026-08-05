import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usamos @supabase/supabase-js diretamente com o SERVICE_ROLE_KEY 
// porque Webhooks não têm contexto de usuário logado (cookies)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Hotmart geralmente envia 'event' = 'PURCHASE_APPROVED' (webhook versão 2.0+)
    // Vamos suportar um payload genérico também para testes manuais.
    
    // Extraindo dados:
    const event = body.event || body.status; // 'PURCHASE_APPROVED' ou 'APPROVED'
    
    // Tenta pegar da estrutura Hotmart v2.0, se não, cai pro raiz.
    const email = body.data?.buyer?.email || body.email;
    const productName = body.data?.product?.name || body.productName || "";
    
    if (!email) {
      return NextResponse.json({ error: "Email não encontrado no payload." }, { status: 400 });
    }

    if (event === "PURCHASE_APPROVED" || event === "APPROVED" || event === "active") {
      
      // Define o plano baseado no nome do produto (Exemplo rudimentar, na prática usa-se IDs de produto)
      let plan = "Pro";
      if (productName.toLowerCase().includes("business") || body.plan === "Business") {
        plan = "Business";
      } else if (productName.toLowerCase().includes("free") || body.plan === "Free") {
        plan = "Free";
      } else if (body.plan) {
        plan = body.plan;
      }

      // Upsert no banco
      const { error } = await supabase
        .from("kore_approved_customers")
        .upsert({
          email: email.toLowerCase(),
          plan: plan,
          status: "active",
          updated_at: new Date().toISOString()
        }, { onConflict: "email" });

      if (error) {
        console.error("Erro ao inserir em approved_customers:", error);
        return NextResponse.json({ error: "Erro no banco de dados." }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: `Email ${email} aprovado com o plano ${plan}.` }, { status: 200 });
    } else {
      // Outros eventos (Reembolso, Cancelamento) podem alterar o status para 'inactive'
      if (event === "PURCHASE_CANCELED" || event === "PURCHASE_REFUNDED") {
        await supabase
          .from("kore_approved_customers")
          .update({ status: "inactive", updated_at: new Date().toISOString() })
          .eq("email", email.toLowerCase());
        
        return NextResponse.json({ success: true, message: `Acesso revogado para ${email}.` }, { status: 200 });
      }

      return NextResponse.json({ success: true, message: "Evento ignorado." }, { status: 200 });
    }
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }
}
