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
    // Avança para o passo 1 após 2.5s
    const timer1 = setTimeout(() => setStep(1), 2500);
    // Avança para o passo 2 após 5s
    const timer2 = setTimeout(() => setStep(2), 5000);

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
      clearInterval(progressTimer);
    };
  }, []);

  const loadingSteps = [
    "Analisando a cena",
    "Compondo direção de câmera",
    "Finalizando prompt",
  ];

  const timeRemaining = Math.max(0.1, ((100 - progress) / 100) * 7.5).toFixed(1);

  return (
    <div className="w-full flex flex-col gap-6 pb-12 mt-2">
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

      <div className="flex items-center">
        <Button 
          variant="secondary" 
          className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs h-8 px-4" 
          size="sm"
          onClick={() => navigate("/templates")}
        >
          <ArrowLeft className="size-3.5 mr-2" /> 
          Voltar aos templates
        </Button>
      </div>

      {/* Container Grande Externo (Glass) */}
      <div className="w-full rounded-[32px] bg-[#0F0D15]/40 backdrop-blur-3xl border border-white/5 py-16 px-6 flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_80px_rgba(75,68,232,0.15)] min-h-[65vh]">
        {/* Glow de fundo no container grande */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/15 rounded-full blur-[120px] pointer-events-none" />

        {/* Componente Centralizado (Inner GlassPanel) */}
        <div className="w-full max-w-md flex flex-col items-center relative z-10">
          <GlassPanel className="w-full flex flex-col items-center p-8 relative overflow-hidden bg-surface-1/60 border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] rounded-[28px]">
            
            {/* Topo: Círculo com a imagem */}
            <div className="relative mb-6 z-10">
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
            <div className="w-full flex flex-col gap-1.5 mb-6 z-10">
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
                <div 
                  className="absolute top-0 left-0 h-full bg-brand-400 transition-all duration-100 ease-linear rounded-full shadow-[0_0_10px_rgba(109,91,245,0.6)]" 
                  style={{ width: `${progress}%` }} 
                />
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
                      "flex items-center gap-3 px-4 py-3 rounded-[16px] transition-all duration-500 relative overflow-hidden",
                      isActive
                        ? "bg-brand-500/10 border border-brand-500/30 shadow-[0_4px_24px_rgba(109,91,245,0.15)]"
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
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
