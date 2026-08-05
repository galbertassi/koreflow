"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function recoverPassword(formData: FormData) {
  const email = formData.get("email") as string;

  const supabase = await createClient();
  
  const origin = process.env.NEXT_PUBLIC_SITE_URL 
    ? process.env.NEXT_PUBLIC_SITE_URL 
    : process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/atualizar-senha`,
  });

  if (error) {
    redirect(`/recuperar-senha?error=${encodeURIComponent(error.message || "Erro desconhecido")}`);
  }

  redirect("/recuperar-senha?success=true");
}
