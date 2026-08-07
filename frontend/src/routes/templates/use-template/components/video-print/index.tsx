import { S3Image } from "@/components";
import { Image as ImageIcon, Loader2 } from "lucide-react";

interface VideoPrintProps {
  /** Frame capturado ou resultado do swap (imagem base que recebe as trocas). */
  src?: string | null;
  loading?: boolean;
}

export function VideoPrint({ src, loading }: VideoPrintProps) {
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
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm">
            <Loader2 className="size-7 animate-spin text-brand-400" />
            <span className="text-sm font-medium text-white/80">
              Processando com IA...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
