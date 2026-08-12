import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Shield, Scale, ScrollText } from "lucide-react";
import { Button } from "@/components/button";

export default function TermsRoute() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row gap-12 items-start">
        {/* Sidebar */}
        <motion.aside 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full md:w-64 flex-shrink-0 md:sticky top-20 flex flex-col gap-8"
        >
          <div>
            <Button asChild variant="ghost" className="mb-6 -ml-4 text-zinc-400 hover:text-white">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Início
              </Link>
            </Button>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-indigo-400" />
              Documentação
            </h2>
          </div>
          
          <nav className="flex flex-col gap-2">
            <a href="#intro" className="text-sm font-medium text-indigo-400 border-l-2 border-indigo-500 pl-4 py-1 transition-colors">1. Introdução</a>
            <a href="#usage" className="text-sm font-medium text-zinc-500 hover:text-zinc-300 border-l-2 border-transparent hover:border-zinc-700 pl-4 py-1 transition-colors">2. Regras de Uso</a>
            <a href="#privacy" className="text-sm font-medium text-zinc-500 hover:text-zinc-300 border-l-2 border-transparent hover:border-zinc-700 pl-4 py-1 transition-colors">3. Privacidade e Dados</a>
            <a href="#liability" className="text-sm font-medium text-zinc-500 hover:text-zinc-300 border-l-2 border-transparent hover:border-zinc-700 pl-4 py-1 transition-colors">4. Responsabilidade</a>
          </nav>

          <div className="mt-8 p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-md">
            <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" /> Segurança
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Nossos termos são desenhados para proteger você e garantir um ambiente transparente e seguro para todos.
            </p>
          </div>
        </motion.aside>

        {/* Content */}
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-8 md:p-12 backdrop-blur-sm shadow-2xl"
        >
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Termos de Uso</h1>
            <p className="text-zinc-400 text-lg">Última atualização: 12 de Agosto de 2026</p>
          </div>

          <div className="space-y-12 prose prose-invert prose-zinc max-w-none prose-headings:font-semibold prose-h2:text-2xl prose-h2:text-indigo-100 prose-p:text-zinc-400 prose-p:leading-relaxed prose-a:text-indigo-400">
            <section id="intro">
              <h2 className="flex items-center gap-2 border-b border-zinc-800 pb-4">
                <FileText className="h-6 w-6 text-indigo-500" />
                1. Introdução
              </h2>
              <p className="mt-4">
                Bem-vindo à nossa plataforma. Ao acessar e usar nossos serviços, você concorda em cumprir e se vincular a estes Termos de Uso. 
                Nossa plataforma é focada na criação e mineração de conteúdo viral, utilizando inteligência artificial avançada para alavancar suas vendas e engajamento.
              </p>
              <p>
                Recomendamos que você leia atentamente todas as condições aqui estabelecidas antes de continuar a utilizar nossos serviços.
              </p>
            </section>

            <section id="usage">
              <h2 className="flex items-center gap-2 border-b border-zinc-800 pb-4">
                <Scale className="h-6 w-6 text-indigo-500" />
                2. Regras de Uso
              </h2>
              <p className="mt-4">
                Ao utilizar nossa suíte de ferramentas de criação, você deve observar as seguintes regras:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-zinc-400">
                <li>Não utilizar o serviço para gerar conteúdo ilegal, difamatório ou que viole direitos autorais.</li>
                <li>Os créditos adquiridos são intransferíveis e possuem validade conforme o plano assinado.</li>
                <li>O uso de automações não autorizadas ou bots para acessar nossas APIs é estritamente proibido.</li>
              </ul>
            </section>

            <section id="privacy">
              <h2 className="flex items-center gap-2 border-b border-zinc-800 pb-4">
                <Shield className="h-6 w-6 text-indigo-500" />
                3. Privacidade e Proteção de Dados
              </h2>
              <p className="mt-4">
                Valorizamos a sua privacidade. Todos os dados sensíveis e arquivos gerados (como avatares, áudios e templates) são processados 
                em conformidade com as leis de proteção de dados vigentes. Apenas você e os sistemas autorizados têm acesso ao seu conteúdo bruto.
              </p>
            </section>

            <section id="liability">
              <h2 className="flex items-center gap-2 border-b border-zinc-800 pb-4">
                <ScrollText className="h-6 w-6 text-indigo-500" />
                4. Limitação de Responsabilidade
              </h2>
              <p className="mt-4">
                Fornecemos as ferramentas "no estado em que se encontram", visando o melhor desempenho possível. Contudo, não garantimos 
                resultados específicos (como número de visualizações ou vendas) pelo uso direto das mídias geradas pela inteligência artificial. 
                As plataformas de destino (como o TikTok) possuem algoritmos próprios que fogem do nosso controle.
              </p>
            </section>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
