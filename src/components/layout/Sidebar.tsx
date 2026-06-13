"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Execuções", href: "/execucoes", icon: LayoutGrid },
  { name: "Projetos", href: "/projetos", icon: Folder },
  { name: "Planejamento", href: "/planejamento", icon: ClipboardCheck },
  { name: "Calendário", href: "/calendario", icon: Calendar },
  { name: "Insights", href: "/insights", icon: BarChart2 },
  { name: "KORE AI", href: "/kore-ai", icon: Bot },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { configuracoes } = useStore();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <aside className="print:hidden w-64 border-r border-border bg-white dark:bg-sidebar flex flex-col h-screen fixed left-0 top-0 text-sidebar-foreground">
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
      <div className="p-3 border-t border-sidebar-border/50 space-y-1">
        <div className="flex items-center gap-3 px-2 py-1.5 mb-1">
          {configuracoes?.foto ? (
            <img src={configuracoes.foto} alt="Perfil" className="w-8 h-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[10px]">
              {configuracoes?.nome?.substring(0,2)?.toUpperCase() || "EU"}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-medium truncate">{configuracoes?.nome || "Usuário"}</p>
            <p className="text-[10px] text-muted-foreground truncate">Administrador</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-2 py-1.5 w-full rounded-md transition-colors text-xs font-medium hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
        <button className="flex items-center gap-3 px-2 py-1.5 w-full rounded-md transition-colors text-xs font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground">
          <ChevronLeft className="h-4 w-4" />
          Recolher menu
        </button>
        <div className="pt-4 pb-2 flex justify-center w-full">
          <Image src="/kore-logo-preto.svg" alt="KORE" width={80} height={24} className="opacity-100 dark:hidden" />
          <Image src="/logo-white2.svg" alt="KORE" width={80} height={24} className="opacity-100 hidden dark:block" />
        </div>
      </div>
    </aside>
  );
}





