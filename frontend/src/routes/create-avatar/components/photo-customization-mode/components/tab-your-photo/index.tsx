import type { UseFormReturn } from "react-hook-form";
import { Camera, X } from "lucide-react";
import { Input, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components";
import type { AvatarPhotoFormValues } from "../../schema";

export function TabSuaFoto({ form }: { form: UseFormReturn<AvatarPhotoFormValues> }) {
  const fotoPreview = form.watch("fotoPrincipal");

  const handleDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      form.setValue("fotoPrincipal", url);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormField
        control={form.control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider">Nome do Avatar</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Aurora, Marcus, Luna..." className="bg-surface-2 border-white/10 text-white h-12 rounded-xl" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fotoPrincipal"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider">Sua Foto (Selfie / Retrato)</FormLabel>
            <FormControl>
              {fotoPreview ? (
                <div className="relative w-full aspect-square max-w-[300px] rounded-2xl overflow-hidden border-2 border-brand-500 shadow-lg mx-auto sm:mx-0">
                  <img src={fotoPreview} alt="Sua foto" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => form.setValue("fotoPrincipal", null)}
                    className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <label className="relative flex flex-col items-center justify-center w-full aspect-video sm:aspect-[21/9] rounded-2xl border-2 border-dashed border-white/20 bg-surface-2 hover:bg-white/5 hover:border-brand-500/50 transition-all cursor-pointer group">
                  <input type="file" accept="image/*" className="hidden" onChange={handleDrop} />
                  <div className="grid size-12 place-items-center rounded-full bg-white/5 group-hover:bg-brand-500/20 text-text-2 group-hover:text-brand-300 transition-colors mb-3">
                    <Camera className="size-6" />
                  </div>
                  <p className="font-semibold text-white">Enviar sua foto</p>
                  <p className="text-sm text-text-3 mt-1">De preferência rosto bem visível e iluminação clara</p>
                </label>
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
