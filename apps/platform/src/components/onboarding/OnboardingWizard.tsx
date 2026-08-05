"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { createFirstDemandAction } from "@/app/(onboarding)/actions";

// Carregamento dinâmico do confetti (não trava o bundle inicial)
const triggerConfetti = async () => {
  try {
    const confetti = (await import("canvas-confetti")).default;
    confetti({
      particleCount: 80,
      spread: 60,
      colors: ["#8B5CF6", "#FFFFFF", "#E2E8F0"], // Roxo da marca, branco, cinza-claro
      disableForReducedMotion: true,
      zIndex: 100,
      ticks: 200, // Duração discreta (~1.2s dependendo do tick)
    });
  } catch (error) {
    console.error("Erro ao carregar confetti:", error);
  }
};

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [dueOption, setDueOption] = useState<"TODAY" | "TOMORROW" | "THIS_WEEK" | "NO_DATE" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreateDemand = async () => {
    if (!title || !dueOption) return;
    
    setIsSubmitting(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("dueOption", dueOption);

    const result = await createFirstDemandAction(formData);

    if (result.success && result.demandId) {
      await triggerConfetti();
      // Aguarda um instante para o confete aparecer antes de mudar de rota
      setTimeout(() => {
        router.replace(`/demandas?firstDemand=${result.demandId}`);
      }, 600);
    } else {
      setErrorMsg(result.error || "Erro ao criar demanda.");
      setIsSubmitting(false);
    }
  };

  // Variantes do Framer Motion para slide
  const slideVariants = {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  return (
    <div className="w-full max-w-xl mx-auto overflow-hidden min-h-[400px] flex flex-col justify-center relative">
      <AnimatePresence mode="wait">
        
        {/* PASSO 1: BOAS VINDAS */}
        {step === 1 && (
          <motion.div
            key="step1"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="text-center space-y-8"
          >
            <div className="mx-auto w-24 h-24 flex items-center justify-center mb-6 relative">
              <Image src="/flow-navegador.svg" alt="Flow" fill className="object-contain drop-shadow-sm" />
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Bem-vindo ao KORE Flow.
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              Vamos criar sua primeira demanda. Leva menos de 30 segundos.
            </p>

            <button
              onClick={() => setStep(2)}
              className="mt-8 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-8 py-4 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 mx-auto text-lg group"
            >
              Começar
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {/* PASSO 2: O QUE ENTREGAR */}
        {step === 2 && (
          <motion.div
            key="step2"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full space-y-8"
          >
            <h2 className="text-3xl font-semibold tracking-tight text-foreground text-center">
              O que você precisa entregar esta semana?
            </h2>

            <div className="relative mt-8">
              <input
                type="text"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && title.trim().length > 0) {
                    setStep(3);
                  }
                }}
                placeholder="Ex.: Finalizar apresentação do cliente XPTO"
                className="w-full text-xl md:text-2xl p-6 bg-white dark:bg-[#1A1A1A] border-2 border-border focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10 rounded-2xl outline-none transition-all placeholder:text-muted-foreground/50 shadow-sm"
                maxLength={255}
              />
            </div>

            <div className="flex justify-between items-center mt-8">
              <button
                onClick={() => setStep(1)}
                className="text-muted-foreground hover:text-foreground px-4 py-2 font-medium transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={title.trim().length === 0}
                className="bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 text-lg group"
              >
                Continuar
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {/* PASSO 3: PRAZO E CONFIRMAÇÃO */}
        {step === 3 && (
          <motion.div
            key="step3"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full space-y-8"
          >
            <h2 className="text-3xl font-semibold tracking-tight text-foreground text-center">
              Para quando é isso?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {[
                { value: "TODAY", label: "Hoje", emoji: "🔥" },
                { value: "TOMORROW", label: "Amanhã", emoji: "⚡" },
                { value: "THIS_WEEK", label: "Até sexta-feira", emoji: "📅" },
                { value: "NO_DATE", label: "Sem prazo", emoji: "☕" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDueOption(opt.value as any)}
                  disabled={isSubmitting}
                  className={`
                    p-6 rounded-2xl border-2 text-left transition-all flex items-center gap-4
                    ${
                      dueOption === opt.value
                        ? "border-[#8B5CF6] bg-[#8B5CF6]/5"
                        : "border-border bg-white dark:bg-[#1A1A1A] hover:border-muted-foreground/30"
                    }
                    ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className={`text-lg font-medium ${dueOption === opt.value ? "text-[#8B5CF6]" : "text-foreground"}`}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>

            {errorMsg && (
              <p className="text-destructive text-center font-medium mt-4">
                {errorMsg}
              </p>
            )}

            <div className="flex justify-between items-center mt-12">
              <button
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="text-muted-foreground hover:text-foreground px-4 py-2 font-medium transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleCreateDemand}
                disabled={!dueOption || isSubmitting}
                className="bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Criando demanda...
                  </>
                ) : (
                  <>Criar demanda</>
                )}
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
