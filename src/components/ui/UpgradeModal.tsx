import { X, Lock, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function UpgradeModal({ 
  isOpen, 
  onClose, 
  title = "Limite Atingido",
  message = "Voc├¬ atingiu o limite do plano Free. Fa├ºa upgrade para continuar registrando demandas e expandindo seus neg├│cios."
}: UpgradeModalProps) {
  
  // Impede scroll do body quando aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay com Blur Glass */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Box */}
      <div 
        className="relative z-10 w-full max-w-md bg-white dark:bg-[#121212] rounded-3xl overflow-hidden shadow-2xl shadow-[#8B5CF6]/10 transform transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Glow Top */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9]" />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center flex flex-col items-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#6D28D9]/10 flex items-center justify-center mb-6 relative group">
            <Lock className="w-8 h-8 text-[#8B5CF6] group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#34D399] rounded-full flex items-center justify-center shadow-md animate-pulse">
              <Zap className="w-3 h-3 text-white" />
            </div>
          </div>

          <h2 className="text-xl font-bold mb-3 tracking-tight text-foreground">
            {title}
          </h2>
          
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed max-w-[280px]">
            {message}
          </p>

          <Link 
            href="/configuracoes?tab=assinatura" 
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-white font-medium bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:opacity-90 transition-opacity shadow-lg shadow-[#8B5CF6]/20"
          >
            Fazer Upgrade Agora
          </Link>
          
          <button 
            onClick={onClose}
            className="mt-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
