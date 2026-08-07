import { useRef, useState } from "react";
import axios from "axios";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { uploadStorage } from "@/services/viralService";
import { cn } from "@/utils/utils";

/** Extrai a mensagem de BusinessException do backend, com fallback. */
export const errMessage = (e: unknown, fallback: string): string =>
  (axios.isAxiosError(e) ? (e.response?.data as { message?: string } | undefined)?.message : undefined) ?? fallback;

interface ImageUploadProps {
  value: string | null | undefined;
  fallbackVideoUrl?: string;
  /** Pasta de destino no storage (ex.: "viral/templates"). */
  folder: string;
  onChange: (url: string) => void;
  className?: string;
}

/**
 * Campo de upload de imagem: sobe pro storage (POST /api/admin/storage/upload)
 * e devolve a URL pública. Reaproveita o mesmo mecanismo dos produtos/avatares.
 */
export function ImageUpload({ value, fallbackVideoUrl, folder, onChange, className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadStorage(file, folder);
      onChange(res.data.url as string);
    } catch (e) {
      toast.error(errMessage(e, "Falha ao enviar a imagem."));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div
      className={cn(
        "relative w-full h-40 rounded-xl border-2 flex flex-col items-center justify-center transition-colors overflow-hidden",
        (value || fallbackVideoUrl) ? "border-transparent bg-surface-2" : "border-dashed border-white/10 bg-black/20 hover:border-brand-500/50",
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
        accept="image/png,image/jpeg,image/webp"
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
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
            aria-label="Remover imagem"
          >
            <X className="size-4" />
          </button>
        </>
      ) : fallbackVideoUrl ? (
        <div className="relative w-full h-full group">
          <video src={fallbackVideoUrl + "#t=0.1"} className="w-full h-full object-cover pointer-events-none" preload="metadata" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <p className="text-sm font-medium text-white flex items-center gap-1.5">
              <Upload className="size-4" /> Alterar
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center p-4">
          <div className="size-10 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-2 text-brand-400">
            <ImageIcon className="size-5" />
          </div>
          <p className="text-sm font-medium text-text-1 flex items-center gap-1.5 justify-center">
            <Upload className="size-3.5" /> Clique ou arraste
          </p>
          <p className="text-xs text-text-3 mt-1">PNG, JPG ou WEBP</p>
        </div>
      )}
    </div>
  );
}
