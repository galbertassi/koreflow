import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Assinatura confirmada!
      </h1>
      <p className="text-gray-600 mb-8 max-w-md">
        Bem-vindo ao plano PRO do KORE Flow. Sua conta já está liberada com todos os recursos e limites expandidos.
      </p>
      <Link 
        href="/"
        className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-sm"
      >
        Ir para o Dashboard
      </Link>
    </div>
  );
}
