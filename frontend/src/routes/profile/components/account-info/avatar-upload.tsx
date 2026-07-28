import { useRef, useState } from "react";
import axios from "axios";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { removeProfilePhoto, uploadProfilePhoto } from "@/services/userService";
import { cn } from "@/utils/utils";

const errMessage = (e: unknown, fallback: string): string =>
  (axios.isAxiosError(e) ? (e.response?.data as { message?: string } | undefined)?.message : undefined) ?? fallback;

interface AvatarUploadProps {
  photoUrl?: string | null;
  initial: string;
  /** Chamado após upload/remoção bem-sucedidos, pra recarregar o usuário logado. */
  onChanged: () => void;
}

/**
 * Avatar circular com upload imediato (sem depender do botão "Salvar" do resto
 * do formulário) — mesmo comportamento de troca de foto em qualquer app.
 */
export function AvatarUpload({ photoUrl, initial, onChanged }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      await uploadProfilePhoto(file);
      onChanged();
    } catch (e) {
      toast.error(errMessage(e, "Falha ao enviar a foto."));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    try {
      await removeProfilePhoto();
      onChanged();
    } catch (e) {
      toast.error(errMessage(e, "Falha ao remover a foto."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative size-24 shrink-0 group">
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

      <div
        className={cn(
          "size-24 rounded-full ring-4 ring-zinc-950 overflow-hidden flex items-center justify-center text-3xl font-bold text-white shadow-xl",
          !photoUrl && "brand-gradient",
        )}
      >
        {photoUrl ? (
          <img src={photoUrl} alt="Foto de perfil" className="size-full object-cover" />
        ) : (
          initial
        )}
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100"
        aria-label="Trocar foto de perfil"
      >
        {busy ? <Loader2 className="size-5 animate-spin text-white" /> : <Camera className="size-5 text-white" />}
      </button>

      {photoUrl && !busy && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute -bottom-1 -right-1 p-1.5 bg-black/80 hover:bg-black rounded-full text-white transition-colors ring-2 ring-zinc-950"
          aria-label="Remover foto de perfil"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}