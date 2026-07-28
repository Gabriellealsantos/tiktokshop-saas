import { Sparkles, PenLine } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Textarea } from "@/components";
import type { AvatarFormValues } from "../../index";
import {
  etniaOptions, expressaoOptions, pelosFaciaisOptions,
  bocaOptions, sobrancelhaOptions, narizOptions, estiloCabeloOptions,
  corOlhosOptions, tomPeleOptions, corCabeloOptions
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
    return `/${map[v]}.jpeg`;
  };
  const getCorpoImg = (v: string) => {
    const map: any = { "Magro(a)": "magro", "Atlético(a)": "atletico", "Curvy": "curvy", "Plus Size": "plus-size" };
    return `/${map[v]}-${isMasculino ? "masculino" : "feminino"}.png`;
  };

  const getRoupaImg = (v: string) => {
    const map: any = { "Casual": "casual", "Luxo": "luxo", "Streetwear": "streetwear", "Fitness": "fitness", "Corporativo": "corporativo" };
    return `/${map[v]}-${isMasculino ? "masc.jpeg" : "fem.png"}`;
  };

  const renderSummaryPill = (key: string, val: any) => {
    if (!val || key === "nome" || key === "detalhesRoupa" || key === "detalhesExtras") return null;

    let type = "text";
    let image = "";
    let label = key;
    let displayVal = String(val);

    switch (key) {
      case "genero": label = "Gênero"; break;
      case "idade": label = "Idade"; displayVal = `${val} anos`; break;
      case "altura": label = "Altura"; displayVal = `${val} cm`; break;
      case "formatoRosto": label = "Rosto"; type = "image"; image = getRostoImg(val); break;
      case "tipoFisico": label = "Corpo"; type = "image"; image = getCorpoImg(val); break;
      case "estiloCabelo": label = "Cabelo"; type = "image"; image = estiloCabeloOptions.find(o => o.name === val)?.image || ""; break;
      case "roupa": label = "Estilo"; type = "image"; image = getRoupaImg(val); break;
      case "etnia": label = "Etnia"; type = "image"; image = etniaOptions.find(o => o.name === val)?.image || ""; break;
      case "expressao": label = "Expressão"; type = "image"; image = expressaoOptions.find(o => o.name === val)?.image || ""; break;
      case "pelosFaciais": label = "Pelos"; type = "image"; image = pelosFaciaisOptions.find(o => o.name === val)?.image || ""; break;
      case "boca": label = "Boca"; type = "image"; image = bocaOptions.find(o => o.name === val || o.label === val)?.image || ""; break;
      case "sobrancelha": label = "Sobrancelha"; type = "image"; image = sobrancelhaOptions.find(o => o.name === val)?.image || ""; break;
      case "nariz": label = "Nariz"; type = "image"; image = narizOptions.find(o => o.name === val || o.label === val)?.image || ""; break;
      case "corOlhos": label = "Olhos"; type = "image"; image = corOlhosOptions.find(o => o.name === val || o.label === val)?.image || ""; break;
      case "tomPele": label = "Pele"; type = "image"; image = tomPeleOptions.find(o => o.name === val)?.image || ""; break;
      case "corCabelo": {
        label = "Cor cabelo";
        type = "image";
        const baseImg = corCabeloOptions.find((o) => o.name === val)?.image || "";
        image = (isMasculino || values.genero === "Andrógino" || values.genero === "Não-binário") && baseImg
          ? baseImg.replace(".png", "-masc.png")
          : baseImg;
        break;
      }
    }

    return (
      <div key={key} className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-surface-2 pr-3 pl-1 py-1 shadow-sm">
        {type === "image" && image && (
          <img src={image} alt={displayVal} className="size-6 rounded-full object-cover shrink-0 bg-surface-3" />
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
                <Textarea
                  placeholder="Expressão, acessórios, iluminação..."
                  className="glass-container text-white rounded-xl min-h-[100px] resize-none pl-12 pt-4 focus-visible:ring-brand-500 focus-visible:border-brand-500 transition-all"
                  maxLength={maxDetalhesLength}
                  {...field}
                  value={field.value || ""}
                />
                <PenLine className="absolute left-4 top-4 size-5 text-text-3 group-focus-within:text-brand-500 transition-colors pointer-events-none z-10" />
              </div>
            </FormControl>
            <div className="mt-4 glass-container p-4.5 rounded-[20px]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-3 mb-2.5 ml-1">Inspire-se</p>
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
                          ? "bg-brand-500/20 backdrop-blur-md text-brand-400 border border-brand-500/50 shadow-[0_0_12px_rgba(75,68,232,0.3)]"
                          : "bg-white/[0.06] backdrop-blur-md text-text-2 border border-white/15 hover:bg-white/[0.12] hover:text-white shadow-sm"
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

      <div className="glass-container p-6 rounded-[24px]">
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
