import type { ReactNode } from "react";
import { SignatureBackground } from "@/layouts/signature-background";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-6 md:py-10">
      <SignatureBackground />
      
      {/* Container principal */}
      <div className="relative z-10 w-full max-w-[420px] lg:max-w-6xl auth-card rounded-[32px] border border-white/10 bg-black/30 shadow-2xl backdrop-blur-xl">
        <div className="relative z-[2] grid lg:grid-cols-2 rounded-[31px] overflow-hidden">
          {/* COLUNA ESQUERDA - FORMULÁRIO (EFEITO GLASS) */}
          <div className="relative flex lg:min-h-[600px] flex-col items-center justify-center bg-zinc-950/40 px-6 py-10 sm:px-8 sm:py-12 lg:p-14 backdrop-blur-xl border-none lg:border-solid lg:border-r lg:border-white/5">
            {children}
          </div>

          {/* COLUNA DIREITA - IMAGEM (SÓLIDA) */}
          <div className="relative hidden lg:block bg-[#09080e]">
            {/* 1. Imagem Base */}
            <img 
              src="/imagem-login-cadastro.png" 
              alt="Estúdio Criativo" 
              className="absolute inset-0 h-full w-full object-cover"
            />
            
            {/* 2. Aura de Luz Roxa */}
            <div className="absolute inset-0 mix-blend-screen opacity-70 pointer-events-none">
              <div className="absolute top-1/2 left-2/3 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500 blur-[100px]" />
            </div>

            {/* 3. Overlay em Gradiente */}
            <div className="absolute inset-0 bg-linear-to-t from-[#09080e] via-[#09080e]/50 to-transparent pointer-events-none" />

            {/* 4. Bloco de Texto ancorado na base-esquerda */}
            <div className="absolute bottom-0 left-0 flex w-full flex-col justify-end px-8 pb-10 pointer-events-none">
              <div className="w-full max-w-[420px] overflow-hidden pr-4">
                <h2 className="whitespace-nowrap text-[26px] xl:text-[28px] font-extrabold leading-tight tracking-tight text-white drop-shadow-lg">
                  Quebre as limitações criativas.
                </h2>
                <p className="mt-4 max-w-[380px] text-[15px] leading-relaxed text-zinc-300">
                  A plataforma de criação visual com IA para transformar qualquer ideia de avatares, imagens e vídeos em realidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
