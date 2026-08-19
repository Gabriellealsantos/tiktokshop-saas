import { useEffect, useState } from "react";
import { GlassPanel } from "@/components";
import { S3Image } from "@/components/s3-image";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/utils/utils";

interface PromptLoadingProps {
  imageSrc?: string | null;
}

export function PromptLoading({ imageSrc }: PromptLoadingProps) {
  // 0: Analisando Influencer
  // 1: Extraindo movimentos
  // 2: Gerando prompt
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Avança para o passo 1 após 2.5s
    const timer1 = setTimeout(() => setStep(1), 2500);
    // Avança para o passo 2 após 5s
    const timer2 = setTimeout(() => setStep(2), 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const loadingSteps = [
    "Analisando Influencer",
    "Extraindo movimentos",
    "Gerando prompt",
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-lg mx-auto py-12">
      <GlassPanel className="w-full flex flex-col items-center p-8 sm:p-12 relative overflow-hidden">
        
        {/* Glow de fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Topo: Círculo com a imagem */}
        <div className="relative mb-8 z-10">
          <div className="size-28 sm:size-32 rounded-full overflow-hidden border-2 border-brand-500 shadow-[0_0_24px_rgba(109,91,245,0.4)] bg-deep relative flex items-center justify-center p-1">
            <div className="w-full h-full rounded-full overflow-hidden bg-black/50">
              {imageSrc ? (
                <S3Image
                  src={imageSrc}
                  alt="Imagem Base"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/5" />
              )}
            </div>
          </div>
        </div>

        {/* Títulos */}
        <div className="text-center mb-10 z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Montando o roteiro do seu vídeo
          </h2>
          <p className="text-sm text-white/50 max-w-[280px] mx-auto leading-relaxed">
            A IA está estruturando cena, ritmo e fala em inglês cinematográfico.
          </p>
        </div>

        {/* Passos Sequenciais */}
        <div className="flex flex-col gap-3 w-full z-10">
          {loadingSteps.map((text, index) => {
            const isActive = step === index;
            const isCompleted = step > index;

            return (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-4 px-5 py-4 rounded-[18px] transition-all duration-500 relative overflow-hidden",
                  isActive
                    ? "bg-brand-500/10 border border-brand-500/50 shadow-[0_4px_24px_rgba(109,91,245,0.15)]"
                    : "bg-white/[0.03] border border-transparent",
                  isCompleted && "opacity-60"
                )}
              >
                {/* Ícone */}
                <div className="flex-shrink-0 flex items-center justify-center size-5">
                  {isCompleted ? (
                    <Check className="size-4 text-brand-400" />
                  ) : isActive ? (
                    <Loader2 className="size-4 text-brand-400 animate-spin" />
                  ) : (
                    <div className="size-1.5 rounded-full bg-white/20" />
                  )}
                </div>

                {/* Texto */}
                <span
                  className={cn(
                    "text-sm font-medium transition-colors duration-500",
                    isActive ? "text-white" : isCompleted ? "text-white/60" : "text-white/40"
                  )}
                >
                  {text}
                </span>

                {/* Brilho sutíl no item ativo */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-500/0 via-brand-500/10 to-brand-500/0 animate-shimmer" />
                )}
              </div>
            );
          })}
        </div>
      </GlassPanel>
    </div>
  );
}
