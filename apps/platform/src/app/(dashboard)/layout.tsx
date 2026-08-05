import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ModalProvider } from "@/hooks/use-modal";
import { ModalManager } from "@/components/providers/modal-manager";
import { StoreProvider } from "@/hooks/use-store";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { OnboardingGuard } from "@/components/providers/OnboardingGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <ThemeProvider>
      <ModalProvider>
        <div className="flex h-screen print:h-auto bg-gradient-to-br from-background to-secondary/30 relative overflow-hidden print:overflow-visible print:bg-none">
          <Sidebar />
          <div className="flex-1 md:ml-64 print:ml-0 flex flex-col overflow-hidden print:overflow-visible w-full">
            <Header />
            <main className="flex-1 overflow-y-auto print:overflow-visible p-4 md:p-8 print:p-0">
              {children}
            </main>
          </div>
        </div>
        <ModalManager />
        <OnboardingGuard />
      </ModalProvider>
      </ThemeProvider>
    </StoreProvider>
  );
}

