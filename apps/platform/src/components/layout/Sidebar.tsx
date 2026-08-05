"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  LayoutGrid,
  Calendar,
  Folder,
  Target,
  BarChart2,
  ClipboardCheck,
  Cog,
  LogOut,
  ChevronLeft,
  Bot,
  Sparkles,
  User,
  Settings,
  Store,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useStore } from "@/hooks/use-store";
import { useState, useEffect } from "react";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Demandas", href: "/demandas", icon: LayoutGrid },
  { name: "Calendário", href: "/calendario", icon: Calendar },
  { name: "Relatórios", href: "/relatorios", icon: BarChart2 },
  { name: "KORE AI", href: "/kore-ai", icon: Bot },
  { name: "Configurações", href: "/configuracoes", icon: Cog },
];

export function Sidebar() {
  const pathname = usePathname();
  const supabase = createClient();
  const { configuracoes, isSidebarOpen, toggleSidebar, companyPlan } = useStore();
  const nomeUsuario = configuracoes?.nome || "Usuário";
  const iniciais = nomeUsuario.substring(0, 2).toUpperCase();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    // Verifica se já mostramos a notificação de boas vindas
    const hasSeenWelcome = localStorage.getItem("koreflow_welcomed");
    if (!hasSeenWelcome && nomeUsuario !== "Carregando..." && nomeUsuario !== "Visitante") {
      setShowWelcome(true);
      localStorage.setItem("koreflow_welcomed", "true");
      setTimeout(() => setShowWelcome(false), 6000);
    }
  }, [nomeUsuario]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      <aside className={cn(
        "print:hidden w-64 border-r border-border bg-white dark:bg-sidebar flex flex-col h-screen fixed left-0 top-0 text-sidebar-foreground z-50 transition-transform duration-300",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Logo Area */}
        <div className="px-6 py-8 flex flex-col items-center justify-center gap-0">
          <div className="flex items-center justify-center w-full">
            <Image src="/favicon_kore.svg" alt="KORE FLOW" width={160} height={160} className="object-contain" priority />
          </div>

        </div>
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-6 space-y-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 text-[14.5px] font-medium",
                  isActive
                    ? "bg-[#8B5CF6]/5 text-[#8B5CF6]"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-secondary/50"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-[#8B5CF6]" : "text-sidebar-foreground/60")} strokeWidth={isActive ? 2 : 1.5} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Area (ChatGPT Style) */}
        <div className="p-3 border-t border-sidebar-border/50 flex flex-col gap-2 mt-auto relative">
          
          <button onClick={toggleSidebar} className="md:hidden flex items-center gap-3 px-3 py-2 w-full rounded-lg transition-colors text-xs font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground mb-2">
            <ChevronLeft className="h-4 w-4" />
            Recolher menu
          </button>

          {/* Popover Menu */}
          {isProfileMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsProfileMenuOpen(false)} 
              />
              <div className="absolute bottom-[calc(100%+8px)] left-3 right-3 bg-white dark:bg-[#2A2B32] border border-border shadow-xl rounded-xl z-50 overflow-hidden flex flex-col py-1 animate-in slide-in-from-bottom-2 fade-in duration-200">
                
                {/* Header do Menu */}
                <div className="px-4 py-3 flex items-center gap-3">
                  {configuracoes?.foto ? (
                    <div className="h-9 w-9 rounded-full overflow-hidden relative shrink-0">
                      <Image src={configuracoes.foto} alt={nomeUsuario} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-[#E58C2C] flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {iniciais}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground">{nomeUsuario}</p>
                    <p className="text-xs text-muted-foreground">{(companyPlan as string) === "PRO" ? "Plano PRO" : "Plano FREE"}</p>
                  </div>
                </div>

                <div className="h-px bg-border w-full" />

                {/* Itens do Menu */}
                <div className="p-1.5 flex flex-col gap-0.5">
                  <Link href="/configuracoes?tab=assinatura" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-[13.5px] font-medium rounded-lg hover:bg-secondary/80 text-foreground transition-colors cursor-pointer">
                    <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                    Subir de plano
                  </Link>
                  <Link href="/configuracoes?tab=perfil" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-[13.5px] font-medium rounded-lg hover:bg-secondary/80 text-foreground transition-colors cursor-pointer">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Perfil
                  </Link>
                  <Link href="/configuracoes" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-[13.5px] font-medium rounded-lg hover:bg-secondary/80 text-foreground transition-colors cursor-pointer">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    Configurações
                  </Link>
                </div>

                <div className="h-px bg-border w-full" />
                
                <div className="p-1.5 flex flex-col gap-0.5">
                  <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-[13.5px] font-medium rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-left w-full">
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>

              </div>
            </>
          )}

          {/* Profile Button */}
          <button 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className={cn(
              "w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left cursor-pointer",
              "bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white", // Estilo escuro como o do ChatGPT
              isProfileMenuOpen && "bg-[#2A2A2A]"
            )}
          >
            {configuracoes?.foto ? (
              <div className="h-9 w-9 rounded-full overflow-hidden relative shrink-0">
                <Image src={configuracoes.foto} alt={nomeUsuario} fill className="object-cover" />
              </div>
            ) : (
              <div className="h-9 w-9 rounded-full bg-[#E58C2C] flex items-center justify-center text-white font-bold text-sm shrink-0">
                {iniciais}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-medium text-white truncate">{nomeUsuario}</p>
              <p className="text-[11.5px] text-zinc-400">{(companyPlan as string) === "PRO" ? "Plano PRO" : "Plano FREE"}</p>
            </div>
            <Store className="w-4 h-4 text-zinc-400 shrink-0 mr-1" />
          </button>
          
        </div>
      </aside>

      {/* Welcome Toast */}
      {showWelcome && (
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100] bg-white dark:bg-[#1A1A1A] border border-border shadow-2xl rounded-2xl p-4 w-80 animate-in slide-in-from-bottom-5 fade-in duration-500">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
              <span className="text-xl">👋</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground">Bem-vindo ao KORE FLOW!</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Olá, {nomeUsuario.split(' ')[0]}! Explore o seu novo ambiente de trabalho e gerencie suas demandas.
              </p>
            </div>
            <button onClick={() => setShowWelcome(false)} className="text-muted-foreground hover:text-foreground">
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
