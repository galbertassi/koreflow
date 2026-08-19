"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const intent = formData.get("intent") as string | null;
  const plan = formData.get("plan") as string | null;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?message=Email_ou_senha_incorretos${intent ? `&intent=${intent}` : ""}${plan ? `&plan=${plan}` : ""}`);
  }

  revalidatePath("/", "layout");
  
  if (intent === "checkout" && plan) {
    redirect("/vendas");
  }

  redirect("/");
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const name = formData.get("name") as string;
  const intent = formData.get("intent") as string | null;
  const plan = formData.get("plan") as string | null;

  if (password !== confirmPassword) {
    redirect(`/login?message=As_senhas_nao_coincidem${intent ? `&intent=${intent}` : ""}${plan ? `&plan=${plan}` : ""}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      }
    }
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}${intent ? `&intent=${intent}` : ""}${plan ? `&plan=${plan}` : ""}`);
  }

  revalidatePath("/", "layout");
  
  if (intent === "checkout" && plan) {
    redirect("/vendas");
  }

  redirect("/");
}
