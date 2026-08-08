"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Clock, Target, Zap, LayoutDashboard, Brain, FileText, Search, Shield, ChevronRight, ChevronLeft, Check, X, ArrowUp, MessageCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { HeroSimulation } from "@/components/landing/simulation/HeroSimulation";

export default function VendasPremiumPage() {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (planKey: string) => {
    setLoadingPlan(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      
      if (res.status === 401 || res.status === 403) {
        // Usuário não autenticado ou sem permissão - direciona pro onboarding
        window.location.href = `${process.env.NEXT_PUBLIC_APP_URL || ''}/cadastro?intent=checkout&plan=${planKey}`;
        return;
      }
      
      if (data.url) {
        window.location.href = data.url;
      } else if (data.redirect_to_portal) {
        // Já possui assinatura
        const portalRes = await fetch("/api/stripe/portal", { method: "POST" });
        const portalData = await portalRes.json();
        if (portalData.url) window.location.href = portalData.url;
      } else {
        alert(data.error || "Erro ao iniciar checkout");
      }
    } catch (err) {
      console.error(err);
      alert("Falha na comunicação com o servidor.");
    } finally {
      setLoadingPlan(null);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappNumber = "5524999999345";
  const whatsappMessage = encodeURIComponent("Olá! Gostaria de saber mais sobre o KORE Flow.");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const galleryImages = [
    "/controle de demanda.png",
    "/Timer Inteligente.png",
    "/Kore Ai.png",
    "/dashboard executivo.png",
    "/etiquetas.png"
  ];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!zoomedImage) return;
    const currentIndex = galleryImages.indexOf(zoomedImage);
    const newIndex = currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1;
    setZoomedImage(galleryImages[newIndex]);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!zoomedImage) return;
    const currentIndex = galleryImages.indexOf(zoomedImage);
    const newIndex = currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1;
    setZoomedImage(galleryImages[newIndex]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] overflow-x-clip font-sans">

      {/* 1. HERO CINEMATOGRÁFICO (FOTOGRAFIA CONTÍNUA - SEM CORTES) */}
      <section className="relative w-full bg-[#0A0A0A] overflow-hidden flex flex-col lg:block lg:min-h-screen pt-32 pb-0 lg:pt-0 lg:pb-0">

        {/* Efeito Glow (Estático) - Topo no mobile, Direita no Desktop */}
        <div className="absolute top-[5%] lg:top-1/2 left-1/2 lg:left-auto lg:right-[5%] -translate-x-1/2 lg:translate-x-0 -translate-y-1/2 w-[120vw] h-[120vw] lg:w-[40vw] lg:h-[40vw] bg-[#8B5CF6]/20 lg:bg-[#8B5CF6]/15 blur-[120px] rounded-full z-0 transform-gpu will-change-transform pointer-events-none"></div>

        {/* Partículas sutis no ar */}
        <div className="absolute top-[30%] left-[60%] w-1 h-1 bg-[#8B5CF6]/40 rounded-full blur-[1px]"></div>
        <div className="absolute top-[60%] left-[80%] w-1.5 h-1.5 bg-[#8B5CF6]/30 rounded-full blur-[2px]"></div>
        <div className="absolute top-[40%] left-[45%] w-2 h-2 bg-[#8B5CF6]/20 rounded-full blur-[3px]"></div>

        {/* Conteúdo sobreposto - Mobile: Topo | Desktop: Esquerda Absoluto */}
        <div className="relative lg:absolute inset-0 z-10 w-full flex flex-col justify-center pointer-events-none lg:h-full order-1 lg:order-none">

          {/* Gradiente sutil ajustado para revelar mais dos detalhes originais da imagem (Apenas Desktop) */}
          <div className="hidden lg:block absolute inset-0 z-0 bg-gradient-to-r from-[#0A0A0A]/90 via-[#0A0A0A]/30 to-transparent w-full lg:w-[45%]"></div>

          {/* Conteúdo */}
          <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 lg:px-12 xl:px-16 lg:-mt-16 pointer-events-auto flex justify-start">
            <div
              className="w-full max-w-full sm:max-w-[80%] lg:max-w-[400px] xl:max-w-[450px] 2xl:max-w-[500px] flex flex-col items-start text-left z-20"
            >
              <h1 className="text-white font-bold text-4xl sm:text-5xl lg:text-[48px] xl:text-[54px] leading-[1.15] tracking-tight mb-5 drop-shadow-2xl">
                Seu trabalho muda o tempo todo. <span className="text-[#8B5CF6] drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">Seu controle não deveria mudar.</span>
              </h1>

              <p className="text-gray-300 text-base md:text-lg lg:text-xl font-light mb-8 max-w-[95%] leading-relaxed drop-shadow-lg">
                O KORE Flow acompanha tudo o que acontece durante o seu dia para que nenhuma entrega importante seja esquecida.
              </p>

              <div className="flex flex-col items-center lg:items-start gap-4">
                <a
                  href={`${process.env.NEXT_PUBLIC_APP_URL || ''}/cadastro`}
                  className="group relative overflow-hidden flex items-center gap-3 bg-[#6D28D9] hover:bg-[#5B21B6] text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-medium text-base md:text-lg transition-all duration-300 shadow-[0_4px_20px_rgba(109,40,217,0.4)] hover:shadow-[0_8px_40px_rgba(109,40,217,0.7)] border border-white/5 hover:border-white/20"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out"></div>
                  <span className="relative z-10">Começar gratuitamente</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Fotografia Original e Simulação 3D */}
        <div
          className="relative w-full h-full max-w-[1920px] mx-auto flex items-center z-0 order-2 lg:order-none mt-12 lg:mt-0 lg:absolute lg:inset-0"
          style={{
            // Variáveis de ajuste fino para o 3D da tela
            // Estes valores são iniciais e podem ser ajustados posteriormente
            '--screen-top': '14.5%',
            '--screen-left': '24.1%',
            '--screen-width': '51.5%',
            '--screen-height': '46.5%',
            '--screen-scale': '1.0',
            '--screen-perspective': '1000px',
            '--screen-rotate-x': '0deg',
            '--screen-rotate-y': '0deg',
            '--screen-rotate-z': '0deg',
            '--screen-radius': '6px',
          } as React.CSSProperties}
        >
          {/* Container interno que acompanha a mesma escala da imagem 
              No mobile, mostramos a imagem inteira sem zoom para não cortar o laptop e outros elementos do mockup.
          */}
          <div className="relative w-full h-auto transform lg:scale-[1.20] xl:scale-[1.10] 2xl:scale-100 origin-center lg:origin-right transition-transform duration-1000">
              <img
                src="/background-hero.png"
                alt="KORE Flow Workspace"
                className="w-full h-auto object-contain opacity-70 [mask-image:linear-gradient(to_bottom,transparent_0%,black_25%,black_100%)] lg:[mask-image:linear-gradient(to_right,transparent_0%,black_15%,black_85%,transparent_100%)] transition-all duration-1000"
              />
              
              {/* Camada de Blur que afeta APENAS as bordas da imagem, deixando o centro nítido */}
              <div className="absolute inset-0 z-0 pointer-events-none backdrop-blur-[8px] [mask-image:linear-gradient(to_bottom,black_25%,transparent_40%),linear-gradient(to_right,black_0%,black_15%,transparent_30%,transparent_70%,black_85%,black_100%)] lg:[mask-image:linear-gradient(to_right,black_0%,black_15%,transparent_30%,transparent_70%,black_85%,black_100%)] hidden lg:block"></div>

            <HeroSimulation />
          </div>
        </div>

      </section>

      {/* 2. IDENTIFICAÇÃO (LIGHT) */}
      <section id="identificacao" className="w-full bg-[#FAF8F5] py-32 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <span className="text-[#8B5CF6] text-xs uppercase tracking-widest font-bold mb-6 block">A REALIDADE DA SUA OPERAÇÃO</span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-[#111111] leading-[1.1] tracking-tight mb-12"
          >
            Você já passou por isso?
          </motion.h2>

          <div className="flex flex-col gap-4 text-left w-full max-w-2xl">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="flex items-center gap-4 bg-white p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
              <div className="w-2 h-2 rounded-full bg-[#8B5CF6] flex-shrink-0"></div>
              <p className="text-lg text-gray-700">Seu chefe ou cliente já cobrou uma tarefa que você nem lembrava porque estava resolvendo outra urgência?</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex items-center gap-4 bg-white p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
              <div className="w-2 h-2 rounded-full bg-[#8B5CF6] flex-shrink-0"></div>
              <p className="text-lg text-gray-700">Você começou uma atividade importante e acabou esquecendo outra ainda mais urgente?</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="flex items-center gap-4 bg-white p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
              <div className="w-2 h-2 rounded-full bg-[#8B5CF6] flex-shrink-0"></div>
              <p className="text-lg text-gray-700">Já terminou o dia sentindo que trabalhou muito, mas deixou algo crítico para trás?</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="flex items-center gap-4 bg-white p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
              <div className="w-2 h-2 rounded-full bg-[#8B5CF6] flex-shrink-0"></div>
              <p className="text-lg text-gray-700">Você vive apagando incêndios enquanto novas responsabilidades continuam chegando?</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="flex items-center gap-4 bg-white p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
              <div className="w-2 h-2 rounded-full bg-[#8B5CF6] flex-shrink-0"></div>
              <p className="text-lg text-gray-700">Já teve medo de esquecer uma entrega importante que comprometeria sua credibilidade?</p>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="text-xl text-[#6B7280] leading-relaxed max-w-2xl mt-16 font-medium"
          >
            Se qualquer uma dessas situações parece familiar, o KORE Flow foi criado para colocar sua rotina novamente sob controle.
          </motion.p>
        </div>
      </section>

      {/* 3. BENEFÍCIOS (LIGHT) */}
      <section id="solucao" className="w-full bg-[#FAF8F5] py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-[#8B5CF6] text-xs uppercase tracking-widest font-bold mb-6 block">O SEU COPILOTO OPERACIONAL</span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#111111] leading-[1.1] tracking-tight">
              Retome o controle sobre o seu negócio.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <BentoBox
              icon={<Target className="w-5 h-5 text-[#8B5CF6]" />}
              title="Nunca mais deixe uma entrega para trás"
              desc="Sua credibilidade protegida. Quando uma urgência aparecer, você terá a tranquilidade de saber que o resto da sua operação continua sob controle."
              delay={0.1}
            />
            <BentoBox
              icon={<LayoutDashboard className="w-5 h-5 text-[#8B5CF6]" />}
              title="Tenha clareza absoluta do que precisa ser feito"
              desc="Sem ansiedade ou adivinhações. Abra o sistema e veja de forma cristalina as prioridades do seu dia, blindando o seu foco contra distrações."
              delay={0.2}
            />
            <BentoBox
              icon={<Zap className="w-5 h-5 text-[#8B5CF6]" />}
              title="Organize toda a sua rotina sem esforço"
              desc="Deixe o caos no passado. Substitua o desespero de procurar informações no WhatsApp por uma única fonte confiável e segura."
              delay={0.3}
            />
            <BentoBox
              icon={<Search className="w-5 h-5 text-[#8B5CF6]" />}
              title="Descubra onde seu tempo está sendo investido"
              desc="Pare de atirar no escuro. Tenha dados reais sobre o seu esforço diário e descubra quais clientes trazem o verdadeiro retorno."
              delay={0.4}
            />
            <BentoBox
              icon={<Shield className="w-5 h-5 text-[#8B5CF6]" />}
              title="Trabalhe com a certeza de que nada foi esquecido"
              desc="Transmita um profissionalismo inquestionável. Encerre o expediente com a mente leve, sabendo que tudo está organizado e no prazo."
              delay={0.5}
            />

            {/* CTA Box invisível para guiar para o próximo passo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="bg-transparent p-8 flex flex-col justify-center items-center text-center rounded-sm"
            >
              <h4 className="text-[#111111] font-bold text-xl mb-6">Pronto para transformar sua rotina?</h4>
              <a href="#planos" className="bg-[#111] hover:bg-[#222] text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-colors">
                Assumir o Controle
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. RECURSOS (DARK + NARRATIVA) */}
      <section id="plataforma" className="w-full py-32 bg-[#0A0A0A] border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center md:text-left mb-16">
            <span className="text-[#8B5CF6] text-[10px] uppercase tracking-[0.2em] font-bold mb-4 block">COMO FUNCIONA NA PRÁTICA</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">O fim das tarefas perdidas.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <FeatureNarrativeCard
              bgImage="/controle de demanda.png"
              title="Controle Operacional"
              hoje="Um cliente pede algo numa reunião. Você anota, perde a anotação enquanto resolve uma urgência e esquece o prazo."
              resolve="Cada demanda tem um painel único. A informação é registrada e o sistema blinda sua rotina contra esquecimentos."
              resultado="Sua credibilidade intacta. Você entrega o que prometeu, sempre no prazo combinado."
              delay={0.1}
              onClick={() => setZoomedImage("/controle de demanda.png")}
            />
            <FeatureNarrativeCard
              bgImage="/Timer Inteligente.png"
              title="Rastreamento de Esforço"
              hoje="Você passa a tarde apagando incêndios e chega no fim do dia com a sensação de que não produziu nada."
              resolve="O sistema registra silenciosamente o tempo investido em cada cliente e em cada interrupção."
              resultado="Você ganha clareza, justifica seus prazos e comprova o esforço real que ninguém estava vendo."
              delay={0.2}
              onClick={() => setZoomedImage("/Timer Inteligente.png")}
            />
            <FeatureNarrativeCard
              bgImage="/dashboard executivo.png"
              title="Visão Executiva"
              hoje="Você trabalha no escuro. Sente que está sobrecarregado, mas não sabe exatamente o que consome sua energia."
              resolve="Gráficos simples mostram para onde o seu foco está indo e quais demandas estão travando a sua operação."
              resultado="Clareza para dizer não. Você toma decisões que protegem o seu tempo e garantem a sua tranquilidade."
              delay={0.3}
              onClick={() => setZoomedImage("/dashboard executivo.png")}
            />
            <FeatureNarrativeCard
              bgImage="/etiquetas.png"
              title="Organização Visual"
              hoje="Você olha para uma lista de 30 pendências e a ansiedade bate porque não sabe por onde deve começar."
              resolve="Indicadores visuais mostram instantaneamente o que é crítico, o que pode esperar e o que está paralisado."
              resultado="Tranquilidade imediata. Você bate o olho na tela e sabe exatamente o que precisa focar nos próximos 5 minutos."
              delay={0.4}
              onClick={() => setZoomedImage("/etiquetas.png")}
            />
          </div>
        </div>
      </section>

      {/* 5. KORE AI (O COPILOTO) */}
      <section className="w-full bg-[#050505] py-32 overflow-hidden relative">
        {/* Glow de fundo */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-[#8B5CF6]/5 blur-[120px] rounded-full z-0 pointer-events-none transform-gpu will-change-transform"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 flex flex-col items-start">
            <span className="text-[#8B5CF6] text-xs uppercase tracking-widest font-bold mb-6 block">KORE AI</span>
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-8">
              Conheça seu novo <br />assistente pessoal.
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              A inteligência artificial do KORE Flow não é um chatbot. É um assistente ativo que vigia a sua rotina para garantir que a sua credibilidade profissional nunca seja comprometida.
            </p>
            <ul className="flex flex-col gap-5 w-full">
              <li className="flex items-start">
                <Brain className="w-6 h-6 text-[#8B5CF6] mr-4 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-bold mb-1">Blinda a sua rotina</h4>
                  <p className="text-gray-500 text-sm">A IA vigia os seus prazos e te avisa antes que uma entrega importante atrase.</p>
                </div>
              </li>
              <li className="flex items-start">
                <Target className="w-6 h-6 text-[#8B5CF6] mr-4 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-bold mb-1">Protege os seus projetos</h4>
                  <p className="text-gray-500 text-sm">Alerta sobre projetos que ficaram parados enquanto você resolvia urgências.</p>
                </div>
              </li>
              <li className="flex items-start">
                <Zap className="w-6 h-6 text-[#8B5CF6] mr-4 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-bold mb-1">Garante o seu controle</h4>
                  <p className="text-gray-500 text-sm">Pergunte "O que ficou para trás essa semana?" e recupere o controle da sua rotina em segundos.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="lg:w-1/2 w-full">
            <div
              className="relative w-full aspect-video md:aspect-[4/3] rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.15)] overflow-hidden cursor-pointer group"
              onClick={() => setZoomedImage("/Kore Ai.png")}
            >
              <img src="/Kore Ai.png" alt="Kore AI" className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOTO E TEXTO (OFFICE B&W) */}
      <section className="w-full bg-[#0A0A0A] flex flex-col md:flex-row min-h-[70vh]">
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-0">
          <img src="/mockup.png" alt="Kore Flow Workflow" className="w-full h-auto object-contain" />
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center p-12 md:p-24 border-t md:border-t-0 md:border-l border-white/5">
          <div className="max-w-xl">
            <span className="text-[#8B5CF6] text-[10px] uppercase tracking-[0.2em] font-bold mb-6 block">KORE FLOW</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
              Mais controle.<br /><span className="text-[#8B5CF6]">Menos improviso.</span>
            </h2>
            <p className="text-gray-400 text-lg mb-6">
              Agora você trabalha de forma organizada. Você não precisa de mais um software para anotar coisas.
            </p>
            <p className="text-gray-400 text-lg">
              Você precisa de um sistema que garanta a sua tranquilidade enquanto você lida com os imprevistos da vida real.
            </p>
          </div>
        </div>
      </section>


      {/* 7. COMO FUNCIONA (LIGHT) */}
      <section id="processo" className="w-full bg-[#FAF8F5] py-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center mb-16">
            <span className="text-[#8B5CF6] text-xs uppercase tracking-widest font-bold mb-4 block">SIMPLES E DIRETO</span>
            <h2 className="text-3xl md:text-5xl font-bold text-[#111111] tracking-tight">Comece em poucos minutos.</h2>
          </div>
          <div className="flex flex-col md:flex-row justify-between w-full max-w-5xl gap-12 relative">
            <div className="hidden md:block absolute top-8 left-24 right-24 h-0.5 bg-gray-200 z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center w-full md:w-1/3 bg-[#FAF8F5]">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-[#8B5CF6] flex items-center justify-center text-xl font-bold text-[#8B5CF6] mb-6 shadow-lg">1</div>
              <h4 className="text-[#111] font-bold text-lg mb-2">Crie sua conta</h4>
              <p className="text-gray-500 text-sm">Acesse a plataforma sem burocracia e sinta a diferença imediatamente.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center w-full md:w-1/3 bg-[#FAF8F5]">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-[#8B5CF6] flex items-center justify-center text-xl font-bold text-[#8B5CF6] mb-6 shadow-lg">2</div>
              <h4 className="text-[#111] font-bold text-lg mb-2">Adicione suas demandas</h4>
              <p className="text-gray-500 text-sm">Registre o que precisa ser feito e tire a carga mental da sua cabeça.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center w-full md:w-1/3 bg-[#FAF8F5]">
              <div className="w-16 h-16 rounded-full bg-[#8B5CF6] flex items-center justify-center text-xl font-bold text-white mb-6 shadow-[0_0_20px_rgba(139,92,246,0.4)]">3</div>
              <h4 className="text-[#111] font-bold text-lg mb-2">O KORE organiza tudo</h4>
              <p className="text-gray-500 text-sm">Pronto. A partir daqui, o sistema protege a sua rotina e não deixa nada para trás.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. PARA QUEM É (DARK) */}
      <section className="w-full bg-[#050505] py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4 leading-tight">
            Quem trabalha sob pressão precisa de um sistema, <br className="hidden md:block" /><span className="text-[#8B5CF6]">não de memória.</span>
          </h2>
          <p className="text-gray-400 text-xl mb-12 font-light">
            Você cuida do trabalho. O KORE cuida para que nada fique para trás.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-5">
            {[
              "Quem vive resolvendo urgências",
              "Quem recebe muitas demandas diariamente",
              "Quem precisa cumprir prazos",
              "Quem trabalha com clientes",
              "Quem gerencia múltiplos projetos",
              "Quem presta contas ao gestor",
              "Quem lidera equipes",
              "Quem lida com várias tarefas ao mesmo tempo",
              "Quem não pode esquecer uma entrega importante"
            ].map((item, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 text-gray-300 px-6 py-3 rounded-full text-sm font-medium hover:bg-[#8B5CF6]/10 hover:border-[#8B5CF6]/30 hover:text-white transition-all cursor-default shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. PLANOS (DARK) */}
      <section id="planos" className="w-full bg-[#0A0A0A] py-32 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#8B5CF6]/10 blur-[120px] rounded-full z-0 pointer-events-none transform-gpu will-change-transform"></div>

        <div className="relative z-10 w-full max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-white font-bold text-4xl md:text-5xl tracking-tight mb-4">
              Invista no seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA]">sucesso.</span>
            </h2>
            <p className="text-gray-400 text-lg">Pare de trabalhar de graça. Escolha o plano que vai organizar sua operação.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* GRATUITO */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-8 flex flex-col opacity-80 hover:opacity-100 transition-opacity">
              <h3 className="text-white text-xl font-bold mb-2">Gratuito</h3>
              <p className="text-gray-400 text-sm mb-6 h-10">Comece sem compromisso.</p>
              <div className="mb-8">
                <span className="text-gray-500 text-lg">R$</span>
                <span className="text-white text-5xl font-bold tracking-tighter"> 0</span>
                <span className="text-gray-500 text-sm">/mês</span>
              </div>
              <ul className="flex flex-col gap-4 mb-10 flex-1">
                <li className="flex items-start text-gray-300 text-sm"><Check className="w-4 h-4 text-green-400 mr-3 mt-1 flex-shrink-0" /> <span className="leading-relaxed">Dashboard</span></li>
                <li className="flex items-start text-gray-300 text-sm"><Check className="w-4 h-4 text-green-400 mr-3 mt-1 flex-shrink-0" /> <span className="leading-relaxed">Gestão de demandas (até 10)</span></li>
                <li className="flex items-start text-gray-300 text-sm"><Check className="w-4 h-4 text-green-400 mr-3 mt-1 flex-shrink-0" /> <span className="leading-relaxed">Calendário & Etiquetas</span></li>
                <li className="flex items-start text-gray-300 text-sm"><Check className="w-4 h-4 text-green-400 mr-3 mt-1 flex-shrink-0" /> <span className="leading-relaxed">Acesso Web</span></li>
              </ul>
              <a href={`${process.env.NEXT_PUBLIC_APP_URL || ''}/cadastro`} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-lg font-bold text-sm text-center transition-all">
                Começar Agora
              </a>
            </div>

            {/* PRO MENSAL */}
            <div className="bg-[#111] border border-[#8B5CF6]/50 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.15)] flex flex-col transform md:-translate-y-4">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#8B5CF6] to-[#C4B5FD]"></div>
              <h3 className="text-white text-xl font-bold mb-2 flex items-center gap-2">PRO Mensal</h3>
              <p className="text-gray-400 text-sm mb-6 h-10">Ideal para quem quer crescer com flexibilidade.</p>
              <div className="mb-8">
                <span className="text-gray-500 text-lg">R$</span>
                <span className="text-white text-5xl font-bold tracking-tighter"> 49</span>
                <span className="text-white text-xl font-bold">,90</span>
                <span className="text-gray-500 text-sm">/mês</span>
              </div>
              <ul className="flex flex-col gap-4 mb-10 flex-1">
                <li className="flex items-start text-gray-300 text-sm"><Check className="w-4 h-4 text-[#8B5CF6] mr-3 mt-1 flex-shrink-0" /> <span className="leading-relaxed">Demandas Ilimitadas</span></li>
                <li className="flex items-start text-gray-300 text-sm"><Check className="w-4 h-4 text-[#8B5CF6] mr-3 mt-1 flex-shrink-0" /> <span className="leading-relaxed">Assistente KORE AI</span></li>
                <li className="flex items-start text-gray-300 text-sm"><Check className="w-4 h-4 text-[#8B5CF6] mr-3 mt-1 flex-shrink-0" /> <span className="leading-relaxed">Relatórios Avançados</span></li>
                <li className="flex items-start text-gray-300 text-sm"><Check className="w-4 h-4 text-[#8B5CF6] mr-3 mt-1 flex-shrink-0" /> <span className="leading-relaxed">Histórico Completo</span></li>
                <li className="flex items-start text-gray-300 text-sm"><Check className="w-4 h-4 text-[#8B5CF6] mr-3 mt-1 flex-shrink-0" /> <span className="leading-relaxed">Timer Inteligente</span></li>
              </ul>
              <a 
                href={`${process.env.NEXT_PUBLIC_APP_URL || ''}/cadastro?intent=checkout&plan=PRO_MONTHLY`}
                className="w-full flex items-center justify-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-3 rounded-lg font-bold text-sm text-center transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                Assinar Mensal
              </a>
            </div>

            {/* PRO ANUAL */}
            <div className="bg-[#111] border border-[#8B5CF6]/80 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.25)] flex flex-col transform md:-translate-y-8">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#C4B5FD] to-[#8B5CF6]"></div>
              <div className="absolute top-4 right-4 bg-[#8B5CF6] text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full">
                Recomendado (16% OFF)
              </div>
              <h3 className="text-white text-xl font-bold mb-2 flex items-center gap-2">PRO Anual <span className="text-[#8B5CF6]">★</span></h3>
              <p className="text-gray-400 text-sm mb-6 h-10">O maior custo-benefício para a sua operação.</p>
              <div className="mb-2">
                <span className="text-gray-500 text-lg">R$</span>
                <span className="text-white text-5xl font-bold tracking-tighter"> 39</span>
                <span className="text-white text-xl font-bold">,90</span>
                <span className="text-gray-500 text-sm">/mês</span>
              </div>
              <p className="text-gray-500 text-xs mb-6">Faturado R$ 478,80 anualmente</p>
              <ul className="flex flex-col gap-4 mb-10 flex-1">
                <li className="flex items-start text-gray-300 text-sm"><Check className="w-4 h-4 text-[#8B5CF6] mr-3 mt-1 flex-shrink-0" /> <span className="leading-relaxed">Tudo do PRO Mensal</span></li>
                <li className="flex items-start text-gray-300 text-sm"><Check className="w-4 h-4 text-[#8B5CF6] mr-3 mt-1 flex-shrink-0" /> <span className="leading-relaxed">Desconto de 2 meses</span></li>
                <li className="flex items-start text-gray-300 text-sm"><Check className="w-4 h-4 text-[#8B5CF6] mr-3 mt-1 flex-shrink-0" /> <span className="leading-relaxed">Suporte Prioritário</span></li>
              </ul>
              <a 
                href={`${process.env.NEXT_PUBLIC_APP_URL || ''}/cadastro?intent=checkout&plan=PRO_ANNUAL`}
                className="w-full flex items-center justify-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-3 rounded-lg font-bold text-sm text-center transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                Assinar Anual
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQ (LIGHT) */}
      <section className="w-full bg-[#FAF8F5] py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#111111] tracking-tight">Perguntas Frequentes</h2>
          </div>
          <div className="flex flex-col gap-4">
            <FaqItem
              question="Preciso instalar algo?"
              answer="Não. O KORE Flow roda direto no navegador, garantindo que você tenha o controle da sua operação de qualquer lugar."
            />
            <FaqItem
              question="Existe teste gratuito?"
              answer="Sim. Você tem 7 dias grátis para sentir a tranquilidade de trabalhar sem o medo de esquecer tarefas."
            />
            <FaqItem
              question="Posso cancelar quando quiser?"
              answer="Com certeza. Sem contratos ou multas. Você é dono das suas informações."
            />
            <FaqItem
              question="Meus dados ficam seguros?"
              answer="Completamente. Utilizamos segurança de nível bancário para blindar todas as informações dos seus clientes."
            />
            <FaqItem
              question="Funciona para equipes?"
              answer="Sim. O plano Business permite que toda a sua equipe trabalhe de forma organizada e sem improvisos."
            />
            <FaqItem
              question="Posso acessar pelo celular?"
              answer="Sim! A plataforma é totalmente adaptada para você proteger sua operação até mesmo quando estiver longe do computador."
            />
          </div>
        </div>
      </section>

      {/* 11. ÚLTIMA DOBRA (DARK) */}
      <section className="w-full bg-[#050505] py-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-gradient-to-b from-[#8B5CF6]/15 to-transparent"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-8">
            O caos da sua operação <br className="hidden md:block" />não vai desaparecer sozinho.
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Finalmente encontre uma forma de trabalhar sem medo de esquecer algo importante.
          </p>
          <a href="#planos" className="inline-block bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-12 py-5 rounded-full font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)]">
            Comece Hoje Gratuitamente
          </a>
        </div>
      </section>

      {/* FOOTER MINIMALISTA (DARK) */}
      <footer className="w-full font-sans border-t border-white/5 flex flex-col">
        {/* TOP BAR */}
        <div className="w-full bg-[#111111] py-16 px-6 border-b border-white/5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 md:gap-0">
            <div className="text-sm uppercase tracking-widest text-[#888] font-medium w-full md:w-1/3 text-center md:text-left">
              Design. Tecnologia. Automação.
            </div>
            <div className="flex justify-center w-full md:w-1/3">
              <a href="https://koredigital.com.br/" target="_blank" rel="noopener noreferrer">
                <Image src="/logo-white.svg" alt="KORE" width={140} height={56} className="h-6 md:h-8 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
              </a>
            </div>
            <div className="flex items-center justify-center md:justify-end gap-6 w-full md:w-1/3">
              <span className="text-base text-[#888] font-medium">Redes sociais</span>
              <div className="flex items-center gap-5 text-[#888]">
                <a href="https://www.linkedin.com/in/gabrielalbertassi/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <a href="https://instagram.com/gabriel.albertassi" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="https://github.com/galbertassi" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="GitHub">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE & BOTTOM SECTION */}
        <div className="w-full bg-[#1c1c1c] pt-20 pb-8 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            
            {/* MIDDLE SECTION */}
            <div className="flex flex-col xl:flex-row justify-between items-center gap-16 xl:gap-32 mb-24">
              {/* Left: Our KORE FLOW Logo + Phrase */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 max-w-3xl w-full xl:w-1/2">
                <Image src="/KOREFLOW.svg" alt="KORE FLOW" width={600} height={200} className="h-28 md:h-44 w-auto object-contain object-left" />
                <p className="text-[#888] text-sm md:text-base leading-relaxed">
                  O fim do trabalho invisível. Gerencie demandas, <br />
                  cronometre o seu esforço e prove o seu valor de <br />
                  forma inquestionável.
                </p>
              </div>

              {/* Right: Navigation and Contacts */}
              <div className="w-full xl:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-12 xl:gap-24">
                {/* NAVEGAÇÃO */}
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold mb-8">Navegação</h4>
                  <ul className="flex flex-col text-sm text-[#888]">
                    <li className="pb-5"><a href="#" className="hover:text-white transition-colors">Início</a></li>
                    <li className="border-t border-white/5 py-5"><a href="#solucao" className="hover:text-white transition-colors">A Solução</a></li>
                    <li className="border-t border-white/5 py-5"><a href="#processo" className="hover:text-white transition-colors">O Processo</a></li>
                    <li className="border-t border-white/5 py-5"><a href="#planos" className="hover:text-white transition-colors">Assinar</a></li>
                    <li className="border-t border-white/5 py-5"><a href="/termos-de-uso" className="hover:text-white transition-colors">Termos de Uso</a></li>
                    <li className="border-t border-white/5 py-5"><a href="/privacidade" className="hover:text-white transition-colors">Privacidade</a></li>
                    <li className="border-t border-white/5 py-5"><a href="https://koredigital.com.br/cases" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Projetos & Cases</a></li>
                    <li className="border-t border-white/5 pt-5"><a href="https://koredigital.com.br/empresa" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">A Empresa</a></li>
                  </ul>
                </div>

                {/* CONTATOS */}
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold mb-8">Contatos</h4>
                  <ul className="flex flex-col text-sm text-[#888]">
                    <li className="leading-relaxed pb-5">Volta Redonda, RJ.<br/>Atendemos todo o Brasil</li>
                    <li className="border-t border-white/5 py-5 hover:text-white transition-colors">
                      <a href="https://api.whatsapp.com/send/?phone=5524999999345&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        (24) 99999-9345
                      </a>
                    </li>
                    <li className="border-t border-white/5 pt-5 hover:text-white transition-colors">
                      <a href="mailto:gabriel.albertassic@gmail.com" className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                        gabriel.albertassic@gmail.com
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* BOTTOM SECTION */}
            <div className="flex justify-center items-center py-8 border-t border-white/10 text-xs text-[#888] font-medium">
              <p>© 2026 KORE Flow. Todos os direitos reservados.</p>
            </div>

          </div>
        </div>
      </footer>

      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-10 cursor-zoom-out"
          >
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all z-50"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={handlePrevImage}
              className="absolute left-4 md:left-10 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition-all z-50"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <motion.img
              key={zoomedImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              src={zoomedImage}
              alt="Zoomed Feature"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={handleNextImage}
              className="absolute right-4 md:right-10 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition-all z-50"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToTop}
              className="w-12 h-12 bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white rounded-full flex items-center justify-center shadow-lg transition-colors ml-auto"
              aria-label="Voltar ao topo"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-all hover:scale-110 ml-auto"
          aria-label="Falar no WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
        </a>
      </div>

    </div>
  );
}

// ---------------------- //
//     SUBCOMPONENTES     //
// ---------------------- //

function BentoBox({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="bg-white p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all flex flex-col"
    >
      <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h4 className="text-[#111111] font-bold text-lg mb-2">{title}</h4>
      <p className="text-[#6B7280] text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function DarkImageCard({ bgImage, delay, onClick }: { bgImage: string, delay: number, onClick?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      onClick={onClick}
      className="relative w-full h-full bg-[#111] overflow-hidden group border border-white/5 rounded-2xl flex flex-col cursor-pointer"
    >
      <Image
        src={bgImage}
        alt="Feature Koreflow"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
      />
    </motion.div>
  );
}

function ProcessStep({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="relative z-10 flex flex-col items-start pt-4 border-t-2 md:border-t-0 md:pt-0 border-[#8B5CF6]/30">
      <div className="hidden md:flex w-12 h-12 rounded-full bg-black border border-white/10 items-center justify-center mb-6 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
        <span className="text-[#8B5CF6] font-bold text-xs">{num}</span>
      </div>
      <div className="md:hidden text-[#8B5CF6] font-bold text-xs mb-4">{num}</div>
      <h4 className="text-white font-bold text-lg mb-2">{title}</h4>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-6 py-5 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-bold text-[#111] text-lg pr-4">{question}</span>
        <ChevronRight className={`w-5 h-5 text-[#8B5CF6] flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm md:text-base border-t border-gray-100 mt-2 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MetricCard({ image, metric, text }: { image: string, metric: string, text: string }) {
  return (
    <div className="min-w-[300px] md:min-w-[400px] h-[500px] relative rounded-sm overflow-hidden group border border-white/5">
      <Image
        src={image}
        alt="Metric"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover object-top opacity-70 group-hover:opacity-100 grayscale group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
      />
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent pointer-events-none"></div>

      <div className="absolute bottom-0 left-0 w-full p-8">
        <div className="text-5xl md:text-7xl font-bold text-[#8B5CF6] mb-4 tracking-tighter">{metric}</div>
        <p className="text-white text-sm md:text-base font-medium max-w-xs">{text}</p>
      </div>
    </div>
  );
}

function FeatureNarrativeCard({ bgImage, title, hoje, resolve, resultado, delay, onClick }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="flex flex-col gap-6"
    >
      <div className="h-64 sm:h-80 relative overflow-hidden rounded-2xl border border-white/10 shadow-lg cursor-pointer group" onClick={onClick}>
        <Image src={bgImage} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-top transition-transform duration-700 group-hover:scale-105" alt={title} />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
      </div>
      <div>
        <h4 className="text-white font-bold text-2xl mb-6">{title}</h4>
        <div className="space-y-6">
          <div className="border-l-2 border-red-500/50 pl-4 relative">
            <span className="text-red-400 text-[10px] uppercase tracking-wider font-bold block mb-1">Hoje</span>
            <p className="text-gray-400 text-sm leading-relaxed">{hoje}</p>
          </div>
          <div className="border-l-2 border-[#8B5CF6]/50 pl-4 relative">
            <span className="text-[#8B5CF6] text-[10px] uppercase tracking-wider font-bold block mb-1">O KORE Resolve</span>
            <p className="text-gray-300 text-sm leading-relaxed">{resolve}</p>
          </div>
          <div className="border-l-2 border-green-500/50 pl-4 relative bg-green-500/5 py-2 rounded-r-md">
            <span className="text-green-400 text-[10px] uppercase tracking-wider font-bold block mb-1">Resultado</span>
            <p className="text-white text-sm font-medium leading-relaxed">{resultado}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
