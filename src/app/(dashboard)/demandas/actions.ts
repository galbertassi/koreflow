"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getUserEntitlements } from "@/lib/billing/entitlements";

// Tipo auxiliar para retorno
type ActionResponse<T = any> = { success: true; data?: T } | { success: false; error: string };

async function ensureCompanyAndEntitlement() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usu├írio n├úo autenticado");

  const { data: companyUser } = await supabase
    .from("kore_company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!companyUser) throw new Error("Workspace n├úo encontrado");

  // TODO: Em uma implementa├º├úo futura, checar├¡amos os limites baseados no plano
  // const entitlements = await getUserEntitlements();
  // if (!entitlements.hasUnlimitedDemands && currentUsage >= limits) throw new Error("Limite atingido")

  return { supabase, user, companyId: companyUser.company_id };
}

export async function createDemand(data: {
  title: string;
  client_name?: string;
  category_name?: string;
  category_color?: string;
  type?: string;
  priority?: string;
  description?: string;
}): Promise<ActionResponse> {
  try {
    const { supabase, user, companyId } = await ensureCompanyAndEntitlement();

    const { data: inserted, error } = await supabase.from("kore_demands").insert({
      user_id: user.id,
      company_id: companyId,
      title: data.title,
      client_name: data.client_name,
      category_name: data.category_name,
      category_color: data.category_color,
      type: data.type || "IN_SCOPE",
      priority: data.priority || "MEDIUM",
      status: "PENDING",
      description: data.description,
      spent_time_seconds: 0
    }).select().single();

    if (error) throw error;

    revalidatePath("/demandas");
    return { success: true, data: JSON.parse(JSON.stringify(inserted)) };
  } catch (error: any) {
    console.error("createDemand error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateDemand(id: string, updates: any): Promise<ActionResponse> {
  try {
    const { supabase, user, companyId } = await ensureCompanyAndEntitlement();

    // RLS will ensure user can only update demands they have access to
    const { data: updated, error } = await supabase
      .from("kore_demands")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/demandas");
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    console.error("updateDemand error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteDemand(id: string): Promise<ActionResponse> {
  try {
    const { supabase } = await ensureCompanyAndEntitlement();

    const { error } = await supabase.from("kore_demands").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/demandas");
    return { success: true };
  } catch (error: any) {
    console.error("deleteDemand error:", error);
    return { success: false, error: error.message };
  }
}

export async function playDemand(id: string): Promise<ActionResponse> {
  try {
    const { supabase, user } = await ensureCompanyAndEntitlement();

    // Check if there is an active timer
    const { data: active } = await supabase
      .from("kore_demand_time_logs")
      .select("id")
      .eq("user_id", user.id)
      .is("ended_at", null)
      .maybeSingle();

    if (active) {
      await supabase.from("kore_demand_time_logs").update({ ended_at: new Date().toISOString() }).eq("id", active.id);
    }

    const { error } = await supabase.from("kore_demand_time_logs").insert({
      demand_id: id,
      user_id: user.id
    });
    
    if (error) throw error;

    revalidatePath("/demandas");
    return { success: true };
  } catch (error: any) {
    console.error("playDemand error:", error);
    return { success: false, error: error.message };
  }
}

export async function pauseDemand(id: string, additionalSeconds?: number): Promise<ActionResponse> {
  try {
    const { supabase, user } = await ensureCompanyAndEntitlement();

    const { data: active } = await supabase
      .from("kore_demand_time_logs")
      .select("*")
      .eq("demand_id", id)
      .eq("user_id", user.id)
      .is("ended_at", null)
      .maybeSingle();

    let secondsToAdd = additionalSeconds || 0;

    if (active) {
      const endedAt = new Date();
      const startedAt = new Date(active.started_at);
      const calculated = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);
      if (calculated > 0) secondsToAdd = calculated;

      await supabase.from("kore_demand_time_logs").update({ ended_at: endedAt.toISOString() }).eq("id", active.id);
    }

    const { data: demand } = await supabase.from("kore_demands").select("spent_time_seconds").eq("id", id).single();
    if (demand) {
      const newTime = (demand.spent_time_seconds || 0) + secondsToAdd;
      await supabase.from("kore_demands").update({
        spent_time_seconds: newTime
      }).eq("id", id);
    }

    revalidatePath("/demandas");
    return { success: true };
  } catch (error: any) {
    console.error("pauseDemand error:", error);
    return { success: false, error: error.message };
  }
}

export async function completeDemand(id: string): Promise<ActionResponse> {
  try {
    const { supabase } = await ensureCompanyAndEntitlement();

    const { error } = await supabase.rpc("complete_demand", { p_demand_id: id });
    if (error) throw error;

    revalidatePath("/demandas");
    return { success: true };
  } catch (error: any) {
    console.error("completeDemand error:", error);
    return { success: false, error: error.message };
  }
}

export async function resetDemandTime(id: string): Promise<ActionResponse> {
  try {
    const { supabase, user } = await ensureCompanyAndEntitlement();

    const { data: active } = await supabase
      .from("kore_demand_time_logs")
      .select("*")
      .eq("demand_id", id)
      .eq("user_id", user.id)
      .is("ended_at", null)
      .maybeSingle();

    if (active) {
      await supabase.from("kore_demand_time_logs").update({ ended_at: new Date().toISOString() }).eq("id", active.id);
    }

    await supabase.from("kore_demands").update({
      spent_time_seconds: 0
    }).eq("id", id);

    revalidatePath("/demandas");
    return { success: true };
  } catch (error: any) {
    console.error("resetDemandTime error:", error);
    return { success: false, error: error.message };
  }
}
