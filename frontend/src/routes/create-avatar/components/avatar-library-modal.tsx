import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Trash2, Users, X } from "lucide-react";
import { avatars as initialAvatars } from "@/data/mock";
import { Dialog, DialogHeader, DialogTitle, DialogTrigger } from "@/components";
import { cn } from "@/utils/utils";

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
        className
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
}: {
  avatar: { id: string | number; name: string; image: string };
  isCustom?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[20px] bg-surface-2 border border-white/5 transition-all hover:border-white/10 hover:-translate-y-1 hover:shadow-[0_12px_24px_-12px_rgba(75,68,232,0.3)] aspect-[9/16]">
      <img
        src={avatar.image}
        alt={avatar.name}
        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      
      {/* Nome no hover (Pill com Efeito Glass) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-start p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10">
        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.5)] max-w-full">
          <p className="truncate text-sm font-semibold text-white drop-shadow-md">{avatar.name}</p>
        </div>
      </div>

      {isCustom && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            // TODO: integrar exclusão real
            console.log("Mock: excluir avatar", avatar.id);
          }}
          aria-label="Excluir avatar"
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-full btn-brand text-white opacity-0 shadow-md transition-all duration-300 hover:scale-105 group-hover:opacity-100 focus:opacity-100 z-20"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );
}

export function AvatarLibraryModal({ children }: { children: React.ReactNode }) {
  const customAvatars = initialAvatars.slice(2, 4).map(a => ({ ...a, id: a.id.toString() }));
  
  const systemAvatars = [
    { id: 901, name: "Ana Beatriz", gender: "Feminino", image: "/avatar1.jpeg" },
    { id: 902, name: "Carlos Eduardo", gender: "Masculino", image: "/avatar2.jpeg" },
    { id: 903, name: "Sofia Mendes", gender: "Feminino", image: "/avatar3.jpeg" },
    { id: 904, name: "Mariana Costa", gender: "Feminino", image: "/avatar4.jpeg" },
    { id: 905, name: "Letícia Silva", gender: "Feminino", image: "/avatar5.jpeg" },
    { id: 906, name: "Pedro Henrique", gender: "Masculino", image: "/avatar-masc1.jpeg" },
    { id: 907, name: "Lucas Almeida", gender: "Masculino", image: "/avatar-masc2.jpeg" },
    { id: 908, name: "Bruno Castro", gender: "Masculino", image: "/avatar-masc3.jpeg" },
    { id: 909, name: "Thiago Santos", gender: "Masculino", image: "/avatar-masc4.jpeg" },
    { id: 910, name: "Rafael Costa", gender: "Masculino", image: "/avatar-masc5.jpeg" },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      {/* Efeito Glass Intenso */}
      <GlassDialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto border-white/20 bg-zinc-950/50 backdrop-blur-2xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.5)]">
        <DialogHeader className="mb-2 text-left">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400">
              Biblioteca
            </span>
            <DialogTitle className="text-xl font-extrabold text-white">
              Biblioteca de Avatares
            </DialogTitle>
            <p className="text-sm text-text-2 mt-0.5">
              Escolha um avatar do sistema ou gerencie os seus modelos customizados.
            </p>
          </div>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-8 pb-4">
          {/* SEÇÃO SISTEMA */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-4 rounded-full bg-brand-500"></div>
                <h3 className="text-lg font-bold text-white">Avatares do sistema</h3>
              </div>
              <p className="text-xs text-text-3 pl-3">Modelos prontos para uso em suas campanhas</p>
            </div>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {systemAvatars.map((avatar) => (
                <AvatarCard key={avatar.id} avatar={avatar} />
              ))}
            </div>
          </div>

          {/* SEÇÃO MEUS AVATARES */}
          <div className="flex flex-col gap-4 pt-8 border-t border-white/5">
            <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-4 rounded-full bg-brand-500"></div>
                  <h3 className="text-lg font-bold text-white">Meus avatares</h3>
                </div>
                <p className="text-xs text-text-3 pl-3">Avatares criados ou importados por você</p>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2 border border-white/10 shadow-sm">
                <Users className="size-3.5 text-brand-400" />
                <span className="text-xs font-semibold text-text-2">
                  <span className="text-white">{customAvatars.length}</span> / 20
                </span>
              </div>
            </div>
            
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {customAvatars.map((avatar) => (
                <AvatarCard key={avatar.id} avatar={avatar} isCustom />
              ))}
            </div>
          </div>
        </div>
      </GlassDialogContent>
    </Dialog>
  );
}
