"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function finishOnboarding(formData: FormData) {
  const demandTitle = formData.get("demandTitle") as string;
  if (!demandTitle) {
    throw new Error("O título da demanda é obrigatório.");
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 1. Pegar a company do usuário (assumindo que o personal_workspace já foi criado no login/cadastro)
  // Pegamos a primeira company associada ao usuário via kore_company_users
  const { data: userCompanies, error: companiesError } = await supabase
    .from("kore_company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .limit(1);

  if (companiesError || !userCompanies || userCompanies.length === 0) {
    console.error("Erro ao buscar company do usuário no onboarding", companiesError);
    throw new Error("Workspace não encontrado para este usuário.");
  }

  const companyId = userCompanies[0].company_id;

  // 2. Criar a primeira demanda
  const { error: demandError } = await supabase
    .from("kore_demands")
    .insert({
      company_id: companyId,
      user_id: user.id,
      title: demandTitle,
      status: "PENDING",
      priority: "MEDIUM",
      type: "IN_SCOPE"
    });

  if (demandError) {
    console.error("Erro ao criar primeira demanda:", demandError);
    throw new Error("Erro ao salvar a demanda.");
  }

  // 3. Atualizar a company marcando onboarding_completed = true
  const { error: updateError } = await supabase
    .from("kore_companies")
    .update({ onboarding_completed: true })
    .eq("id", companyId);

  if (updateError) {
    console.error("Erro ao marcar onboarding como concluído:", updateError);
  }

  // 4. Retornar sucesso em vez de redirecionar, para mostrar a tela de celebração
  revalidatePath("/", "layout");
  return { success: true };
}
