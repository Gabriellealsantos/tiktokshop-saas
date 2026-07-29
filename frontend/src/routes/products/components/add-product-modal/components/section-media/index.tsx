import type { RefObject } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Upload, X } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components";
import { cn } from "@/utils/utils";
import type { AddProductFormValues } from "../..";

interface SectionMediaProps {
  form: UseFormReturn<AddProductFormValues>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleDrop: (e: React.DragEvent) => void;
  handleImageUpload: (file: File) => void;
}

export function SectionMedia({
  form,
  fileInputRef,
  handleDrop,
  handleImageUpload,
}: SectionMediaProps) {
  return (
    <div className="p-5 rounded-2xl border border-white/5 bg-surface-2/30 space-y-4">
      <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
        <Upload className="size-4 text-brand-400" />
        1. Mídia
      </h3>
      <div className="grid gap-4">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Upload de Imagem *</FormLabel>
              <FormControl>
                <div
                  className={cn(
                    "relative w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors cursor-pointer overflow-hidden",
                    field.value
                      ? "border-transparent bg-surface-2"
                      : "border-white/10 bg-surface-1 hover:border-brand-500/50 hover:bg-surface-2",
                  )}
                  onClick={() => !field.value && fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />

                  {field.value ? (
                    <>
                      <img
                        src={field.value}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          field.onChange("");
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                      >
                        <X className="size-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-2 text-brand-400">
                        <Upload className="size-5" />
                      </div>
                      <p className="text-sm font-medium text-text-1">
                        Clique para enviar ou arraste
                      </p>
                      <p className="text-xs text-text-3 mt-1">
                        PNG, JPG ou WEBP (Max. 5MB)
                      </p>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
