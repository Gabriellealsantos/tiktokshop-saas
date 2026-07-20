import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Input } from "@/components";
import { useState, useRef, useEffect } from "react";
import type { AvatarFormValues } from "../../index";
import { Sparkles, Check, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ImageOptionSelector } from "../image-option-selector";
import { roupaSugestoes } from "../../data";
import { cn } from "@/utils/utils";

function CardGeracaoAutomatica({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const isSelected = value === "Geração Automática";
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <button
      type="button"
      onClick={() => onChange("Geração Automática")}
      aria-label="Selecionar Geração Automática"
      className={cn(
        "group relative overflow-hidden rounded-[20px] text-left transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-brand-500 aspect-[4/5] bg-surface-2",
        isSelected
          ? "ring-2 ring-inset ring-brand-500 shadow-[0_0_24px_-4px_rgba(75,68,232,0.4)]"
          : "ring-1 ring-inset ring-white/10 hover:ring-white/20 hover:-translate-y-1 hover:shadow-[0_12px_30px_-10px_rgba(75,68,232,0.3)]"
      )}
    >
      {/* CAMADA 1: Orbes de luz (fundo) */}
      <div className={cn(
        "absolute -top-12 -right-12 size-32 rounded-full bg-brand-500/40 blur-3xl transition-opacity duration-300",
        isSelected ? "opacity-100" : "opacity-40 group-hover:opacity-70"
      )} />
      <div className={cn(
        "absolute -bottom-12 -left-12 size-32 rounded-full bg-blue-500/30 blur-3xl transition-opacity duration-300",
        isSelected ? "opacity-100" : "opacity-30 group-hover:opacity-60"
      )} />

      {/* CAMADA 2: Face de vidro (backdrop + ruído + gradiente) */}
      <div className="absolute inset-0 backdrop-blur-xl bg-white/[0.02] saturate-150 mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      {/* CAMADA 3: Arestas e reflexo especular */}
      <div className="absolute inset-0 rounded-[20px] border border-white/10 border-t-white/20 border-b-white/5 pointer-events-none transition-colors duration-300 group-hover:border-t-white/30" />
      <div className="absolute top-[1px] inset-x-3 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-60" />

      {/* CAMADA 5: Preenchimento central (Partículas) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute size-1.5 rounded-full bg-white/70 top-[35%] left-[25%]" animate={shouldReduceMotion ? {} : { opacity: [0.1, 0.8, 0.1], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute size-2 rounded-full bg-brand-400/80 top-[40%] right-[25%]" animate={shouldReduceMotion ? {} : { opacity: [0.2, 1, 0.2], scale: [0.9, 1.3, 0.9] }} transition={{ duration: 5, delay: 1.5, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute size-1 rounded-full bg-white/90 top-[60%] left-[45%]" animate={shouldReduceMotion ? {} : { opacity: [0.1, 0.6, 0.1], scale: [1, 1.5, 1] }} transition={{ duration: 3.5, delay: 0.5, repeat: Infinity, ease: "easeInOut" }} />
      </div>

      {/* CAMADA 4: Ícone no squircle (Centralizado) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 pb-4">
        <div className="relative size-12 rounded-[14px] bg-white/5 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_4px_rgba(255,255,255,0.2)] backdrop-blur-md">
          <div className="absolute inset-0 rounded-[14px] bg-brand-500/20 blur-md" />
          <Sparkles className="relative size-6 text-brand-400 stroke-[1.5] drop-shadow-[0_0_8px_rgba(75,68,232,0.8)]" />
        </div>
      </div>
      
      {/* CAMADA 6: Bloco de texto */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-0" />
      <div className="absolute inset-x-0 bottom-0 px-3 pb-[10px] pt-6 flex flex-col justify-end pointer-events-none z-10">
        <p className="font-bold text-white text-sm drop-shadow-md truncate">Geração Automática</p>
        <p className="text-[10px] text-white/70 font-medium truncate mt-0.5 drop-shadow-sm leading-tight">Deixe a IA escolher</p>
      </div>

      {isSelected && (
        <>
          <div className="absolute inset-0 border-2 border-brand-500 rounded-[20px] pointer-events-none z-20" />
          <div className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-brand-500 text-white shadow-sm pointer-events-none z-20">
            <Check className="size-3" />
          </div>
        </>
      )}
    </button>
  );
}

function CardEnviarImagem({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const isSelected = value === "Enviar Imagem";
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (file: File | undefined | null) => {
    if (!file) return;
    
    const validTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato inválido", { description: "Por favor, envie apenas imagens PNG, JPG ou WEBP." });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande", { description: "A imagem deve ter no máximo 5 MB." });
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    
    const url = URL.createObjectURL(file);
    setPreview(url);
    setFileName(file.name);
    onChange("Enviar Imagem");
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };
  
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <button
      type="button"
      aria-label="Enviar Imagem"
      onClick={() => preview ? onChange("Enviar Imagem") : inputRef.current?.click()}
      onDragOver={!preview ? onDragOver : undefined}
      onDragLeave={!preview ? onDragLeave : undefined}
      onDrop={!preview ? onDrop : undefined}
      className={cn(
        "group relative overflow-hidden rounded-[20px] text-left transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-brand-500 aspect-[4/5] bg-surface-2",
        preview 
          ? (isSelected 
              ? "ring-2 ring-inset ring-brand-500 shadow-[0_0_24px_-4px_rgba(75,68,232,0.4)]" 
              : "ring-1 ring-inset ring-white/10 hover:ring-white/20 hover:-translate-y-1 hover:shadow-[0_12px_30px_-10px_rgba(75,68,232,0.3)]")
          : (isDragging 
              ? "border-2 border-brand-500 bg-brand-500/10 hover:-translate-y-1 hover:shadow-[0_12px_30px_-10px_rgba(75,68,232,0.4)]" 
              : "border-2 border-dashed border-white/20 hover:border-white/30 hover:-translate-y-1 hover:shadow-[0_12px_30px_-10px_rgba(75,68,232,0.3)]")
      )}
    >
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {preview ? (
        <>
          <img src={preview} alt="Upload preview" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
          
          <div className="absolute left-3 right-3 bottom-3 pointer-events-none z-10">
            <p className="font-bold text-white text-sm drop-shadow-md truncate">{fileName}</p>
          </div>
          
          <button 
            type="button" 
            onClick={handleRemove} 
            className="absolute left-2 top-2 grid size-6 place-items-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 z-20"
            aria-label="Remover imagem"
          >
            <X className="size-3" />
          </button>
          
          {isSelected && (
            <>
              <div className="absolute inset-0 border-2 border-brand-500 rounded-[20px] pointer-events-none z-20" />
              <div className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-brand-500 text-white shadow-sm pointer-events-none z-20">
                <Check className="size-3" />
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {/* CAMADA 1: Orbes */}
          <div className={cn(
            "absolute -top-12 -right-12 size-32 rounded-full blur-3xl transition-all duration-300",
            isDragging ? "bg-brand-500/60 opacity-100" : "bg-brand-500/40 opacity-40 group-hover:opacity-70"
          )} />
          <div className={cn(
            "absolute -bottom-12 -left-12 size-32 rounded-full blur-3xl transition-all duration-300",
            isDragging ? "bg-brand-500/50 opacity-100" : "bg-blue-500/30 opacity-30 group-hover:opacity-60"
          )} />
          
          <div className={cn(
            "absolute inset-0 transition-opacity duration-300 pointer-events-none mix-blend-overlay",
            isDragging ? "bg-brand-500/20 opacity-100" : "opacity-0"
          )} />

          {/* CAMADA 2: Face de vidro */}
          <div className="absolute inset-0 backdrop-blur-xl bg-white/[0.02] saturate-150 mix-blend-overlay pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

          {/* CAMADA 3: Reflexo especular superior */}
          <div className="absolute top-[1px] inset-x-3 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-60" />

          {/* CAMADA 5: Seta marca d'água */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden pb-4">
             <Upload className="size-16 text-white/[0.04] transition-transform duration-700 ease-out group-hover:-translate-y-4" strokeWidth={1.5} />
          </div>

          {/* CAMADA 4: Ícone no squircle (Centralizado) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 pb-4">
            <div className="relative size-12 rounded-[14px] bg-white/5 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_4px_rgba(255,255,255,0.2)] backdrop-blur-md transition-colors duration-300">
              <div className={cn(
                "absolute inset-0 rounded-[14px] blur-md transition-all duration-300",
                isDragging ? "bg-brand-500/40" : "bg-brand-500/20"
              )} />
              <Upload className="relative size-6 text-brand-400 stroke-[1.5] drop-shadow-[0_0_8px_rgba(75,68,232,0.8)]" />
            </div>
          </div>
          
          {/* CAMADA 6: Bloco de texto */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-0" />
          <div className="absolute inset-x-0 bottom-0 px-3 pb-[10px] pt-6 flex flex-col justify-end pointer-events-none z-10">
            <p className="font-bold text-white text-sm drop-shadow-md truncate">Enviar Imagem</p>
            <p className="text-[10px] text-white/70 font-medium truncate mt-0.5 drop-shadow-sm leading-tight">PNG, JPG ou WEBP &middot; até 5 MB</p>
          </div>
        </>
      )}
    </button>
  );
}

export function TabEstilo({ form }: { form: UseFormReturn<AvatarFormValues> }) {
  const generoVal = form.watch("genero");
  const isMasculino = generoVal === "Masculino";

  const dynamicRoupaOptions = [
    { name: "Casual", image: isMasculino ? "/casual-masc.png" : "/casual-fem.png" },
    { name: "Luxo", image: isMasculino ? "/luxo-masc.png" : "/luxo-fem.png" },
    { name: "Streetwear", image: isMasculino ? "/streetwear-masc.png" : "/streetwear-fem.png" },
    { name: "Fitness", image: isMasculino ? "/fitness-masc.png" : "/fitness-fem.png" },
    { name: "Corporativo", image: isMasculino ? "/corporativo-masc.png" : "/corporativo-fem.png" }
  ];

  const estiloSelecionado = form.watch("roupa");
  const detalhesVal = form.watch("detalhesRoupa") || "";
  const maxDetalhesLength = 120;
  const sugestoes = estiloSelecionado ? roupaSugestoes[estiloSelecionado] : undefined;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormField
        control={form.control}
        name="roupa"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Roupa / Estética</FormLabel>
            <FormControl>
              <ImageOptionSelector
                options={dynamicRoupaOptions}
                value={field.value}
                onChange={field.onChange}
              >
                <CardGeracaoAutomatica value={field.value} onChange={field.onChange} />
                <CardEnviarImagem value={field.value} onChange={field.onChange} />
              </ImageOptionSelector>
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="detalhesRoupa"
        render={({ field }) => (
          <FormItem>
            <div className="flex justify-between items-end mb-2">
              <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-0 block">Detalhes da Roupa (Opcional)</FormLabel>
              <span className="text-[10px] text-text-3 font-medium">
                {detalhesVal.length}/{maxDetalhesLength}
              </span>
            </div>
            <FormControl>
              <div className="relative group">
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-text-3 group-focus-within:text-brand-500 transition-colors" />
                <Input
                  placeholder="Ex.: blazer preto minimalista"
                  className="bg-surface-2 border-white/10 text-white h-14 rounded-xl pl-12 focus-visible:ring-brand-500 focus-visible:border-brand-500 transition-all"
                  maxLength={maxDetalhesLength}
                  {...field}
                  value={field.value || ""}
                />
              </div>
            </FormControl>
            <AnimatePresence mode="popLayout">
              {sugestoes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 overflow-hidden"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-3 mb-2 ml-1">Inspire-se</p>
                  <div className="flex flex-wrap gap-2">
                    {sugestoes.map((sugestao, idx) => {
                      const isSelected = detalhesVal.trim() === sugestao;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => form.setValue("detalhesRoupa", sugestao, { shouldValidate: true, shouldDirty: true })}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                            isSelected
                              ? "bg-brand-500/20 text-brand-400 border border-brand-500/50"
                              : "bg-surface-2 text-text-3 border border-white/5 hover:bg-surface-3 hover:text-text-2"
                          )}
                        >
                          {sugestao}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <FormMessage />
          </FormItem>
        )}
      />


    </div>
  );
}
