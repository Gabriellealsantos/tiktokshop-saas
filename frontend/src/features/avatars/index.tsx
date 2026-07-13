import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Upload, Sparkles, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Button, Page, PageHeader } from "@/components";
import { AppShell } from "@/layouts/app-shell";
import { avatars as initialAvatars } from "@/services/data";
import { cn } from "@/utils/utils";

export function AvatarsList() {
  const [avatars, setAvatars] = useState(initialAvatars.slice(0, 4));
  const [customAvatars, setCustomAvatars] = useState<{ id: string; name: string; image: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setCustomAvatars((prev) => [
        ...prev,
        { id: `custom-${Date.now()}`, name: file.name.split(".")[0] || "Avatar Importado", image: url }
      ]);
      // TODO: persistir avatar importado
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const removeCustomAvatar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomAvatars((prev) => prev.filter((a) => a.id !== id));
  };

  const allAvatars = [...avatars, ...customAvatars];

  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="MEUS AVATARES"
          title="Avatares"
          description="Gerencie seus modelos visuais e crie novos influenciadores IA."
          actions={
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="secondary" onClick={openFilePicker}>
                <Upload />
                Importar do computador
              </Button>
              <Link to="/create-avatar" className="focus-visible:outline-none">
                <Button>
                  <Sparkles />
                  Criar Avatar
                </Button>
              </Link>
            </div>
          }
        />
        
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-6">
          {allAvatars.length === 0 && customAvatars.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 glass-surface rounded-[24px]">
              <ImageIcon className="size-10 text-text-3 mb-4" />
              <p className="text-text-2 font-medium">Nenhum avatar ainda</p>
            </div>
          ) : (
            allAvatars.map((avatar) => (
              <div
                key={avatar.id}
                className="group relative overflow-hidden rounded-[20px] bg-surface-2 border border-white/5 transition-all hover:border-white/10 hover:-translate-y-1 hover:shadow-[0_12px_24px_-12px_rgba(75,68,232,0.3)] focus-within:ring-2 focus-within:ring-brand-500/50 aspect-[3/4]"
              >
                <img
                  src={avatar.image}
                  alt={avatar.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="truncate text-sm sm:text-base font-semibold text-white drop-shadow-md">{avatar.name}</p>
                </div>
                
                {avatar.id.toString().startsWith("custom-") && (
                  <button
                    onClick={(e) => removeCustomAvatar(avatar.id.toString(), e)}
                    className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-red-500/80 text-white opacity-0 backdrop-blur-md transition-all hover:bg-red-500 group-hover:opacity-100 focus:opacity-100"
                    title="Remover avatar"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            ))
          )}

          <div
            onClick={openFilePicker}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openFilePicker();
              }
            }}
            className={cn(
              "group flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed transition-all hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-500/50",
              isDragging
                ? "border-brand-400 bg-brand-500/10 shadow-[0_0_24px_rgba(75,68,232,0.2)]"
                : "border-white/10 bg-white/5 hover:border-brand-500/50 hover:bg-white/10 hover:shadow-[0_12px_24px_-12px_rgba(75,68,232,0.15)]"
            )}
          >
            <div className="grid size-12 place-items-center rounded-full bg-white/5 text-brand-400 transition-transform group-hover:scale-110 group-hover:bg-brand-500/20">
              <Plus className="size-6" />
            </div>
            <p className="text-center text-sm font-medium text-text-2 transition-colors group-hover:text-white px-4">
              Adicionar avatar próprio
            </p>
          </div>
        </div>
      </Page>
    </AppShell>
  );
}
