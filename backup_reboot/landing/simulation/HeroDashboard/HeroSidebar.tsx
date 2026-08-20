import { Home, LayoutGrid, Calendar, BarChart2, Bot, Cog, LogOut } from "lucide-react";
import Image from "next/image";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home, active: true },
  { name: "Demandas", href: "/demandas", icon: LayoutGrid, active: false },
  { name: "Calendário", href: "/calendario", icon: Calendar, active: false },
  { name: "Relatórios", href: "/relatorios", icon: BarChart2, active: false },
  { name: "KORE AI", href: "/kore-ai", icon: Bot, active: false },
  { name: "Configurações", href: "/configuracoes", icon: Cog, active: false },
];

export function HeroSidebar() {
  return (
    <aside className="w-64 border-r border-border bg-white flex flex-col h-full shrink-0 z-50 pointer-events-none select-none">
      {/* Logo Area */}
      <div className="px-6 py-8 flex flex-col items-center justify-center gap-0">
        <div className="flex items-center justify-center w-full">
          <Image src="/favicon_kore.svg" alt="KORE FLOW" width={160} height={160} className="object-contain" priority />
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-6 space-y-4 custom-scrollbar">
        {navItems.map((item) => (
          <div
            key={item.name}
            className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 text-[14.5px] font-medium ${
              item.active
                ? "bg-[#8B5CF6]/5 text-[#8B5CF6]"
                : "text-slate-500"
            }`}
          >
            <item.icon className={`h-5 w-5 ${item.active ? "text-[#8B5CF6]" : "text-slate-400"}`} strokeWidth={item.active ? 2 : 1.5} />
            {item.name}
          </div>
        ))}
      </nav>

      {/* Footer Area */}
      <div className="p-4 border-t border-slate-100 flex flex-col gap-2 mt-auto">
        <div className="flex items-center gap-3 px-2 py-2 mb-2 bg-slate-50 rounded-xl">
          <div className="h-8 w-8 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] font-bold text-xs shrink-0">
            GA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">Gabriel Albertassi</p>
            <p className="text-[10px] text-slate-500 truncate">Administrador</p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-xs font-medium text-slate-400">
          <LogOut className="h-4 w-4" />
          Sair
        </div>

        <div className="pt-6 pb-2 flex justify-center">
          <Image src="/kore-logo-preto.svg" alt="KORE FLOW" width={90} height={36} className="object-contain opacity-40 grayscale" />
        </div>
      </div>
    </aside>
  );
}
