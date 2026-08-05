"use client";

import { login } from "./actions";
import Image from "next/image";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center p-4 pb-24 bg-[#020202]"
    >
      {/* Background Imagem - Marca D'água */}
      <div
        className="absolute inset-0 z-0 opacity-100"
        style={{
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />

      {/* Vidro Escuro por cima do background para dar profundidade */}
      <div className="absolute inset-0 z-0 bg-black/50" />

      {/* 🔮 Fundo decorativo animado 🔮 */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden mix-blend-screen" aria-hidden="true">

        {/* Luz roxa central pulsante */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full animate-pulse"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 60%)",
            filter: "blur(60px)",
            animationDuration: "4s"
          }}
        />

        {/* Orbe Flutuante 1 */}
        <div
          className="absolute w-[400px] h-[400px] rounded-full mix-blend-screen"
          style={{
            background: "radial-gradient(circle, rgba(109,40,217,0.3) 0%, transparent 70%)",
            filter: "blur(40px)",
            top: "0%",
            left: "0%",
            animation: "float1 15s ease-in-out infinite alternate"
          }}
        />

        {/* Orbe Flutuante 2 */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full mix-blend-screen"
          style={{
            background: "radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)",
            filter: "blur(50px)",
            bottom: "0%",
            right: "0%",
            animation: "float2 18s ease-in-out infinite alternate-reverse"
          }}
        />

        <style jsx>{`
          @keyframes float1 {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(100px, 100px) scale(1.2); }
          }
          @keyframes float2 {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(-100px, -50px) scale(1.1); }
          }
        `}</style>
      </div>

      {/* Conteúdo Central */}
      <div className="relative z-10 w-full max-w-[360px]">
        {/* LOGO SUPERIOR */}
        <div className="mb-10 text-center">
          <Image
            src="/KOREFLOW.svg?v=2"
            alt="KORE FLOW"
            width={240}
            height={60}
            priority
            className="mx-auto drop-shadow-md hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* CARD DARK GLASSMORPHISM */}
        <div
          className="w-full rounded-[32px] p-[1px] overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.02) 100%)",
          }}
        >
          <div
            className="w-full h-full rounded-[31px] p-6 sm:p-8"
            style={{
              background: "rgba(10, 10, 10, 0.65)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
            }}
          >
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <h1 className="text-[26px] font-semibold text-white tracking-tight">
                  Bem-vindo de volta
                </h1>
                <p className="text-[14px] text-[#A0A0A0] font-medium tracking-wide">
                  Acesse seu workspace
                </p>
              </div>

              <form action={login} className="space-y-4">

                {/* Inputs Glass */}
                <div className="space-y-3.5">
                  <div className="relative group">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="seu@email.com"
                      onFocus={() => setEmailFocus(true)}
                      onBlur={() => setEmailFocus(false)}
                      className="w-full h-[46px] px-4 rounded-xl text-[14px] text-white font-medium placeholder:text-[#666666] transition-all duration-300 outline-none"
                      style={{
                        background: emailFocus ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                        border: emailFocus ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.1)",
                        boxShadow: emailFocus ? "0 0 15px rgba(139,92,246,0.2)" : "none"
                      }}
                    />
                  </div>

                  <div className="relative group">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      onFocus={() => setPassFocus(true)}
                      onBlur={() => setPassFocus(false)}
                      className="w-full h-[46px] px-4 rounded-xl text-[14px] text-white font-medium placeholder:text-[#666666] transition-all duration-300 outline-none"
                      style={{
                        background: passFocus ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                        border: passFocus ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.1)",
                        boxShadow: passFocus ? "0 0 15px rgba(139,92,246,0.2)" : "none"
                      }}
                    />
                  </div>
                </div>

                {/* Mensagens */}
                {error && (
                  <p className="text-xs text-center px-3 py-2 rounded-lg"
                    style={{ color: "#F87171", background: "rgba(220,38,38,0.1)" }}>
                    {error.replace(/_/g, " ")}
                  </p>
                )}
                {message && (
                  <p className="text-xs text-center px-3 py-2 rounded-lg"
                    style={{ color: "#34D399", background: "rgba(52,211,153,0.1)" }}>
                    {message.replace(/_/g, " ")}
                  </p>
                )}

                {/* Botão */}
                <button
                  type="submit"
                  className="w-full h-[46px] rounded-xl text-[14px] font-semibold text-white transition-all duration-300 relative group overflow-hidden mt-2"
                  style={{
                    background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Entrar
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </form>

              {/* Links */}
              <div className="pt-2 text-center">
                <Link href="/recuperar-senha" className="text-[13px] text-[#888888] hover:text-white transition-colors font-medium">
                  Esqueceu a senha?
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* LOGO DA KORE ABAIXO */}
        <div className="mt-8 flex flex-col items-center justify-center">
          <Image
            src="/logo-white2.svg"
            alt="KORE"
            width={160}
            height={55}
            className="opacity-60 hover:opacity-100 transition-opacity duration-300 drop-shadow-md"
          />
          <a href="https://www.koredigital.com.br" target="_blank" rel="noopener noreferrer" className="text-[13.5px] font-normal text-[#888888] hover:text-white transition-colors tracking-widest -mt-10 relative z-10">
            www.koredigital.com.br
          </a>
        </div>
      </div>

      {/* Gradiente escuro na parte inferior para destacar os créditos */}
      <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-black via-black/80 to-transparent z-0 pointer-events-none" />

      {/* FOOTER */}
      <div className="absolute bottom-4 sm:bottom-6 w-full px-4 sm:px-8 flex flex-col sm:flex-row-reverse justify-center sm:justify-between items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-[#888888] tracking-wide z-10 text-center drop-shadow-md">
        <div>Powered By KORE | Digital Experiences</div>
        <div>© 2026 KORE. Todos os direitos reservados.</div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-[#020202]"></div>}>
      <LoginContent />
    </Suspense>
  );
}
