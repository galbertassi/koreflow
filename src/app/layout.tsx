import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://flow.koredigital.com.br"),
  title: "KORE Flow | Nunca mais perca uma demanda de trabalho",
  description: "Centralize demandas do WhatsApp, e-mail, reuniões e ligações em um único lugar. Organize prioridades, acompanhe o tempo investido e prove sua produtividade com IA.",
  keywords: ["gestão de tarefas", "marketing", "gerenciador de projetos", "kore flow", "kore digital", "produtividade", "organização", "fluxo de trabalho"],
  authors: [{ name: "KORE Digital" }],
  alternates: {
    canonical: "https://flow.koredigital.com.br",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "KORE Flow | Nunca mais perca uma demanda de trabalho",
    description: "Centralize demandas do WhatsApp, e-mail, reuniões e ligações em um único lugar. Organize prioridades, acompanhe o tempo investido e prove sua produtividade com IA.",
    siteName: "KORE Flow",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
