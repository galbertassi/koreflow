import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutCanceledPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <XCircle className="w-16 h-16 text-gray-400 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Assinatura não concluída
      </h1>
      <p className="text-gray-600 mb-8 max-w-md">
        O processo de pagamento foi interrompido e você não foi cobrado.
        Seu plano atual continua o mesmo.
      </p>
      <Link 
        href="/vendas"
        className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-lg font-medium transition-colors shadow-sm"
      >
        Voltar para Planos
      </Link>
    </div>
  );
}
