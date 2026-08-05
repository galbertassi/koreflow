"use server";

import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

const DueOptionEnum = z.enum(["TODAY", "TOMORROW", "THIS_WEEK", "NO_DATE"]);

const firstDemandSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(255, "Título muito longo"),
  dueOption: DueOptionEnum,
});

export async function createFirstDemandAction(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const dueOption = formData.get("dueOption") as string;

    const parsed = firstDemandSchema.safeParse({ title, dueOption });
    
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Dados inválidos" };
    }

    const supabase = await createClient();

    // Chamamos a RPC transacional criada na migration 00011
    const { data: demandId, error } = await supabase.rpc("complete_onboarding_with_first_demand", {
      p_title: parsed.data.title,
      p_due_option: parsed.data.dueOption,
    });

    if (error) {
      console.error("Erro na RPC de onboarding:", error);
      return { success: false, error: error.message || "Erro ao processar onboarding." };
    }

    return { success: true, demandId };
  } catch (error) {
    console.error("Erro inesperado no onboarding:", error);
    return { success: false, error: "Ocorreu um erro inesperado." };
  }
}
