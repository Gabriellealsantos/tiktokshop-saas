import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GlassPanel } from "@/components";
import { S3Image } from "@/components/s3-image";
import { Check, Sparkles, Film, ArrowLeft } from "lucide-react";
import { Button } from "@/components/button";
import { cn } from "@/utils/utils";

interface PromptLoadingProps {
  imageSrc?: string | null;
}

export function PromptLoading({ imageSrc }: PromptLoadingProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Avança para o passo 1 após 1.8s
    const timer1 = setTimeout(() => setStep(1), 1800);
    // Avança para o passo 2 após 3.6s
    const timer2 = setTimeout(() => setStep(2), 3600);
    // Avança para o passo 3 após 5.4s
    const timer3 = setTimeout(() => setStep(3), 5400);

    // Barra de progresso fluida
    const duration = 7500; // Tempo estimado
    const intervalTime = 50;
    const stepAmount = 100 / (duration / intervalTime);

    const progressTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) return 95; // Trava no 95% até finalizar
        return p + stepAmount;
      });
    }, intervalTime);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearInterval(progressTimer);
    };
  }, []);

  const loadingSteps = [
    "Analisando video",
    "Alinhando movimentos do Influencer",
    "Replicando cenario",
    "Gerando prompt",
  ];

  const timeRemaining = Math.max(0.1, ((100 - progress) / 100) * 7.5).toFixed(1);

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      <style>{`
        @keyframes loading-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
      {/* Títulos do Topo */}
      <div className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-[11px] font-bold text-brand-400 uppercase tracking-widest self-start">
          <Sparkles className="size-3.5" />
          Inteligência Viral
        </div>
        <h1 className="text-3xl sm:text-[32px] font-extrabold text-white flex items-center gap-3 tracking-tight">
          <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <Film className="size-5 text-white" />
          </div>
          Replique movimentos de qualquer vídeo viral
        </h1>
        <p className="text-white/60 text-sm max-w-3xl leading-relaxed">
          Escolha um modelo, a IA captura o melhor frame, troca a pessoa pelo seu avatar e gera um prompt pronto para usar em qualquer ferramenta de geração de vídeo.
        </p>
      </div>

      <div className="w-full rounded-[32px] bg-[#0F0D15]/60 backdrop-blur-3xl border border-white/5 py-16 px-6 flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_80px_rgba(75,68,232,0.15)] min-h-[75vh]">
        {/* Subtle dot pattern grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSI+PC9yZWN0Pgo8Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSI+PC9jaXJjbGU+Cjwvc3ZnPg==')] opacity-40 pointer-events-none" />

        {/* Glows de fundo no container grande */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/15 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

        {/* Componente Centralizado (Inner Panel) */}
        <div className="w-full max-w-md flex flex-col items-center relative z-10 mx-auto">
          <div className="panel w-full flex flex-col items-center p-8 relative overflow-hidden z-10 mx-auto rounded-[28px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
            
            {/* Topo: Círculo com a imagem */}
            <div className="relative mb-6 z-10 mx-auto flex justify-center w-fit">
              <div className="size-24 rounded-full overflow-hidden border-2 border-brand-500 shadow-[0_0_24px_rgba(109,91,245,0.4)] bg-deep relative flex items-center justify-center p-1">
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
              <div className="absolute -bottom-1 -right-1 size-7 rounded-full bg-surface-1 border border-white/10 flex items-center justify-center text-brand-400">
                 <Sparkles className="size-3.5" />
              </div>
            </div>

            {/* Títulos Internos */}
            <div className="text-center mb-6 z-10">
              <h2 className="text-xl font-bold text-white tracking-tight mb-2">
                Gerando prompt de movimento
              </h2>
              <p className="text-xs text-white/50 max-w-[260px] mx-auto leading-relaxed">
                Estamos preparando o prompt cinematográfico e a imagem final.
              </p>
            </div>

            {/* Barra de Progresso */}
            <div className="w-[85%] flex flex-col gap-1.5 mb-6 z-10">
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden relative">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-500 to-brand-300 transition-all duration-100 ease-linear rounded-full shadow-[0_0_15px_rgba(109,91,245,0.8)] overflow-hidden" 
                  style={{ width: `${progress}%` }} 
                >
                  <div 
                    className="absolute inset-0 w-[40%] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
                    style={{ animation: 'loading-slide 1.5s infinite linear' }} 
                  />
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-white/40 font-medium px-0.5">
                <span>{Math.round(progress)}%</span>
                <span>{timeRemaining}s</span>
              </div>
            </div>

            {/* Passos Sequenciais */}
            <div className="flex flex-col gap-2.5 w-full z-10">
              {loadingSteps.map((text, index) => {
                const isActive = step === index;
                const isCompleted = step > index;

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-[16px] transition-all duration-500 relative overflow-hidden backdrop-blur-md",
                      isActive
                        ? "bg-white/[0.06] border border-white/20 shadow-[0_4px_24px_rgba(109,91,245,0.15)]"
                        : "bg-white/[0.02] border border-white/5",
                      isCompleted && "opacity-50"
                    )}
                  >
                    {/* Ícone */}
                    <div className="flex-shrink-0 flex items-center justify-center size-5">
                      {isCompleted ? (
                        <Check className="size-3.5 text-brand-400" />
                      ) : isActive ? (
                        <div className="size-3.5 rounded-full border-[2px] border-brand-500 border-t-transparent animate-spin" />
                      ) : (
                        <div className="size-3.5 rounded-full border-[1.5px] border-white/20" />
                      )}
                    </div>

                    {/* Texto */}
                    <span
                      className={cn(
                        "text-[13px] font-medium transition-colors duration-500",
                        isActive ? "text-white" : isCompleted ? "text-white/70" : "text-white/40"
                      )}
                    >
                      {text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
