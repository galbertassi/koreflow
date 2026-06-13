import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function PrimeirosPassos() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4 max-w-2xl mx-auto text-center">
      <div className="w-16 h-16 bg-[#8B5CF6]/10 rounded-2xl flex items-center justify-center mb-8">
        <Sparkles className="w-8 h-8 text-[#8B5CF6]" />
      </div>

      <h1 className="text-3xl font-medium tracking-tight mb-3 text-foreground">
        Bem-vindo ao KORE FLOW
      </h1>
      <p className="text-muted-foreground text-lg mb-12 max-w-lg">
        Vamos configurar seu ambiente para que ele funcione perfeitamente para você.
      </p>

      <div className="w-full space-y-6 text-left">
        {/* Passo 1 */}
        <div className="bg-white border border-border/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-border text-xs font-medium">
              1
            </div>
            <h3 className="font-medium text-foreground">Qual o seu nome?</h3>
          </div>
          <Input placeholder="Ex: Gabriel" className="h-12 bg-[#F5F5F2]/50 border-border/50" />
        </div>

        {/* Passo 2 */}
        <div className="bg-white border border-border/50 rounded-2xl p-6 shadow-sm opacity-50 pointer-events-none">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-border text-xs font-medium">
              2
            </div>
            <h3 className="font-medium text-foreground">Qual o seu objetivo principal?</h3>
          </div>
          <Input placeholder="Ex: Organizar minha rotina de trabalho" className="h-12 bg-[#F5F5F2]/50 border-border/50" disabled />
        </div>

        {/* Passo 3 */}
        <div className="bg-white border border-border/50 rounded-2xl p-6 shadow-sm opacity-50 pointer-events-none">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-border text-xs font-medium">
              3
            </div>
            <h3 className="font-medium text-foreground">Qual sua área de atuação?</h3>
          </div>
          <Input placeholder="Ex: Design de Produto" className="h-12 bg-[#F5F5F2]/50 border-border/50" disabled />
        </div>

        {/* Passo 4 */}
        <div className="bg-white border border-border/50 rounded-2xl p-6 shadow-sm opacity-50 pointer-events-none">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-border text-xs font-medium">
              4
            </div>
            <h3 className="font-medium text-foreground">Defina sua primeira meta</h3>
          </div>
          <Input placeholder="Ex: Lançar versão 1.0 até dezembro" className="h-12 bg-[#F5F5F2]/50 border-border/50" disabled />
        </div>

        {/* Passo 5 */}
        <div className="bg-white border border-border/50 rounded-2xl p-6 shadow-sm opacity-50 pointer-events-none flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-medium">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Conectar KORE AI</h3>
              <p className="text-sm text-muted-foreground">Sua assistente pessoal inteligente</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2" disabled>
            Conectar <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mt-12 flex justify-end w-full">
        <Link href="/">
          <Button className="bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white rounded-full px-8 h-12 text-base shadow-lg shadow-[#8B5CF6]/20 transition-all hover:scale-105">
            Continuar para o Dashboard
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
