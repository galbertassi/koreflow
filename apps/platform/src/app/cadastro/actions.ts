"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  
  if (!email || !password || !fullName) {
    redirect("/cadastro?error=Todos_os_campos_são_obrigatórios");
  }

  const supabase = await createClient();

  // 1. Criar a conta
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  });

  if (authError) {
    redirect(`/cadastro?error=${authError.message.replace(/ /g, "_")}`);
    return;
  }

  // Se a confirmação de email estiver desativada, o Supabase já nos retorna a sessão (user logado)
  if (authData.session) {
    try {
      const { error: rpcError } = await supabase.rpc("ensure_my_personal_workspace", {
        p_full_name: fullName
      });
      
      if (!rpcError) {
        redirect("/primeiros-passos");
        return;
      }
    } catch (err) {
      console.error("Erro ao provisionar workspace no cadastro:", err);
    }
  }

  // Fallback: se não houver sessão ou houver erro, exige login manual
  redirect(`/login?message=${encodeURIComponent("Conta criada com sucesso! Faça login para entrar.")}`);
}
