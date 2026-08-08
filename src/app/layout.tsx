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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
