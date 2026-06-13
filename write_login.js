const fs = require('fs');

const code = `"use client";

import { login } from "./actions";
import Image from "next/image";
import { useState } from "react";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error: string };
}) {
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ backgroundColor: "#F5F5F2" }}>

      {/* ── Fundo decorativo ── */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">

        {/* Luz roxa inferior direita */}
        <div style={{ position: "absolute", bottom: "-100px", right: "-100px", width: "550px", height: "550px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)", filter: "blur(40px)" }} />

        {/* Luz suave superior esquerda */}
        <div style={{ position: "absolute", top: "-140px", left: "-80px", width: "520px", height: "520px", borderRadius: "50%", background: "radial-gradient(circle, rgba(220,215,208,0.55) 0%, transparent 65%)", filter: "blur(50px)" }} />

        {/* Esfera grande topo */}
        <div style={{ position: "absolute", top: "-180px", left: "50%", transform: "translateX(-50%)", width: "640px", height: "640px", borderRadius: "50%", background: "radial-gradient(ellipse at 35% 35%, rgba(255,255,255,0.92) 0%, rgba(230,226,220,0.50) 50%, transparent 72%)", boxShadow: "inset 0 0 70px rgba(255,255,255,0.5), 0 40px 80px rgba(0,0,0,0.05)", filter: "blur(1px)" }} />

        {/* Esfera media direita */}
        <div style={{ position: "absolute", top: "32%", right: "-70px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.88) 0%, rgba(210,205,198,0.38) 55%, transparent 75%)", boxShadow: "inset 0 0 30px rgba(255,255,255,0.5)", filter: "blur(2px)" }} />

        {/* Esfera pequena esquerda baixo */}
        <div style={{ position: "absolute", bottom: "8%", left: "7%", width: "210px", height: "210px", borderRadius: "50%", background: "radial-gradient(ellipse at 35% 35%, rgba(255,255,255,0.82) 0%, rgba(218,214,208,0.32) 55%, transparent 78%)", filter: "blur(2px)" }} />

        {/* Cubo glass grande */}
        <div style={{ position: "absolute", bottom: "16%", right: "14%", width: "88px", height: "88px", borderRadius: "22px", background: "linear-gradient(135deg, rgba(255,255,255,0.60) 0%, rgba(255,255,255,0.12) 100%)", border: "1px solid rgba(255,255,255,0.72)", backdropFilter: "blur(14px)", boxShadow: "0 8px 32px rgba(139,92,246,0.08)", transform: "rotate(13deg)" }} />

        {/* Cubo glass pequeno */}
        <div style={{ position: "absolute", top: "24%", left: "9%", width: "54px", height: "54px", borderRadius: "14px", background: "linear-gradient(135deg, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.10) 100%)", border: "1px solid rgba(255,255,255,0.65)", backdropFilter: "blur(8px)", transform: "rotate(-9deg)" }} />

        {/* Grade de pontos */}
        <svg style={{ position: "absolute", top: 0, left: 0, opacity: 0.13 }} width="100%" height="100%">
          <defs>
            <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#8B5CF6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* ── Layout em duas colunas ── */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">

        {/* COLUNA ESQUERDA */}
        <div className="flex flex-col justify-between px-10 py-14 lg:w-1/2 xl:px-20">

          {/* Logo */}
          <div>
            <Image src="/KOREFLOW.svg" alt="KORE FLOW" width={160} height={44} className="object-contain" priority />
          </div>

          {/* Headline e beneficios — so desktop */}
          <div className="hidden lg:flex flex-col mt-auto pb-6">
            <h1 className="text-5xl xl:text-6xl font-semibold leading-tight" style={{ color: "#1A1A1A", letterSpacing: "-0.03em" }}>
              Organize sua<br />execucao.<br />
              <span style={{ color: "#8B5CF6" }}>Amplie sua clareza.</span>
            </h1>

            <p className="mt-6 max-w-sm text-base leading-relaxed" style={{ color: "#6B6B6B" }}>
              Seu sistema operacional pessoal para transformar ideias, metas e tarefas em fluxo de execucao.
            </p>

            <ul className="mt-10 flex flex-col gap-4">
              {["Planeje melhor", "Execute com foco", "Evolua com inteligencia"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#8B5CF6" }} />
                  <span className="text-sm font-medium" style={{ color: "#3A3A3A" }}>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Rodape desktop */}
          <p className="hidden lg:block text-xs tracking-widest" style={{ color: "#C0C0C0" }}>
            POWERED BY KORE AI INTELLIGENCE
          </p>
        </div>

        {/* COLUNA DIREITA */}
        <div className="flex flex-1 items-center justify-center px-6 py-14 lg:py-0 lg:px-12 xl:px-20">
          <div className="w-full max-w-md">

            {/* Card glassmorphism */}
            <div style={{ background: "rgba(255,255,255,0.80)", border: "1px solid rgba(255,255,255,0.72)", borderRadius: "28px", boxShadow: "0 32px 80px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.92)", backdropFilter: "blur(24px)", padding: "44px 40px 38px" }}>

              {/* Icone */}
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-7" style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)", boxShadow: "0 8px 24px rgba(139,92,246,0.32)" }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </div>

              <h2 className="text-2xl font-semibold mb-1" style={{ color: "#1A1A1A", letterSpacing: "-0.025em" }}>Bem-vindo de volta</h2>
              <p className="text-sm mb-8" style={{ color: "#7A7A7A" }}>Acesse seu ambiente e continue sua execucao.</p>

              <form className="flex flex-col gap-5">

                {/* Campo Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-semibold tracking-wide" style={{ color: "#3A3A3A" }}>E-MAIL</label>
                  <input
                    id="email" name="email" type="email" autoComplete="email"
                    placeholder="seu@email.com" required
                    className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all"
                    style={{
                      background: emailFocus ? "#fff" : "rgba(245,245,242,0.85)",
                      border: emailFocus ? "1.5px solid rgba(139,92,246,0.5)" : "1.5px solid rgba(0,0,0,0.08)",
                      color: "#1A1A1A",
                      boxShadow: emailFocus ? "0 0 0 3px rgba(139,92,246,0.10)" : "none",
                    }}
                    onFocus={() => setEmailFocus(true)}
                    onBlur={() => setEmailFocus(false)}
                  />
                </div>

                {/* Campo Senha */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-xs font-semibold tracking-wide" style={{ color: "#3A3A3A" }}>SENHA</label>
                    <a href="#" className="text-xs hover:opacity-70 transition-opacity" style={{ color: "#8B5CF6" }}>Esqueci minha senha</a>
                  </div>
                  <input
                    id="password" name="password" type="password" autoComplete="current-password" required
                    className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all"
                    style={{
                      background: passFocus ? "#fff" : "rgba(245,245,242,0.85)",
                      border: passFocus ? "1.5px solid rgba(139,92,246,0.5)" : "1.5px solid rgba(0,0,0,0.08)",
                      color: "#1A1A1A",
                      boxShadow: passFocus ? "0 0 0 3px rgba(139,92,246,0.10)" : "none",
                    }}
                    onFocus={() => setPassFocus(true)}
                    onBlur={() => setPassFocus(false)}
                  />
                </div>

                {searchParams?.error && (
                  <p className="text-xs text-center px-3 py-2 rounded-lg" style={{ color: "#DC2626", background: "rgba(220,38,38,0.07)" }}>
                    {searchParams.error.replace(/_/g, " ")}
                  </p>
                )}

                <button
                  formAction={login} type="submit"
                  className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] mt-1"
                  style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)", boxShadow: "0 8px 28px rgba(139,92,246,0.35)", letterSpacing: "-0.01em" }}
                >
                  Entrar no KORE FLOW
                </button>
              </form>

              <p className="text-center text-xs mt-6" style={{ color: "#9A9A9A" }}>
                Ainda nao tem acesso?{" "}
                <a href="#" style={{ color: "#8B5CF6", fontWeight: 500 }}>Solicitar convite</a>
              </p>
            </div>

            {/* Rodape mobile */}
            <p className="lg:hidden text-center text-xs tracking-widest mt-8" style={{ color: "#C0C0C0" }}>
              POWERED BY KORE AI INTELLIGENCE
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/app/login/page.tsx', code, 'utf8');
console.log('OK - Login page written with ' + code.split('\n').length + ' lines');
