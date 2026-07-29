import { UserPlus, Crop, RefreshCcw, Upload } from "lucide-react";
import { Button } from "@/components/button";

interface AvatarPreviewProps {
  avatarSelecionado: string | null;
  handleAvatarClick: () => void;
  openCropModal: () => void;
  setAvatarPickerOpen: (open: boolean) => void;
  openFilePicker: () => void;
}

export function AvatarPreview({
  avatarSelecionado,
  handleAvatarClick,
  openCropModal,
  setAvatarPickerOpen,
  openFilePicker
}: AvatarPreviewProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold tracking-wide text-white/50 uppercase pl-1">Avatar</span>

      {!avatarSelecionado ? (
        <button
          onClick={handleAvatarClick}
          className="group relative overflow-hidden rounded-[20px] bg-white/[0.02] border-2 border-dashed border-accent-400/30 hover:border-accent-400/60 hover:bg-white/[0.04] transition-all duration-300 aspect-[9/16] flex flex-col items-center justify-center text-center p-6 outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <div className="size-16 rounded-full bg-accent-500/10 flex items-center justify-center text-accent-400 mb-5 group-hover:scale-110 group-hover:bg-accent-500/20 transition-all duration-300">
            <UserPlus className="size-7" />
          </div>
          <span className="font-semibold text-white/90 group-hover:text-white transition-colors text-lg mb-2">Selecionar avatar</span>
          <span className="text-sm text-white/40">Clique para escolher quem apresentará o vídeo</span>
        </button>
      ) : (
        <div className="group relative overflow-hidden rounded-[20px] bg-surface-3 border border-white/10 aspect-[9/16]">
          <img
            src={avatarSelecionado}
            alt="Avatar Selecionado"
            className="w-full h-full object-cover origin-center"
          />

          {/* Overlay gradient & buttons */}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 gap-2.5">
            <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md h-10" onClick={openCropModal}>
              <Crop className="size-4 mr-2" />
              Recortar
            </Button>
            <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md h-10" onClick={() => setAvatarPickerOpen(true)}>
              <RefreshCcw className="size-4 mr-2" />
              Trocar avatar
            </Button>
            <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md h-10" onClick={openFilePicker}>
              <Upload className="size-4 mr-2" />
              Importar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
