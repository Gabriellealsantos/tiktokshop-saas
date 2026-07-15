import { type DragEvent } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/dialog";
import { cn } from "@/utils/utils";

interface AvatarPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  openFilePicker: () => void;
  handleDrop: (e: DragEvent<HTMLDivElement>) => void;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  allAvatars: any[];
  handleAvatarSelect: (image: string) => void;
}

export function AvatarPickerModal({
  open,
  onOpenChange,
  openFilePicker,
  handleDrop,
  isDragging,
  setIsDragging,
  allAvatars,
  handleAvatarSelect
}: AvatarPickerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-surface-1/95 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <DialogHeader className="px-1 text-left pb-4 border-b border-white/5">
          <DialogTitle className="text-2xl font-bold text-white">Selecionar avatar</DialogTitle>
          <DialogDescription className="text-white/60">
            Escolha um avatar da sua galeria ou importe um novo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 py-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {/* Botão Importar (Card) */}
            <div
              onClick={openFilePicker}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openFilePicker();
                }
              }}
              className={cn(
                "group flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed transition-all hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-accent-500/50",
                isDragging
                  ? "border-accent-400 bg-accent-500/10 shadow-[0_0_24px_rgba(139,92,246,0.2)]"
                  : "border-white/10 bg-white/5 hover:border-accent-500/50 hover:bg-white/10 hover:shadow-[0_12px_24px_-12px_rgba(139,92,246,0.15)]"
              )}
            >
              <div className="grid size-12 place-items-center rounded-full bg-white/5 text-accent-400 transition-transform group-hover:scale-110 group-hover:bg-accent-500/20">
                <Plus className="size-6" />
              </div>
              <p className="text-center text-sm font-medium text-white/60 transition-colors group-hover:text-white px-4">
                Importar do computador
              </p>
            </div>

            {/* Lista de Avatares */}
            {allAvatars.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => handleAvatarSelect(avatar.image)}
                className="group relative overflow-hidden rounded-[20px] bg-surface-3 border border-white/5 transition-all hover:border-accent-500/50 hover:-translate-y-1 hover:shadow-[0_12px_24px_-12px_rgba(139,92,246,0.3)] focus:outline-none focus:ring-2 focus:ring-accent-500/50 aspect-[3/4] text-left"
              >
                <img
                  src={avatar.image}
                  alt={avatar.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="truncate text-sm font-semibold text-white drop-shadow-md">{avatar.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
