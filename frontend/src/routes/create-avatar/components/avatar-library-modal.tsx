import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Loader2, Pencil, Trash2, Users, X } from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  S3Image,
} from "@/components";
import { cn } from "@/utils/utils";
import {
  useMyAvatars,
  useGalleryAvatars,
  useDeleteAvatar,
  useRenameAvatar,
} from "../api/use-avatars";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Input,
} from "@/components";

const GlassDialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    {/* Overlay com blur e menos opacidade para revelar a tela de trás */}
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-white/10 data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4 text-white" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
GlassDialogContent.displayName = "GlassDialogContent";

function AvatarCard({
  avatar,
  isCustom = false,
  mode,
  onSelect,
  onDelete,
  onRename,
  isDeleting = false,
}: {
  avatar: { id: string | number; name: string; image: string };
  isCustom?: boolean;
  mode: "manage" | "select";
  onSelect?: (avatar: {
    id: string | number;
    name: string;
    image: string;
    customPrompt?: string | null;
  }) => void;
  onDelete?: (id: number) => void;
  onRename?: (id: number, name: string) => void;
  isDeleting?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[20px] bg-surface-2 border border-white/5 transition-all hover:border-white/10 hover:-translate-y-1 hover:shadow-[0_12px_24px_-12px_rgba(75,68,232,0.3)] aspect-[9/16]",
        mode === "select" && "cursor-pointer",
      )}
      onClick={() => {
        if (mode === "select" && onSelect) {
          onSelect(avatar);
        }
      }}
    >
      <S3Image
        src={avatar.image}
        alt={avatar.name}
        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />

      {/* Nome no hover (Pill com Efeito Glass) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-start p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10">
        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.5)] max-w-full">
          <p className="truncate text-sm font-semibold text-white drop-shadow-md">
            {avatar.name}
          </p>
        </div>
      </div>

      {isCustom && mode === "manage" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRename?.(Number(avatar.id), avatar.name);
          }}
          aria-label="Renomear avatar"
          className="absolute right-12 top-3 grid size-8 place-items-center rounded-full btn-brand text-white opacity-0 shadow-md transition-all duration-300 hover:scale-105 group-hover:opacity-100 focus:opacity-100 z-20"
        >
          <Pencil className="size-4" />
        </button>
      )}

      {isCustom && mode === "manage" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(Number(avatar.id));
          }}
          disabled={isDeleting}
          aria-label="Excluir avatar"
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-full btn-brand text-white opacity-0 shadow-md transition-all duration-300 hover:scale-105 group-hover:opacity-100 focus:opacity-100 z-20 disabled:opacity-50"
        >
          {isDeleting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </button>
      )}
    </div>
  );
}

export function AvatarLibraryModal({
  children,
  mode = "manage",
  onSelect,
  open,
  onOpenChange,
  title = "Biblioteca de Avatares",
  subtitle = "Escolha um avatar do sistema ou gerencie os seus modelos customizados.",
}: {
  children?: React.ReactNode;
  mode?: "manage" | "select";
  onSelect?: (avatar: {
    id: string | number;
    name: string;
    image: string;
    customPrompt?: string | null;
  }) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  subtitle?: string;
}) {
  const { data: myAvatars, isLoading: loadingMine } = useMyAvatars();
  const { data: gallery, isLoading: loadingGallery } = useGalleryAvatars();
  const deleteAvatar = useDeleteAvatar();
  const renameAvatar = useRenameAvatar();

  const [toDelete, setToDelete] = useState<{ id: number; name: string } | null>(
    null,
  );
  const [toRename, setToRename] = useState<{ id: number; name: string } | null>(
    null,
  );
  const [newName, setNewName] = useState("");

  const customAvatars = (myAvatars?.items ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    image: a.imageUrl,
    customPrompt: a.customPrompt,
  }));

  const systemAvatars = (gallery ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    image: a.imageUrl,
    customPrompt: a.customPrompt,
  }));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}
        {/* Efeito Glass Intenso */}
        <GlassDialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto border-white/20 bg-zinc-950/50 backdrop-blur-2xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.5)]">
          <DialogHeader className="mb-2 text-left">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400">
                Biblioteca
              </span>
              <DialogTitle className="text-xl font-extrabold text-white">
                {title}
              </DialogTitle>
              <p className="text-sm text-text-2 mt-0.5">{subtitle}</p>
            </div>
          </DialogHeader>

          <div className="mt-2 flex flex-col gap-8 pb-4">
            {/* SEÇÃO SISTEMA */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-4 rounded-full bg-brand-500"></div>
                  <h3 className="text-lg font-bold text-white">
                    Avatares do sistema
                  </h3>
                </div>
                <p className="text-xs text-text-3 pl-3">
                  Modelos prontos para uso em suas campanhas
                </p>
              </div>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {loadingGallery ? (
                  <div className="col-span-full flex justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-brand-400" />
                  </div>
                ) : systemAvatars.length === 0 ? (
                  <p className="col-span-full text-sm text-text-3 py-8 text-center">
                    Nenhum avatar do sistema disponível.
                  </p>
                ) : (
                  systemAvatars.map((avatar) => (
                    <AvatarCard
                      key={avatar.id}
                      avatar={avatar}
                      mode={mode}
                      onSelect={onSelect}
                    />
                  ))
                )}
              </div>
            </div>

            {/* SEÇÃO MEUS AVATARES */}
            <div className="flex flex-col gap-4 pt-8 border-t border-white/5">
              <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1 h-4 rounded-full bg-brand-500"></div>
                    <h3 className="text-lg font-bold text-white">
                      Meus avatares
                    </h3>
                  </div>
                  <p className="text-xs text-text-3 pl-3">
                    Avatares criados ou importados por você
                  </p>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2 border border-white/10 shadow-sm">
                  <Users className="size-3.5 text-brand-400" />
                  <span className="text-xs font-semibold text-text-2">
                    <span className="text-white">{myAvatars?.total ?? 0}</span>{" "}
                    / 20
                  </span>
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {loadingMine ? (
                  <div className="col-span-full flex justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-brand-400" />
                  </div>
                ) : customAvatars.length === 0 ? (
                  <p className="col-span-full text-sm text-text-3 py-8 text-center">
                    Você ainda não criou nenhum avatar.
                  </p>
                ) : (
                  customAvatars.map((avatar) => (
                    <AvatarCard
                      key={avatar.id}
                      avatar={avatar}
                      isCustom
                      mode={mode}
                      onSelect={onSelect}
                      onDelete={(id) => setToDelete({ id, name: avatar.name })}
                      onRename={(id, name) => {
                        setToRename({ id, name });
                        setNewName(name);
                      }}
                      isDeleting={
                        deleteAvatar.isPending &&
                        deleteAvatar.variables === avatar.id
                      }
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </GlassDialogContent>
      </Dialog>
      <AlertDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
      >
        <AlertDialogContent className="bg-zinc-950/90 backdrop-blur-2xl border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir avatar</AlertDialogTitle>
            <AlertDialogDescription className="text-text-2">
              "{toDelete?.name}" será removido da sua biblioteca. Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-surface-2 border-white/10 hover:bg-white/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toDelete) deleteAvatar.mutate(toDelete.id);
                setToDelete(null);
              }}
              className="btn-brand"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!toRename} onOpenChange={(o) => !o && setToRename(null)}>
        <GlassDialogContent className="max-w-sm border-white/20 bg-zinc-950/70 backdrop-blur-2xl text-white">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg font-bold">
              Renomear avatar
            </DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome do influencer"
            className="bg-surface-2 border-white/10 text-white placeholder:text-text-3"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newName.trim() && toRename) {
                renameAvatar.mutate({ id: toRename.id, name: newName.trim() });
                setToRename(null);
              }
            }}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setToRename(null)}
              className="bg-surface-2 border-white/10 hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              className="btn-brand"
              disabled={!newName.trim()}
              onClick={() => {
                if (toRename)
                  renameAvatar.mutate({
                    id: toRename.id,
                    name: newName.trim(),
                  });
                setToRename(null);
              }}
            >
              Salvar
            </Button>
          </div>
        </GlassDialogContent>
      </Dialog>
    </>
  );
}
