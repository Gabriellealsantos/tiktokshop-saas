import { useEffect, useState } from "react";
import { S3Image } from "@/components";
import { Image as ImageIcon, Loader2, Check } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/utils/utils";

interface VideoPrintProps {
  /** Frame capturado ou resultado do swap (imagem base que recebe as trocas). */
  src?: string | null;
  loading?: boolean;
  loadingText?: string;
}

export function VideoPrint({ src, loading, loadingText }: VideoPrintProps) {
  const [loadingStage, setLoadingStage] = useState(1);

  useEffect(() => {
    if (loading) {
      setLoadingStage(1);
      const t1 = setTimeout(() => setLoadingStage(2), 2500);
      const t2 = setTimeout(() => setLoadingStage(3), 5000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setLoadingStage(1);
    }
  }, [loading]);

  const isAvatar = loadingText?.includes("Influencer");

  const steps = isAvatar
    ? [
        { step: 1, text: "Analisando imagem original" },
        { step: 2, text: "Estruturando alterações" },
        { step: 3, text: "Trocando Influencer" },
      ]
    : [
        { step: 1, text: "Analisando imagem original" },
        { step: 2, text: "Estruturando alterações" },
        { step: 3, text: "Adicionando produto" },
      ];

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold tracking-wide text-white/50 uppercase pl-1">
        Print do vídeo
      </span>
      <div className="group relative overflow-hidden rounded-[20px] bg-linear-to-br from-surface-3 to-deep border border-white/5 aspect-[9/16] flex flex-col items-center justify-center">
        {src ? (
          <S3Image
            src={src}
            alt="Print do vídeo"
            crossOrigin="anonymous"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 gap-4">
            <div className="size-16 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-md border border-white/10">
              <ImageIcon className="size-6" />
            </div>
            <span className="text-sm font-medium text-center px-4">
              Carregando o frame
              <br />
              do vídeo...
            </span>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <div className="flex flex-col gap-3 w-full max-w-[260px]">
              {steps.map((item) => {
                const isActive = loadingStage === item.step;
                const isPast = loadingStage > item.step;
                const isPendingStage = loadingStage < item.step;

                return (
                  <motion.div
                    key={item.step}
                    layout
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-full border transition-all duration-300",
                      isActive
                        ? "bg-brand-500/10 border-brand-500 shadow-[0_0_15px_-3px_rgba(75,68,232,0.4)]"
                        : "bg-surface-2 border-white/5",
                      isPendingStage ? "opacity-40" : "opacity-100"
                    )}
                  >
                    <div className="size-5 flex items-center justify-center shrink-0">
                      {isPast ? (
                        <Check className="size-4 text-brand-400" />
                      ) : isActive ? (
                        <Loader2 className="size-4 text-brand-400 animate-spin" />
                      ) : (
                        <div className="size-1.5 rounded-full bg-white/20" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isActive
                          ? "text-brand-100"
                          : isPast
                          ? "text-white"
                          : "text-text-3"
                      )}
                    >
                      {item.text}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
