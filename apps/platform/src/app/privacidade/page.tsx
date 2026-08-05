import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import Image from 'next/image';

export default function Privacidade() {
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
            <Lock className="w-3.5 h-3.5" />
            <span>Documento Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
            Política de Privacidade
          </h1>
          <p className="text-lg text-gray-400">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none text-gray-400 space-y-12">
          
          <section className="space-y-4">
            <p className="text-xl text-gray-300 leading-relaxed font-light">
              Na KORE Flow, a privacidade e segurança dos seus dados não são apenas recursos, são os pilares da nossa infraestrutura.
            </p>
            <p className="leading-relaxed">
              Esta política descreve detalhadamente como coletamos, utilizamos, armazenamos e protegemos as suas informações, garantindo total transparência e conformidade com as leis de proteção de dados vigentes, incluindo a LGPD (Lei Geral de Proteção de Dados).
            </p>
          </section>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-12"></div>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">1. Quais dados coletamos?</h2>
            <p className="leading-relaxed">
              Coletamos apenas as informações estritamente necessárias para a prestação e otimização dos nossos serviços de gestão:
            </p>
            <ul className="list-disc pl-6 space-y-3 marker:text-[#8B5CF6]">
              <li><strong className="text-gray-300">Dados de Cadastro:</strong> Nome, e-mail, telefone e informações da empresa.</li>
              <li><strong className="text-gray-300">Dados de Uso:</strong> Demandas registradas, tempo cronometrado e métricas de esforço.</li>
              <li><strong className="text-gray-300">Dados Técnicos:</strong> Endereço IP, tipo de navegador, sistema operacional e logs de acesso para segurança.</li>
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">2. Como utilizamos os dados?</h2>
            <p className="leading-relaxed">
              Os dados coletados são utilizados com os seguintes propósitos exclusivos:
            </p>
            <ul className="list-disc pl-6 space-y-3 marker:text-[#8B5CF6]">
              <li>Fornecer métricas precisas sobre suas tarefas e performance de equipe.</li>
              <li>Garantir a segurança da sua conta e prevenir fraudes.</li>
              <li>Melhorar continuamente a interface e as funcionalidades da plataforma KORE Flow.</li>
              <li>Enviar comunicações operacionais importantes e atualizações do sistema.</li>
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">3. Segurança e Criptografia</h2>
            <p className="leading-relaxed">
              Implementamos protocolos rigorosos de criptografia de ponta a ponta (AES-256) para os dados em repouso e TLS para os dados em trânsito. Nossos servidores são monitorados 24/7 e o acesso às informações é restrito apenas a sistemas autorizados, garantindo que suas métricas empresariais jamais sejam expostas.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">4. Seus Direitos</h2>
            <p className="leading-relaxed">
              Você possui total controle sobre seus dados. A qualquer momento, você pode solicitar a visualização, edição, portabilidade ou exclusão completa (anonimização) das suas informações de nossos bancos de dados, entrando em contato com nosso suporte.
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
