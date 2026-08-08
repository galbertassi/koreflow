import { HeroSidebar } from "./HeroSidebar";
import { HeroHeader } from "./HeroHeader";
import { HeroCards } from "./HeroCards";
import { HeroCharts } from "./HeroCharts";
import { HeroTable } from "./HeroTable";
import { HeroDemandModal } from "./HeroDemandModal";
import { HeroPrintPreview } from "./HeroPrintPreview";
import { HeroCalendar } from "./HeroCalendar";
import { HeroAI } from "./HeroAI";
import { HeroDemandas } from "./HeroDemandas";
import { SimulationProvider, useSimulation } from "./SimulationContext";
import { GhostCursor } from "./GhostCursor";

function HeroMainContent() {
  const { step } = useSimulation();

  const isCalendar = ["move-to-calendar", "click-calendar", "view-calendar"].includes(step);
  const isAI = ["move-to-ai", "click-ai", "view-ai", "type-ai", "send-ai", "ai-answering"].includes(step);
  const isDemandas = [
    "move-to-demandas", "click-demandas", "view-demandas", 
    "move-to-nova-demanda", "click-nova-demanda", 
    "open-demand-modal", "fill-demand", "save-demand", "close-demand"
  ].includes(step);

  if (isCalendar) {
    return <HeroCalendar />;
  }

  if (isAI) {
    return <HeroAI />;
  }

  if (isDemandas) {
    return <HeroDemandas />;
  }

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar relative">
      <HeroDemandModal />
      <HeroPrintPreview />
      <div className="flex flex-col w-full max-w-[1600px] mx-auto py-6 px-6">
        {/* Fake Tabs */}
        <div className="flex items-center gap-6 border-b border-border/60 mb-6 overflow-x-auto hide-scrollbar whitespace-nowrap">
          <div className="pb-3 text-sm font-medium relative text-slate-900">
            Visão Geral
            <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#8B5CF6] rounded-t-full"></span>
          </div>
          <div className="pb-3 text-sm font-medium text-slate-500">
            Criações
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex flex-col gap-4 xl:gap-6 w-full">
          <HeroCards />
          <HeroCharts />
          <HeroTable />
        </div>
      </div>
    </main>
  );
}

export function HeroDashboard() {
  return (
    <SimulationProvider>
      <div className="relative flex h-full w-full bg-[#f8fafc] text-foreground overflow-hidden font-sans">
        <HeroSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <GhostCursor />
          <HeroHeader />
          <HeroMainContent />
        </div>
      </div>
    </SimulationProvider>
  );
}
