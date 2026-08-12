import type { ReactNode } from "react";
import { SignatureBackground } from "@/layouts/signature-background";
import { asset } from "@/lib/media";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-6 md:py-10">
      <SignatureBackground />

      {/* Container principal */}
      <div className="relative z-10 w-full max-w-[420px] lg:max-w-[1000px] xl:max-w-[1100px] auth-card rounded-[32px] border border-white/10 bg-black/30 shadow-2xl backdrop-blur-xl">
        <div className="relative z-[2] grid lg:grid-cols-2 rounded-[31px] overflow-hidden">
          {/* COLUNA ESQUERDA - FORMULÁRIO (EFEITO GLASS) */}
          <div className="relative flex lg:min-h-[640px] flex-col items-center justify-center bg-zinc-950/40 px-6 py-10 sm:px-8 sm:py-12 lg:p-10 backdrop-blur-xl border-none lg:border-solid lg:border-r lg:border-white/5">
            {children}
          </div>

          {/* COLUNA DIREITA - IMAGEM (SÓLIDA) */}
          <div className="relative hidden lg:block bg-[#09080e]">
            {/* 1. Imagem Base */}
            <img
              src={asset("/imagem-login-cadastro.png")}
              alt="Estúdio Criativo"
              className="absolute inset-0 h-full w-full object-cover object-[60%_10%]"
            />

            {/* 3. Overlay em Gradiente */}
            <div className="absolute inset-0 bg-linear-to-t from-[#09080e] via-[#09080e]/50 to-transparent pointer-events-none" />

            {/* 4. Bloco de Texto ancorado na base-esquerda */}
            <div className="absolute bottom-0 left-0 flex w-full flex-col justify-end px-8 pb-6 pointer-events-none">
              <div className="w-full max-w-[480px] pr-4">
                <h2 className="whitespace-nowrap text-[26px] xl:text-[28px] font-extrabold leading-tight tracking-tight text-white drop-shadow-lg">
                  Quebre as limitações criativas.
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-zinc-300">
                  A plataforma de criação visual com IA para transformar<br/>
                  qualquer ideia de avatares, imagens e vídeos em realidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
