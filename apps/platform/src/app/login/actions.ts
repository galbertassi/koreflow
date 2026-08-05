"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  let error;
  try {
    const supabase = await createClient();
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    error = result.error;
  } catch (err: any) {
    console.error("Erro na requisição ao Supabase:", err);
    error = { message: "Erro de conexão com o banco de dados. Verifique a URL do Supabase." };
  }

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message || "Erro desconhecido")}`);
  }

  // Se o login foi bem sucedido, garantimos o provisionamento idempotente do workspace pessoal.
  // A RPC usa auth.uid() internamente, portanto é 100% segura e não aceita injeção de user_id pelo client.
  let shouldGoToOnboarding = false;

  try {
    const supabase = await createClient();
    
    // Pegamos o nome completo (ou email) do usuário para enviar como parâmetro para a RPC
    const { data: { user } } = await supabase.auth.getUser();
    const fullName = user?.user_metadata?.full_name || user?.email || "Usuário";

    const { data: companyId, error: rpcError } = await supabase.rpc("ensure_my_personal_workspace", {
      p_full_name: fullName
    });
    
    if (rpcError) {
      console.error("Erro ao provisionar workspace:", rpcError);
    } else if (companyId) {
      // Checar se o onboarding está completo
      const { data: company } = await supabase
        .from("kore_companies")
        .select("onboarding_completed")
        .eq("id", companyId)
        .single();
      
      if (company && company.onboarding_completed === false) {
        shouldGoToOnboarding = true;
      }
    }
  } catch (err) {
    console.error("Exceção ao chamar RPC de provisionamento:", err);
  }

  revalidatePath("/", "layout");
  if (shouldGoToOnboarding) {
    redirect("/primeiros-passos");
  } else {
    redirect("/");
  }
}
