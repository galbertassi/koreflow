import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KORE FLOW | O gerenciador de tarefas inteligente",
  description: "Organize suas demandas e comprove o seu esforço com o KORE FLOW. A plataforma ideal para gestão inteligente de projetos.",
  keywords: ["gestão de tarefas", "marketing", "gerenciador de projetos", "kore flow", "kore digital", "produtividade", "organização", "fluxo de trabalho"],
  authors: [{ name: "KORE Digital" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "KORE FLOW | O gerenciador de tarefas inteligente",
    description: "Organize suas demandas e comprove o seu esforço com o KORE FLOW.",
    siteName: "KORE FLOW",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/fiveicon_white.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0A0A0A] text-white selection:bg-[#8B5CF6]/30">
        <nav className="fixed top-0 w-full z-50 bg-[#0A0A0A]/40 backdrop-blur-xl border-b border-white/[0.03] shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
            <a href="/" className="flex items-center">
              <Image src="/flow-logo.svg" alt="KORE FLOW" width={240} height={60} className="h-[52px] w-auto" />
            </a>

            <div className="hidden md:flex items-center gap-10 text-[13px] uppercase tracking-widest font-semibold text-gray-400">
              <a href="#solucao" className="hover:text-white transition-colors">A Solução</a>
              <a href="#plataforma" className="hover:text-white transition-colors">A Plataforma</a>
              <a href="#processo" className="hover:text-white transition-colors">Processo</a>
            </div>

            <div className="flex items-center gap-6">
              <a href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://app.koredigital.com.br'}/login`} className="text-[13px] font-bold text-white uppercase tracking-widest hover:text-[#8B5CF6] transition-colors">
                Login
              </a>
            </div>
          </div>
        </nav>
        <main className="w-full flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
