import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "KORE Flow",
  description: "Plataforma para organizar demandas, prioridades, interrupções e acompanhar onde o tempo foi investido.",
  alternates: {
    canonical: "https://flow.koredigital.com.br",
  },
  openGraph: {
    type: "website",
    url: "https://flow.koredigital.com.br",
    title: "KORE Flow",
    description: "Plataforma para organizar demandas, prioridades, interrupções e acompanhar onde o tempo foi investido.",
    siteName: "KORE Flow",
  },
  twitter: {
    card: "summary_large_image",
    title: "KORE Flow",
    description: "Plataforma para organizar demandas, prioridades, interrupções e acompanhar onde o tempo foi investido.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "KORE Flow",
  "url": "https://flow.koredigital.com.br",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "Plataforma para organizar demandas, prioridades, interrupções e acompanhar onde o tempo foi investido.",
  "publisher": {
    "@type": "Organization",
    "name": "KORE Digital Experiences",
    "url": "https://koredigital.com.br"
  }
};

export default function VendasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#8B5CF6]/30">
      {/* Navbar Transparente / Dark Premium */}
      <nav className="fixed top-0 w-full z-50 bg-[#0A0A0A]/40 backdrop-blur-xl border-b border-white/[0.03] shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <a href="/vendas" className="flex items-center">
            <Image src="/flow-logo.svg" alt="KORE FLOW" width={240} height={60} className="h-[52px] w-auto" />
          </a>

          <div className="hidden md:flex items-center gap-10 text-[13px] uppercase tracking-widest font-semibold text-gray-400">
            <a href="#solucao" className="hover:text-white transition-colors">A Solução</a>
            <a href="#plataforma" className="hover:text-white transition-colors">A Plataforma</a>
            <a href="#processo" className="hover:text-white transition-colors">Processo</a>
          </div>

          <div className="flex items-center gap-6">
            <a href={`${process.env.NEXT_PUBLIC_APP_URL || ''}/login`} className="text-[13px] font-bold text-white uppercase tracking-widest hover:text-[#8B5CF6] transition-colors">
              Login
            </a>
          </div>
        </div>
      </nav>

      <main className="w-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </main>
    </div>
  );
}
