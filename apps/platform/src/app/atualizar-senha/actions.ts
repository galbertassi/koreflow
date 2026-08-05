"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string;

  const supabase = await createClient();
  
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    redirect(`/atualizar-senha?error=${encodeURIComponent(error.message || "Erro desconhecido")}`);
  }

  redirect("/login?message=Senha+atualizada+com+sucesso");
}
