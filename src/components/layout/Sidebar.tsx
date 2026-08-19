"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import {
  Home,
  LayoutGrid,
  Calendar,
  Folder,
  Target,
  BarChart2,
  ClipboardCheck,
  Settings,
  LogOut,
  ChevronLeft,
  Bot,
  Sparkles,
  User,
  HelpCircle,
  Tag
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Demandas", href: "/execucoes", icon: LayoutGrid },
  { name: "Calendário", href: "/calendario", icon: Calendar },
  { name: "Insights", href: "/insights", icon: BarChart2 },
  { name: "KORE AI", href: "/kore-ai", icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { configuracoes, companyPlan } = useStore();
  const supabase = createClient();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <aside className="print:hidden w-64 border-r border-border bg-white dark:bg-sidebar flex flex-col h-screen fixed left-0 top-0 z-50 text-sidebar-foreground">
      {/* Logo Area */}
      <div className="px-6 py-8 flex flex-col items-center justify-center gap-0">
          <Image src="/favicon_kore.svg" unoptimized alt="KORE FLOW" width={216} height={72} className="object-contain" priority />
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

      {/* Footer Area */}
      <div className="p-3 border-t border-sidebar-border/50 space-y-1 relative" ref={profileMenuRef}>
        
        {isProfileMenuOpen && (
          <div className="absolute bottom-full left-3 w-[calc(100%-24px)] mb-2 bg-[#2d2d2d] text-white rounded-xl shadow-xl border border-white/10 p-2 z-50 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3 px-3 py-2 mb-2 border-b border-white/10 hover:bg-white/5 cursor-pointer rounded-lg transition-colors">
              {configuracoes?.foto ? (
                <img src={configuracoes.foto} alt="Perfil" className="w-8 h-8 rounded-full object-cover shrink-0" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs">
                  {configuracoes?.nome?.substring(0,2)?.toUpperCase() || "EU"}
                </div>
              )}
              <div className="flex-1 overflow-hidden flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium truncate leading-tight">{configuracoes?.nome || "Usuário"}</p>
                  <p className="text-xs text-white/60 truncate leading-tight mt-0.5">{companyPlan}</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-white/50 rotate-180" />
              </div>
            </div>

            <a href="/vendas#planos" onClick={() => setIsProfileMenuOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-white">
              <Sparkles className="w-4 h-4" /> Upgrade de Plano
            </a>
            <button onClick={() => { setIsProfileMenuOpen(false); router.push('/kore-ai'); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-white/10 rounded-lg transition-colors text-white">
              <Bot className="w-4 h-4" /> KORE AI
            </button>
            <button onClick={() => { setIsProfileMenuOpen(false); router.push('/configuracoes?tab=perfil'); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-white/10 rounded-lg transition-colors text-white">
              <User className="w-4 h-4" /> Perfil
            </button>
            <button onClick={() => { setIsProfileMenuOpen(false); router.push('/configuracoes?tab=etiquetas'); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-white/10 rounded-lg transition-colors text-white">
              <Tag className="w-4 h-4" /> Criar Etiqueta
            </button>
            <button onClick={() => { setIsProfileMenuOpen(false); router.push('/configuracoes?tab=conta'); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-white/10 rounded-lg transition-colors border-b border-white/10 rounded-b-none mb-1 text-white">
              <Settings className="w-4 h-4" /> Configurações
            </button>
            
            <button onClick={() => { setIsProfileMenuOpen(false); router.push('/ajuda'); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-white/10 rounded-lg transition-colors mt-1 text-white">
              <HelpCircle className="w-4 h-4" /> Ajuda
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-white/10 rounded-lg transition-colors text-white">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        )}

        <button 
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className="flex items-center gap-3 px-2 py-2 w-full rounded-xl transition-colors hover:bg-secondary/80 text-left"
        >
          {configuracoes?.foto ? (
            <img src={configuracoes.foto} alt="Perfil" className="w-8 h-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {configuracoes?.nome?.substring(0,2)?.toUpperCase() || "EU"}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <p className="text-[13px] font-semibold text-foreground truncate">{configuracoes?.nome || "Usuário"}</p>
            <p className="text-[11px] text-muted-foreground truncate font-medium">{companyPlan}</p>
          </div>
          <div className="w-5 h-5 rounded-md bg-secondary flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-muted-foreground"><path d="M12 4v16m-8-8h16" /></svg>
          </div>
        </button>
        <div className="pt-4 pb-2 flex justify-center w-full">
          <Image src="/kore-logo-preto.svg" alt="KORE" width={80} height={24} className="opacity-100 dark:hidden" />
          <Image src="/logo-white2.svg" alt="KORE" width={80} height={24} className="opacity-100 hidden dark:block" />
        </div>
      </div>
    </aside>
  );
}





