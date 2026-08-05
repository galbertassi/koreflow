"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { finishOnboarding } from "./actions";
import { Loader2 } from "lucide-react";

import { useStore } from "@/hooks/use-store";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"welcome" | "demand" | "celebration">("welcome");
  const [demandTitle, setDemandTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCreateDemand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demandTitle.trim()) return;
    
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("demandTitle", demandTitle);
      
      const result = await finishOnboarding(formData);
      if (result.success) {
        setStep("celebration");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao criar demanda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4 max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        {/* PASSO 1: BEM-VINDO */}
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-8 w-full"
          >
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
                Bem-vindo ao KORE Flow.
              </h1>
              <p className="text-xl text-muted-foreground font-medium">
                Vamos criar sua primeira demanda.
              </p>
              <p className="text-base text-muted-foreground/60">
                Leva menos de 30 segundos.
              </p>
            </div>

            <button
              onClick={() => setStep("demand")}
              className="mt-8 bg-foreground text-background hover:bg-foreground/90 rounded-full px-10 py-4 text-lg font-medium transition-all hover:scale-105 active:scale-95"
            >
              Começar
            </button>
          </motion.div>
        )}

        {/* PASSO 2: CRIAR DEMANDA */}
        {step === "demand" && (
          <motion.div
            key="demand"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl text-center space-y-10"
          >
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
              O que você precisa entregar esta semana?
            </h2>

            <form onSubmit={handleCreateDemand} className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  value={demandTitle}
                  onChange={(e) => setDemandTitle(e.target.value)}
                  placeholder="Ex.: Finalizar apresentação do cliente XPTO"
                  autoFocus
                  className="w-full text-center text-xl sm:text-2xl bg-transparent border-b-2 border-border/50 focus:border-primary pb-4 outline-none transition-colors placeholder:text-muted-foreground/30 font-medium"
                  disabled={isSubmitting}
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={!demandTitle.trim() || isSubmitting}
                className="mx-auto flex items-center justify-center min-w-[200px] bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed rounded-full px-8 py-4 text-lg font-medium transition-all hover:scale-105 active:scale-95"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Criar demanda"}
              </button>
            </form>
          </motion.div>
        )}

        {/* PASSO 3: CELEBRAÇÃO */}
        {step === "celebration" && (
          <motion.div
            key="celebration"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
            className="text-center space-y-8 w-full"
          >
            <div className="text-6xl sm:text-8xl animate-bounce mb-6">
              🎉
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                Sua primeira demanda foi criada.
              </h1>
              <p className="text-lg text-muted-foreground">
                Agora você já pode começar a organizar seu trabalho.
              </p>
            </div>

            <button
              onClick={() => router.push("/demandas?first=true")}
              className="mt-8 bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 py-4 text-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-xl shadow-foreground/10"
            >
              Ir para minhas demandas
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
