import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import Image from 'next/image';

export default function TermosDeUso() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] overflow-x-hidden font-sans text-gray-300">
      
      {/* Background Glow Efeitos */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-[#8B5CF6]/10 blur-[120px] rounded-full z-0 pointer-events-none"></div>

      {/* HEADER SIMPLES */}
      <header className="relative z-10 w-full border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/vendas" className="hover:opacity-80 transition-opacity">
            <Image src="/logo-white.svg" alt="KORE" width={110} height={44} className="h-6 w-auto object-contain" />
          </Link>
          <Link href="/vendas" className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="relative z-10 flex-grow max-w-4xl mx-auto px-6 py-20 w-full">
        
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-400 mb-6">
            <Shield className="w-3.5 h-3.5" />
            <span>Documento Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
            Termos de Uso
          </h1>
          <p className="text-lg text-gray-400">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none text-gray-400 space-y-12">
          
          <section className="space-y-4">
            <p className="text-xl text-gray-300 leading-relaxed font-light">
              Bem-vindo ao KORE Flow. Estes Termos de Uso regem a utilização da nossa plataforma, desenvolvida para eliminar o trabalho invisível e fornecer uma gestão clara de demandas.
            </p>
            <p className="leading-relaxed">
              Ao utilizar nossos serviços, você concorda expressamente com todos os termos e condições descritos neste documento. Se você não concordar com qualquer parte destes termos, não deverá utilizar a plataforma KORE Flow.
            </p>
          </section>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-12"></div>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">1. Aceite dos Termos</h2>
            <p className="leading-relaxed">
              O uso continuado da plataforma KORE Flow, seja por meio de navegadores web, aplicativos ou integrações, implica na aceitação irrevogável de todas as diretrizes estabelecidas. A KORE Flow reserva-se o direito de atualizar estes termos periodicamente, cabendo ao usuário revisá-los.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">2. Criação e Segurança da Conta</h2>
            <ul className="list-disc pl-6 space-y-3 marker:text-[#8B5CF6]">
              <li>Você é responsável por manter a confidencialidade das suas credenciais de acesso.</li>
              <li>Todas as atividades realizadas sob sua conta são de sua inteira responsabilidade.</li>
              <li>A KORE Flow não se responsabiliza por perdas e danos resultantes de acessos não autorizados causados por negligência do usuário.</li>
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">3. Uso Apropriado da Plataforma</h2>
            <p className="leading-relaxed">
              O usuário compromete-se a utilizar o KORE Flow exclusivamente para propósitos lícitos e condizentes com a gestão de projetos e demandas. É terminantemente proibido utilizar o sistema para disseminar malwares, violar propriedades intelectuais ou realizar engenharia reversa.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">4. Propriedade Intelectual</h2>
            <p className="leading-relaxed">
              A KORE Flow, incluindo sua marca, código fonte, interfaces, textos e design gráfico, são propriedades exclusivas da KORE Digital e estão protegidas pelas leis de direitos autorais e propriedade intelectual brasileiras e internacionais.
            </p>
          </section>
        </div>
      </main>

      {/* FOOTER SIMPLES */}
      <footer className="w-full py-8 border-t border-white/5 text-center text-sm text-gray-500">
        © 2026 KORE Flow. Todos os direitos reservados.
      </footer>
    </div>
  );
}
