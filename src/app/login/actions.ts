"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { claimPendingEntitlements } from "@/lib/billing/claim-pending";

function getAdminClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://urybvljsmrwxmfjcgdvt.supabase.co";
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyeWJ2bGpzbXJ3eG1mamNnZHZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIyMTY0NCwiZXhwIjoyMDk2Nzk3NjQ0fQ.WPRAuBLsvuyAuGWIsAhk82U9Bj1Yu9upBpOLgq3hwQE";
  return createSupabaseAdmin(supabaseUrl, serviceRoleKey);
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const intent = formData.get("intent") as string | null;
  const plan = formData.get("plan") as string | null;

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?message=Email_ou_senha_incorretos${intent ? `&intent=${intent}` : ""}${plan ? `&plan=${plan}` : ""}`);
  }

  // Reivindicar compras pendentes da Hotmart automaticamente
  if (authData.user && email) {
    try {
      const admin = getAdminClient();
      await claimPendingEntitlements(authData.user.id, email, admin);
    } catch (claimErr) {
      console.warn("[LOGIN] Falha não-bloqueante ao reivindicar pendências:", claimErr);
    }
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
  const { data: authData, error } = await supabase.auth.signUp({
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

  // Reivindicar compras pendentes da Hotmart automaticamente
  if (authData.user && email) {
    try {
      const admin = getAdminClient();
      await claimPendingEntitlements(authData.user.id, email, admin);
    } catch (claimErr) {
      console.warn("[SIGNUP] Falha não-bloqueante ao reivindicar pendências:", claimErr);
    }
  }

  revalidatePath("/", "layout");
  
  if (intent === "checkout" && plan) {
    redirect("/vendas");
  }

  redirect("/");
}
