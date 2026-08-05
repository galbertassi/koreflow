"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/hooks/use-store";
import { createClient } from "@/utils/supabase/client";

interface OnboardingGuardProps {
  reverse?: boolean;
}

export function OnboardingGuard({ reverse = false }: OnboardingGuardProps) {
  const router = useRouter();
  const supabase = createClient();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: company, error } = await supabase
          .from("kore_companies")
          .select("onboarding_completed")
          .eq("personal_owner_user_id", user.id)
          .single();

        if (error || !company) {
          // Fallback or handle missing company
          setChecking(false);
          return;
        }

        const completed = company.onboarding_completed;

        if (reverse) {
          // Está no layout do onboarding. Se já completou, manda pro produto
          if (completed) {
            router.replace("/demandas");
          } else {
            setChecking(false);
          }
        } else {
          // Está no layout do dashboard. Se NÃO completou, prende no onboarding
          if (!completed) {
            router.replace("/onboarding");
          } else {
            setChecking(false);
          }
        }
      } catch (e) {
        console.error("Erro na verificação de onboarding", e);
        setChecking(false);
      }
    }

    checkOnboarding();
  }, [router, reverse, supabase]);

  if (checking) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#8B5CF6] border-t-transparent animate-spin" />
      </div>
    );
  }

  return null;
}
