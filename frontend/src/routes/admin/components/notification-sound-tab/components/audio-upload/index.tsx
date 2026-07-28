import { useRef, useState } from "react";
import axios from "axios";
import { Loader2, Music, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { uploadAudioStorage } from "@/services/storageService";
import { cn } from "@/utils/utils";

const errMessage = (e: unknown, fallback: string): string =>
  (axios.isAxiosError(e) ? (e.response?.data as { message?: string } | undefined)?.message : undefined) ?? fallback;

interface AudioUploadProps {
  value: string | null | undefined;
  /** Pasta de destino no storage (ex.: "notifications/sounds"). */
  folder: string;
  onChange: (url: string) => void;
  className?: string;
}

/**
 * Campo de upload de áudio: sobe pro storage (POST /api/admin/storage/upload-audio)
 * e devolve a URL pública. Mesmo mecanismo do ImageUpload, adaptado pra preview
 * com <audio> em vez de <img>.
 */
export function AudioUpload({ value, folder, onChange, className }: AudioUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadAudioStorage(file, folder);
      onChange(res.data.url as string);
    } catch (e) {
      toast.error(errMessage(e, "Falha ao enviar o áudio."));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div
      className={cn(
        "relative w-full h-16 rounded-xl border-2 border-dashed flex items-center px-4 transition-colors",
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
        accept="audio/mpeg,audio/wav,audio/ogg"
        className="hidden"
        ref={inputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {uploading ? (
        <div className="flex items-center gap-2 text-text-3 text-sm">
          <Loader2 className="size-4 animate-spin text-brand-400" />
          Enviando…
        </div>
      ) : value ? (
        <div className="flex items-center gap-2 w-full">
          <audio controls src={value} className="h-8 flex-1" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors shrink-0"
            aria-label="Remover áudio"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-text-1">
          <Music className="size-4 text-brand-400" />
          <span className="flex items-center gap-1.5"><Upload className="size-3.5" /> Clique ou arraste (MP3, WAV, OGG)</span>
        </div>
      )}
    </div>
  );
}