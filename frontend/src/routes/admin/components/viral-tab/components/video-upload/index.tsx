import { useRef, useState } from "react";
import { Film, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { uploadVideoStorage } from "@/services/viralService";
import { cn } from "@/utils/utils";

import { errMessage } from "../image-upload";

/** Limite de duração do preview (s). Card autoplay em loop — vídeo curto. */
const MAX_DURATION_S = 10;
/** Menor lado mínimo em px. 720 = piso de qualidade; ideal é 1080×1920 (Full HD 9:16). */
const MIN_SHORT_SIDE = 720;

interface VideoUploadProps {
  value: string | null | undefined;
  /** Pasta de destino no storage (ex.: "viral/templates"). */
  folder: string;
  onChange: (url: string) => void;
  className?: string;
}

/**
 * Lê a metadata do vídeo no client e valida duração + resolução ANTES de subir,
 * pra dar feedback instantâneo e garantir qualidade. Retorna a mensagem de erro
 * ou null se o vídeo estiver ok.
 */
const validateVideo = (file: File): Promise<string | null> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      const { duration, videoWidth, videoHeight } = video;
      if (duration > MAX_DURATION_S + 0.5) {
        resolve(`O vídeo tem ${duration.toFixed(1)}s. O limite é ${MAX_DURATION_S}s.`);
        return;
      }
      if (Math.min(videoWidth, videoHeight) < MIN_SHORT_SIDE) {
        resolve(`Resolução baixa (${videoWidth}×${videoHeight}). Use no mínimo 720p — ideal 1080×1920.`);
        return;
      }
      resolve(null);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("Não foi possível ler o vídeo. Envie um arquivo MP4 ou WEBM válido.");
    };
    video.src = url;
  });

/**
 * Campo de upload de vídeo de preview: valida no client, sobe pro storage
 * (POST /api/admin/storage/upload-video) e devolve a URL pública direta,
 * que o <video src> do Trend Boost já toca. Substitui o antigo campo de URL,
 * que quebrava com links de viewer (Google Drive/YouTube).
 */
export function VideoUpload({ value, folder, onChange, className }: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const error = await validateVideo(file);
      if (error) {
        toast.error(error);
        return;
      }
      const res = await uploadVideoStorage(file, folder);
      onChange(res.data.url as string);
    } catch (e) {
      toast.error(errMessage(e, "Falha ao enviar o vídeo."));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div
      className={cn(
        "relative w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors overflow-hidden",
        value ? "border-transparent bg-surface-2" : "border-white/10 bg-black/20 hover:border-brand-500/50",
        !value && !uploading && "cursor-pointer",
        className,
      )}
      onClick={() => !value && !uploading && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
    >
      <input
        type="file"
        accept="video/mp4,video/webm"
        className="hidden"
        ref={inputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-2 text-text-3 text-sm">
          <Loader2 className="size-5 animate-spin text-brand-400" />
          Enviando…
        </div>
      ) : value ? (
        <>
          <video
            src={value}
            className="w-full h-full object-cover"
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
          />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
            aria-label="Remover vídeo"
          >
            <X className="size-4" />
          </button>
        </>
      ) : (
        <div className="text-center p-4">
          <div className="size-10 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-2 text-brand-400">
            <Film className="size-5" />
          </div>
          <p className="text-sm font-medium text-text-1 flex items-center gap-1.5 justify-center">
            <Upload className="size-3.5" /> Clique ou arraste
          </p>
          <p className="text-xs text-text-3 mt-1">MP4/WEBM · 9:16 · 1080×1920 · até {MAX_DURATION_S}s</p>
        </div>
      )}
    </div>
  );
}
