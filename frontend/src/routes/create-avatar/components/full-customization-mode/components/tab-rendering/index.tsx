import { Sparkles, PenLine } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Textarea } from "@/components";
import type { AvatarFormValues } from "../../index";
import {
  etniaOptions, expressaoOptions, pelosFaciaisOptions,
  corOlhosOptions, tomPeleOptions, corCabeloNaturaisOptions, corCabeloFantasiaOptions
} from "../../data";
import { cn } from "@/utils/utils";
import { AnimatePresence, motion } from "framer-motion";

const SUGESTOES_EXTRAS = [
  "Luz suave de estúdio",
  "Óculos escuros",
  "Sorriso leve",
  "Fundo desfocado",
  "Iluminação dramática"
];

export function TabRenderizacao({ form }: { form: UseFormReturn<AvatarFormValues> }) {
  const values = form.watch();
  const detalhesVal = values.detalhesExtras || "";
  const maxDetalhesLength = 150;
  const isMasculino = values.genero === "Masculino";

  const getRostoImg = (v: string) => {
    const map: any = { "Oval": "oval", "Redondo": "redondo", "Quadrado": "quadrado", "Coração": "coracao", "Alongado": "alongado" };
    return `/${map[v]}-${isMasculino ? "masc" : "fem"}.png`;
  };
  const getCorpoImg = (v: string) => {
    const map: any = { "Magro(a)": "magro", "Atlético(a)": "atletico", "Curvy": "curvy", "Plus Size": "plus-size" };
    return `/${map[v]}-${isMasculino ? "masculino" : "feminino"}.png`;
  };
  const getCabeloImg = (v: string) => {
    const map: any = { "Curto": "curto", "Médio": "medio", "Longo": "longo", "Careca": "careca", "Afro": "afro", "Cacheado": "cacheado" };
    return `/cabelo-${map[v]}-${isMasculino ? "masc" : "fem"}.png`;
  };
  const getRoupaImg = (v: string) => {
    const map: any = { "Casual": "casual", "Luxo": "luxo", "Streetwear": "streetwear", "Fitness": "fitness", "Corporativo": "corporativo" };
    return `/${map[v]}-${isMasculino ? "masc" : "fem"}.png`;
  };

  const renderSummaryPill = (key: string, val: any) => {
    if (!val || key === "nome" || key === "detalhesRoupa" || key === "detalhesExtras") return null;

    let type = "text";
    let image = "";
    let color = "";
    let label = key;
    let displayVal = String(val);

    switch (key) {
      case "genero": label = "Gênero"; break;
      case "idade": label = "Idade"; displayVal = `${val} anos`; break;
      case "altura": label = "Altura"; displayVal = `${val} cm`; break;
      case "formatoRosto": label = "Rosto"; type = "image"; image = getRostoImg(val); break;
      case "tipoFisico": label = "Corpo"; type = "image"; image = getCorpoImg(val); break;
      case "estiloCabelo": label = "Cabelo"; type = "image"; image = getCabeloImg(val); break;
      case "roupa": label = "Estilo"; type = "image"; image = getRoupaImg(val); break;
      case "etnia": label = "Etnia"; type = "image"; image = etniaOptions.find(o => o.name === val)?.image || ""; break;
      case "expressao": label = "Expressão"; type = "image"; image = expressaoOptions.find(o => o.name === val)?.image || ""; break;
      case "pelosFaciais": label = "Pelos"; type = "image"; image = pelosFaciaisOptions.find(o => o.name === val)?.image || ""; break;
      case "corOlhos": label = "Olhos"; type = "image"; image = corOlhosOptions.find(o => o.name === val || o.label === val)?.image || ""; break;
      case "tomPele": label = "Pele"; type = "color"; color = tomPeleOptions.find(o => o.name === val)?.color || ""; break;
      case "corCabelo":
        label = "Cor cabelo";
        type = "color";
        color = [...corCabeloNaturaisOptions, ...corCabeloFantasiaOptions].find(o => o.name === val || o.label === val)?.color || "";
        break;
    }

    return (
      <div key={key} className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-surface-2 pr-3 pl-1 py-1 shadow-sm">
        {type === "image" && image && (
          <img src={image} alt={displayVal} className="size-6 rounded-full object-cover shrink-0 bg-surface-3" />
        )}
        {type === "color" && color && (
          <div className="size-6 rounded-full border border-white/10 shrink-0 shadow-inner" style={{ backgroundColor: color }} />
        )}
        {type === "text" && (
          <div className="size-2 shrink-0 rounded-full bg-brand-500/50 ml-2" />
        )}
        <span className="text-xs font-medium text-white whitespace-nowrap">
          <span className="text-text-3 mr-1">{label} ·</span>
          {displayVal}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormField
        control={form.control}
        name="detalhesExtras"
        render={({ field }) => (
          <FormItem>
            <div className="flex justify-between items-end mb-2">
              <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-0 block">Detalhes Extras (Opcional)</FormLabel>
              <span className="text-[10px] text-text-3 font-medium">
                {detalhesVal.length}/{maxDetalhesLength}
              </span>
            </div>
            <FormControl>
              <div className="relative group">
                <PenLine className="absolute left-4 top-4 size-5 text-text-3 group-focus-within:text-brand-500 transition-colors" />
                <Textarea
                  placeholder="Expressão, acessórios, iluminação..."
                  className="bg-surface-2 border-white/10 text-white rounded-xl min-h-[100px] resize-none pl-12 pt-4 focus-visible:ring-brand-500 focus-visible:border-brand-500 transition-all"
                  maxLength={maxDetalhesLength}
                  {...field}
                  value={field.value || ""}
                />
              </div>
            </FormControl>
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-3 mb-2 ml-1">Inspire-se</p>
              <div className="flex flex-wrap gap-2">
                {SUGESTOES_EXTRAS.map((sugestao, idx) => {
                  const isSelected = detalhesVal.trim() === sugestao;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => form.setValue("detalhesExtras", sugestao, { shouldValidate: true, shouldDirty: true })}
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
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="glass-surface p-6 rounded-[24px]">
        <h3 className="text-sm font-semibold text-text-1 mb-4 flex items-center gap-2">
          <Sparkles className="size-4 text-brand-400" /> Resumo do Avatar
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {Object.entries(values).map(([key, val]) => renderSummaryPill(key, val))}
        </div>
      </div>
    </div>
  );
}
