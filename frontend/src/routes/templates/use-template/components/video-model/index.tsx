import { type RefObject } from "react";
import { Play } from "lucide-react";

interface VideoModelProps {
  videoUrl?: string;
  videoRef: RefObject<HTMLVideoElement>;
}

export function VideoModel({ videoUrl, videoRef }: VideoModelProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold tracking-wide text-white/50 uppercase pl-1">Modelo</span>
      <div className="group relative overflow-hidden rounded-[20px] bg-gradient-to-br from-surface-3 to-deep border border-white/5 aspect-[9/16] flex flex-col items-center justify-center">
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              // Sem isso, canvas.toBlob() falha (canvas "tainted") ao capturar o frame
              // pra troca de pessoa — precisa também de CORS habilitado no bucket
              // (ver ensureCorsConfigured em StorageConfig.java).
              crossOrigin="anonymous"
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onError={(e) => {
                (e.target as HTMLVideoElement).style.display = 'none';
                (e.target as HTMLVideoElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            {/* Fallback caso erro ao carregar o vídeo */}
            <div className="hidden absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent flex flex-col items-center justify-center text-white/30 gap-4">
              <div className="size-16 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-md border border-white/10">
                <Play className="size-6 ml-1" />
              </div>
              <span className="text-sm font-medium">Erro ao carregar vídeo</span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent flex flex-col items-center justify-center text-white/30 gap-4">
            <div className="size-16 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-md border border-white/10">
              <Play className="size-6 ml-1" />
            </div>
            <span className="text-sm font-medium">Vídeo do Modelo</span>
          </div>
        )}
      </div>
    </div>
  );
}
