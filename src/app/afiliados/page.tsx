"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Layers,
  Smartphone,
  Monitor,
  Share2,
  FileImage,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

interface BannerItem {
  id: string;
  title: string;
  filename: string;
  category: "post" | "story" | "horizontal";
  categoryLabel: string;
  dimensions: string;
  width: number;
  height: number;
  description: string;
  recommendedUse: string;
}

const BANNERS: BannerItem[] = [
  {
    id: "do-caos-a-clareza",
    title: "Do Caos à Clareza",
    filename: "kore-flow-do-caos-a-clareza.png",
    category: "story",
    categoryLabel: "Stories & Vertical",
    dimensions: "1023 x 1537 px",
    width: 1023,
    height: 1537,
    description: "Arte vertical com foco na transformação da rotina e eliminação da desorganização.",
    recommendedUse: "Instagram Stories, WhatsApp Status, Reels e TikTok",
  },
  {
    id: "mais-clareza-menos-caos",
    title: "Mais Clareza, Menos Caos",
    filename: "kore-flow-mais-clareza-menos-caos.png",
    category: "story",
    categoryLabel: "Stories & Vertical",
    dimensions: "1023 x 1537 px",
    width: 1023,
    height: 1537,
    description: "Visual de alto impacto focado em clareza operacional e alívio do estresse diário.",
    recommendedUse: "Stories, anúncios verticais e grupos de WhatsApp",
  },
  {
    id: "apresentacao",
    title: "Apresentação KORE Flow",
    filename: "kore-flow-apresentacao.png",
    category: "story",
    categoryLabel: "Stories & Vertical",
    dimensions: "1024 x 1536 px",
    width: 1024,
    height: 1536,
    description: "Visão geral completa da interface e proposta de valor do KORE Flow.",
    recommendedUse: "Stories de apresentação, carrosséis e posts verticais",
  },
  {
    id: "demandas-de-todo-lado",
    title: "Demandas de Todo Lado",
    filename: "kore-flow-demandas-de-todo-lado.png",
    category: "story",
    categoryLabel: "Stories & Vertical",
    dimensions: "960 x 1637 px",
    width: 960,
    height: 1637,
    description: "Destaque para o problema real de receber demandas espalhadas em WhatsApp, e-mail e reuniões.",
    recommendedUse: "Instagram Stories, Status do WhatsApp e Direct",
  },
  {
    id: "operacao-em-um-unico-fluxo",
    title: "Operação em um Único Fluxo",
    filename: "kore-flow-operacao-em-um-unico-fluxo.png",
    category: "story",
    categoryLabel: "Banner Alto / Vertical",
    dimensions: "819 x 1920 px",
    width: 819,
    height: 1920,
    description: "Banner super vertical demonstrando o fluxo unificado de tarefas e tempo.",
    recommendedUse: "Stories em tela cheia, colunas laterais de sites e blogs",
  },
  {
    id: "clareza-visual",
    title: "Clareza Visual & Dashboard",
    filename: "kore-flow-clareza-visual.png",
    category: "post",
    categoryLabel: "Feed & Redes Sociais",
    dimensions: "1402 x 1122 px",
    width: 1402,
    height: 1122,
    description: "Visual limpo exibindo a visão estratégica de produtividade e controle de demandas.",
    recommendedUse: "Feed do Instagram, LinkedIn, Facebook e Artigos de Blog",
  },
  {
    id: "organize-suas-demandas",
    title: "Organize Suas Demandas",
    filename: "kore-flow-organize-suas-demandas.png",
    category: "post",
    categoryLabel: "Feed & Redes Sociais",
    dimensions: "1402 x 1122 px",
    width: 1402,
    height: 1122,
    description: "Arte para publicação com foco em organização de rotina, clientes e prazos.",
    recommendedUse: "Feed de redes sociais, apresentações em PDF e posts de comunidades",
  },
  {
    id: "operacao-integrada",
    title: "Operação Integrada",
    filename: "kore-flow-operacao-integrada.png",
    category: "horizontal",
    categoryLabel: "Banner Horizontal",
    dimensions: "1983 x 793 px",
    width: 1983,
    height: 793,
    description: "Banner widescreen panorâmico ideal para cabeçalhos e apresentações.",
    recommendedUse: "Topo de artigos de blog, banners de e-mail marketing e apresentações",
  },
  {
    id: "produtividade-organizacao",
    title: "Produtividade & Organização",
    filename: "kore-flow-produtividade-organizacao.png",
    category: "horizontal",
    categoryLabel: "Banner Horizontal",
    dimensions: "1958 x 803 px",
    width: 1958,
    height: 803,
    description: "Banner horizontal moderno com chamada para centralização e controle total.",
    recommendedUse: "Cabeçalhos de sites, campanhas de e-mail e banners promocionais",
  },
];

export default function AfiliadosPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | "post" | "story" | "horizontal">("all");
  const [downloadingAll, setDownloadingAll] = useState(false);

  const baseUrl = "https://flow.koredigital.com.br";

  const handleCopy = (banner: BannerItem) => {
    const fullUrl = `${baseUrl}/afiliados/${banner.filename}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(banner.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  const filteredBanners = activeCategory === "all" 
    ? BANNERS 
    : BANNERS.filter((b) => b.category === activeCategory);

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    for (let i = 0; i < BANNERS.length; i++) {
      const banner = BANNERS[i];
      const link = document.createElement("a");
      link.href = `/afiliados/${banner.filename}`;
      link.download = banner.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Pequeno intervalo entre downloads para o navegador não bloquear
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
    setDownloadingAll(false);
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 selection:bg-[#ff7a45]/30 selection:text-white font-sans">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#e056a0]/15 via-[#ff7a45]/15 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-[#6366f1]/10 blur-[130px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top Navigation */}
        <div className="flex items-center justify-between pb-8 border-b border-white/10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao KORE Flow</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Materiais Oficiais Liberados
            </span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto pt-12 pb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#e056a0]/20 to-[#ff7a45]/20 border border-[#ff7a45]/30 text-white mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#ff7a45]" />
            <span>Programa de Afiliados KORE Flow</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Materiais Oficiais de Divulgação
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Artes em alta definição, criadas para converter nas redes sociais, WhatsApp, 
            e-mails e apresentações. Faça o download direto ou copie as URLs públicas para suas campanhas.
          </p>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleDownloadAll}
              disabled={downloadingAll}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#e056a0] to-[#ff7a45] hover:opacity-95 text-white shadow-lg shadow-[#ff7a45]/20 hover:shadow-[#ff7a45]/30 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingAll ? "Baixando arquivos..." : "Baixar Todas as Artes (1 Clique)"}</span>
            </button>
            <a
              href="https://hotmart.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white transition-all"
            >
              <span>Painel de Afiliado Hotmart</span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 py-6 border-y border-white/5 flex-wrap">
          <button
            onClick={() => setActiveCategory("all")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === "all"
                ? "bg-white text-black shadow"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Todos os Materiais ({BANNERS.length})</span>
          </button>
          <button
            onClick={() => setActiveCategory("story")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === "story"
                ? "bg-white text-black shadow"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Stories & Verticais ({BANNERS.filter((b) => b.category === "story").length})</span>
          </button>
          <button
            onClick={() => setActiveCategory("post")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === "post"
                ? "bg-white text-black shadow"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Feed & Posts ({BANNERS.filter((b) => b.category === "post").length})</span>
          </button>
          <button
            onClick={() => setActiveCategory("horizontal")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === "horizontal"
                ? "bg-white text-black shadow"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Banners Horizontais ({BANNERS.filter((b) => b.category === "horizontal").length})</span>
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-10 pb-16">
          {filteredBanners.map((banner) => {
            const isCopied = copiedId === banner.id;
            const assetPath = `/afiliados/${banner.filename}`;
            const fullPublicUrl = `${baseUrl}${assetPath}`;

            return (
              <div
                key={banner.id}
                className="group flex flex-col bg-[#12141C] border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/50"
              >
                {/* Preview Container */}
                <div className="relative aspect-[4/3] bg-black/40 p-4 flex items-center justify-center overflow-hidden border-b border-white/5">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={assetPath}
                      alt={banner.title}
                      className="max-h-full max-w-full object-contain rounded-lg shadow-md transition-transform duration-300 group-hover:scale-102"
                      loading="lazy"
                    />
                  </div>

                  {/* Badge de Dimensões */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300">
                    {banner.dimensions}
                  </div>

                  {/* Badge de Categoria */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#ff7a45]/20 border border-[#ff7a45]/30 text-[11px] font-medium text-[#ff9c6e]">
                    {banner.categoryLabel}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-[#ff9c6e] transition-colors">
                      {banner.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                      {banner.description}
                    </p>

                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-mono truncate max-w-[200px]" title={banner.filename}>
                        {banner.filename}
                      </span>
                      <span className="text-[11px] text-slate-400">PNG Alta Resolução</span>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-400 bg-white/5 p-2 rounded-lg">
                      <strong className="text-slate-300">Uso:</strong> {banner.recommendedUse}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <a
                      href={assetPath}
                      download={banner.filename}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar</span>
                    </a>

                    <button
                      onClick={() => handleCopy(banner)}
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isCopied
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                          : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-200 hover:text-white"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar URL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informações para Afiliados */}
        <div className="bg-gradient-to-br from-[#12141C] to-[#181B26] border border-white/10 rounded-2xl p-6 sm:p-8 mb-16">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#ff7a45]/10 border border-[#ff7a45]/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#ff7a45]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Dicas para Divulgação com Alta Conversão</h2>
              <p className="mt-1 text-sm text-slate-300">
                O KORE Flow resolve a dor de profissionais que sofrem com demandas perdidas no WhatsApp, e-mail e reuniões.
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-white/5 border border-white/5 rounded-xl p-3.5">
                  <div className="font-semibold text-white mb-1">🎯 Público-Alvo Ideal</div>
                  <div className="text-slate-400">
                    Designers, desenvolvedores, agências, freelancers, gestores de tráfego e prestadores de serviços.
                  </div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-3.5">
                  <div className="font-semibold text-white mb-1">💡 Principal Apelo</div>
                  <div className="text-slate-400">
                    &quot;Nunca mais perca uma demanda. Centralize tudo e prove seu tempo e produtividade com IA.&quot;
                  </div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-3.5">
                  <div className="font-semibold text-white mb-1">🔗 Seu Link de Afiliado</div>
                  <div className="text-slate-400">
                    Sempre utilize o seu link de divulgação direto gerado na plataforma da Hotmart com seu código de rastreio.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-white/10 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} KORE Flow. Todos os direitos reservados. Materiais de uso exclusivo para afiliados autorizados.</p>
        </div>
      </div>
    </div>
  );
}
