import { StoreProvider } from "@/hooks/use-store";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { OnboardingGuard } from "@/components/providers/OnboardingGuard";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <ThemeProvider>
        {/* Guard reverso: se já fez onboarding, joga pra /demandas */}
        <OnboardingGuard reverse />
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary/30">
          <main className="flex-1 flex flex-col justify-center items-center p-4">
            {children}
          </main>
        </div>
      </ThemeProvider>
    </StoreProvider>
  );
}
