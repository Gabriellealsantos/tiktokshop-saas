import { useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Check, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

import { cn } from "@/utils/utils";
import { Button, Input, Textarea, Slider, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, OptionImageCard } from "@/components";

import { useGenerateAvatar } from "../../api/use-generate-avatar";
import { PreviewPanel } from "../preview-panel";

export const avatarSchema = z.object({
  nome: z.string().min(1, "O nome do avatar é obrigatório."),
  genero: z.enum(["Feminino", "Masculino", "Andrógino", "Não-binário"], { required_error: "Selecione o gênero." }),
  idade: z.number().min(18).max(65),
  etnia: z.enum(["Latino/Latina", "Caucasiana", "Negra", "Asiática", "Árabe", "Indígena", "Mestiça"], { required_error: "Selecione a etnia." }),
  tomPele: z.enum(["Muito Clara", "Clara", "Média", "Escura", "Muito Escura"], { required_error: "Selecione o tom de pele." }),
  tipoFisico: z.enum(["Magro(a)", "Atlético(a)", "Curvy", "Plus Size"], { required_error: "Selecione o tipo físico." }),
  altura: z.number().min(150).max(200),
  formatoRosto: z.enum(["Oval", "Redondo", "Quadrado", "Coração", "Alongado"], { required_error: "Selecione o formato do rosto." }),
  corOlhos: z.enum(["Castanho", "Preto", "Azul", "Verde", "Mel", "Cinza"], { required_error: "Selecione a cor dos olhos." }),
  expressao: z.enum(["Neutra", "Sorrindo", "Séria", "Confiante", "Sensual"], { required_error: "Selecione a expressão." }),
  pelosFaciais: z.enum(["Nenhum", "Barba curta", "Barba cheia", "Bigode", "Cavanhaque"], { required_error: "Selecione a opção de pelos." }),
  estiloCabelo: z.enum(["Curto", "Médio", "Longo", "Careca", "Afro", "Cacheado"], { required_error: "Selecione o estilo de cabelo." }),
  corCabelo: z.enum(["Preto", "Castanho", "Loiro", "Ruivo", "Grisalho", "Rosa"], { required_error: "Selecione a cor de cabelo." }),
  roupa: z.enum(["Casual", "Luxo", "Streetwear", "Fitness", "Corporativo"], { required_error: "Selecione a roupa." }),
  detalhesRoupa: z.string().optional(),
  cenario: z.enum(["Academia", "Ar livre", "Banheiro", "Cozinha", "Escritório", "Estúdio", "Loja", "Natureza", "Quarto"], { required_error: "Selecione o cenário." }),
  tipoFoto: z.enum(["Selfie / Rosto", "Meio Corpo", "Corpo Inteiro", "Perfil / Lateral", "De Costas"], { required_error: "Selecione o tipo de foto." }),
  detalhesExtras: z.string().optional()
});

export type AvatarFormValues = z.infer<typeof avatarSchema>;

const TABS = [
  { id: 1, label: "Identidade" },
  { id: 2, label: "Corpo" },
  { id: 3, label: "Rosto" },
  { id: 4, label: "Cabelo" },
  { id: 5, label: "Estilo" },
  { id: 6, label: "Renderização" },
];

export function FullCustomizationMode() {
  const [activeTab, setActiveTab] = useState(1);
  const generateAvatar = useGenerateAvatar();

  const form = useForm<AvatarFormValues>({
    resolver: zodResolver(avatarSchema),
    defaultValues: {
      nome: "",
      genero: "Feminino",
      idade: 28,
      etnia: "Latino/Latina",
      tomPele: "Média",
      tipoFisico: "Magro(a)",
      altura: 170,
      formatoRosto: "Oval",
      corOlhos: "Castanho",
      expressao: "Neutra",
      pelosFaciais: "Nenhum",
      estiloCabelo: "Longo",
      corCabelo: "Preto",
      roupa: "Casual",
      detalhesRoupa: "",
      cenario: "Estúdio",
      tipoFoto: "Meio Corpo",
      detalhesExtras: "",
    },
    mode: "onChange",
  });

  // Watch key values for preview
  const nome = form.watch("nome");
  const genero = form.watch("genero");
  const idade = form.watch("idade");
  const etnia = form.watch("etnia");

  const metadata = `${genero} · ${idade} anos · ${etnia}`;

  const handleNext = () => {
    if (activeTab < 6) setActiveTab((prev) => prev + 1);
    else {
      // SUBMIT
      form.handleSubmit((data) => {
        generateAvatar.mutate(data);
      })();
    }
  };

  const handlePrev = () => {
    if (activeTab > 1) setActiveTab((prev) => prev - 1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] xl:grid-cols-[1fr_400px] gap-8 items-start">
      {/* ESQUERDA: FORMULÁRIO */}
      <div className="flex flex-col gap-6 w-full">
        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "btn-brand shadow-[0_0_20px_-4px_rgba(75,68,232,0.4)]"
                    : "bg-surface-2 text-text-2 border border-white/5 hover:border-white/10 hover:text-white"
                )}
              >
                {tab.id}. {tab.label}
              </button>
            );
          })}
        </div>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="relative overflow-hidden min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-8 w-full"
              >
                {activeTab === 1 && <TabIdentidade form={form} />}
                {activeTab === 2 && <TabCorpo form={form} />}
                {activeTab === 3 && <TabRosto form={form} />}
                {activeTab === 4 && <TabCabelo form={form} />}
                {activeTab === 5 && <TabEstilo form={form} />}
                {activeTab === 6 && <TabRenderizacao form={form} />}
              </motion.div>
            </AnimatePresence>
          </form>
        </Form>

        {/* RODAPÉ DAS TABS */}
        <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-4">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={activeTab === 1}
            className="text-text-2 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="size-4 mr-1" /> Anterior
          </Button>

          <Button
            onClick={handleNext}
            disabled={generateAvatar.isPending}
            className={cn(
              activeTab === 6 ? "bg-brand-500 hover:bg-brand-600 text-white shadow-[0_0_24px_-6px_rgba(75,68,232,0.5)]" : ""
            )}
          >
            {activeTab === 6 ? (
              <>
                <Sparkles className="size-4 mr-2" />
                Gerar avatar com IA
              </>
            ) : (
              <>
                Próximo <ChevronRight className="size-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* DIREITA: PRÉ-VISUALIZAÇÃO STICKY */}
      <PreviewPanel
        nome={nome}
        metadata={metadata}
        isGenerating={generateAvatar.isPending}
        generatedImage={generateAvatar.data || null}
      />
    </div>
  );
}

// ==========================================
// SELETORES AUXILIARES (Pill, Swatch, Grid)
// ==========================================

function PillSelector({ options, value, onChange }: { options: string[], value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              isSelected
                ? "bg-brand-500/15 border border-brand-500 text-brand-300 shadow-[0_0_20px_-4px_rgba(75,68,232,0.3)] pr-8"
                : "bg-surface-2 border border-white/5 text-text-2 hover:border-white/15 hover:text-white"
            )}
          >
            {opt}
            {isSelected && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 grid size-4 place-items-center rounded-full bg-brand-500 text-white">
                <Check className="size-2.5" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ColorSwatchCard({ name, color, isSelected, onClick }: { name: string, color: string, isSelected: boolean, onClick: () => void }) {
  return (
    <button
      type="button"
      title={name}
      onClick={onClick}
      className={cn(
        "size-[76px] rounded-2xl transition-all duration-300 relative outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0",
        isSelected
          ? "ring-2 ring-brand-500 shadow-[0_0_20px_-4px_rgba(75,68,232,0.5)] scale-105"
          : "ring-1 ring-white/10 hover:ring-white/30 hover:scale-105"
      )}
      style={{ backgroundColor: color }}
    >
      {isSelected && (
        <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-brand-500 text-white shadow-sm ring-2 ring-surface-1">
          <Check className="size-3.5" />
        </span>
      )}
    </button>
  );
}

function ColorSwatchSelector({ options, value, onChange }: { options: { name: string, color: string }[], value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-4">
      {options.map((opt) => (
        <ColorSwatchCard
          key={opt.name}
          name={opt.name}
          color={opt.color}
          isSelected={value === opt.name}
          onClick={() => onChange(opt.name)}
        />
      ))}
    </div>
  );
}

function ImageOptionCard({ name, image, color, isSelected, onClick }: { name: string, image?: string, color?: string, isSelected: boolean, onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-[20px] aspect-[4/5] text-left transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        isSelected
          ? "ring-2 ring-brand-500 shadow-[0_0_24px_-4px_rgba(75,68,232,0.4)]"
          : "ring-1 ring-white/10 hover:ring-white/20 hover:-translate-y-1 hover:shadow-lg bg-surface-2"
      )}
    >
      {image ? (
        <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0 w-full h-full" style={{ background: color || 'var(--surface-3)' }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="font-bold text-white text-sm drop-shadow-md truncate">{name}</p>
      </div>
      {isSelected && (
        <>
          <div className="absolute inset-0 border-2 border-brand-500 rounded-[20px] pointer-events-none" />
          <div className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-brand-500 text-white shadow-sm">
            <Check className="size-3" />
          </div>
        </>
      )}
    </button>
  );
}

function ImageOptionSelector({
  options,
  value,
  onChange,
  columns = 4
}: {
  options: { name: string, image?: string, color?: string }[],
  value: string,
  onChange: (v: string) => void,
  columns?: 3 | 4 | 5
}) {
  const colClass = columns === 3 ? "sm:grid-cols-3" : columns === 5 ? "sm:grid-cols-5" : "sm:grid-cols-4";

  return (
    <div className={cn("grid gap-3 grid-cols-2", colClass)}>
      {options.map((opt) => (
        <ImageOptionCard
          key={opt.name}
          name={opt.name}
          image={opt.image}
          color={opt.color}
          isSelected={value === opt.name}
          onClick={() => onChange(opt.name)}
        />
      ))}
    </div>
  );
}

// ==========================================
// TABS COMPONENTS
// ==========================================

function TabIdentidade({ form }: { form: UseFormReturn<AvatarFormValues> }) {
  const idadeVal = form.watch("idade");

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
        name="genero"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Gênero</FormLabel>
            <FormControl>
              <ImageOptionSelector
                options={[
                  { name: "Feminino", image: "/placeholder-genero-feminino.jpg" },
                  { name: "Masculino", image: "/placeholder-genero-masculino.jpg" },
                  { name: "Andrógino", image: "/placeholder-genero-androgino.jpg" },
                  { name: "Não-binário", image: "/placeholder-genero-naobinario.jpg" }
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="idade"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider flex justify-between">
              <span>Idade</span>
              <span className="text-brand-300">{idadeVal} ANOS</span>
            </FormLabel>
            <FormControl>
              <Slider
                min={18}
                max={65}
                step={1}
                value={[field.value]}
                onValueChange={(val) => field.onChange(val[0])}
                className="py-2"
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="etnia"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Etnia / Origem</FormLabel>
            <FormControl>
              <ImageOptionSelector
                columns={4}
                options={[
                  { name: "Latino/Latina", image: "/placeholder-etnia-latino.jpg" },
                  { name: "Caucasiana", image: "/placeholder-etnia-caucasiana.jpg" },
                  { name: "Negra", image: "/placeholder-etnia-negra.jpg" },
                  { name: "Asiática", image: "/placeholder-etnia-asiatica.jpg" },
                  { name: "Árabe", image: "/placeholder-etnia-arabe.jpg" },
                  { name: "Indígena", image: "/placeholder-etnia-indigena.jpg" },
                  { name: "Mestiça", image: "/placeholder-etnia-mestica.jpg" },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tomPele"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Tom de Pele</FormLabel>
            <FormControl>
              <ColorSwatchSelector
                options={[
                  { name: "Muito Clara", color: "#FDE9D6" },
                  { name: "Clara", color: "#F3CDA6" },
                  { name: "Média", color: "#D19C71" },
                  { name: "Escura", color: "#8E5531" },
                  { name: "Muito Escura", color: "#472816" },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}

function TabCorpo({ form }: { form: UseFormReturn<AvatarFormValues> }) {
  const alturaVal = form.watch("altura");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormField
        control={form.control}
        name="tipoFisico"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Tipo Físico</FormLabel>
            <FormControl>
              <ImageOptionSelector
                options={[
                  { name: "Magro(a)", image: "/placeholder-body-magro.jpg" },
                  { name: "Atlético(a)", image: "/placeholder-body-atletico.jpg" },
                  { name: "Curvy", image: "/placeholder-body-curvy.jpg" },
                  { name: "Plus Size", image: "/placeholder-body-plus.jpg" },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="altura"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider flex justify-between">
              <span>Altura</span>
              <span className="text-brand-300">{alturaVal} cm</span>
            </FormLabel>
            <FormControl>
              <Slider
                min={150}
                max={200}
                step={1}
                value={[field.value]}
                onValueChange={(val) => field.onChange(val[0])}
                className="py-2"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}

function TabRosto({ form }: { form: UseFormReturn<AvatarFormValues> }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormField
        control={form.control}
        name="formatoRosto"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Formato do Rosto</FormLabel>
            <FormControl>
              <ImageOptionSelector
                options={[
                  { name: "Oval", image: "/placeholder-rosto-oval.jpg" },
                  { name: "Redondo", image: "/placeholder-rosto-redondo.jpg" },
                  { name: "Quadrado", image: "/placeholder-rosto-quadrado.jpg" },
                  { name: "Coração", image: "/placeholder-rosto-coracao.jpg" },
                  { name: "Alongado", image: "/placeholder-rosto-alongado.jpg" }
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="corOlhos"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Cor dos Olhos</FormLabel>
            <FormControl>
              <ColorSwatchSelector
                options={[
                  { name: "Castanho", color: "#613813" },
                  { name: "Preto", color: "#1A1A1A" },
                  { name: "Azul", color: "#4B94C9" },
                  { name: "Verde", color: "#5F8C44" },
                  { name: "Mel", color: "#C68E33" },
                  { name: "Cinza", color: "#959D9E" },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="expressao"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Expressão</FormLabel>
            <FormControl>
              <ImageOptionSelector
                options={[
                  { name: "Neutra", image: "/placeholder-expressao-neutra.jpg" },
                  { name: "Sorrindo", image: "/placeholder-expressao-sorrindo.jpg" },
                  { name: "Séria", image: "/placeholder-expressao-seria.jpg" },
                  { name: "Confiante", image: "/placeholder-expressao-confiante.jpg" },
                  { name: "Sensual", image: "/placeholder-expressao-sensual.jpg" }
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="pelosFaciais"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Pelos Faciais</FormLabel>
            <FormControl>
              <PillSelector
                options={["Nenhum", "Barba curta", "Barba cheia", "Bigode", "Cavanhaque"]}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}

function TabCabelo({ form }: { form: UseFormReturn<AvatarFormValues> }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormField
        control={form.control}
        name="estiloCabelo"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Estilo de Cabelo</FormLabel>
            <FormControl>
              <ImageOptionSelector
                options={[
                  { name: "Curto", image: "/placeholder-cabelo-curto.jpg" },
                  { name: "Médio", image: "/placeholder-cabelo-medio.jpg" },
                  { name: "Longo", image: "/placeholder-cabelo-longo.jpg" },
                  { name: "Careca", image: "/placeholder-cabelo-careca.jpg" },
                  { name: "Afro", image: "/placeholder-cabelo-afro.jpg" },
                  { name: "Cacheado", image: "/placeholder-cabelo-cacheado.jpg" }
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="corCabelo"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Cor do Cabelo</FormLabel>
            <FormControl>
              <ColorSwatchSelector
                options={[
                  { name: "Preto", color: "#111111" },
                  { name: "Castanho", color: "#4A2F1D" },
                  { name: "Loiro", color: "#DAB575" },
                  { name: "Ruivo", color: "#A8361B" },
                  { name: "Grisalho", color: "#B8B8B8" },
                  { name: "Rosa", color: "#F082AD" },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}

function TabEstilo({ form }: { form: UseFormReturn<AvatarFormValues> }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormField
        control={form.control}
        name="roupa"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Roupa / Estética</FormLabel>
            <FormControl>
              <PillSelector
                options={["Casual", "Luxo", "Streetwear", "Fitness", "Corporativo"]}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="detalhesRoupa"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider">Detalhes da Roupa (Opcional)</FormLabel>
            <FormControl>
              <Input placeholder="Ex.: blazer preto minimalista" className="bg-surface-2 border-white/10 text-white h-12 rounded-xl" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cenario"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Cenário de Fundo</FormLabel>
            <FormControl>
              <ImageOptionSelector
                columns={3}
                options={[
                  { name: "Academia", image: "/placeholder-cenario-academia.jpg" },
                  { name: "Ar livre", image: "/placeholder-cenario-parque.jpg" },
                  { name: "Banheiro", image: "/placeholder-cenario-banheiro.jpg" },
                  { name: "Cozinha", image: "/placeholder-cenario-cozinha.jpg" },
                  { name: "Escritório", image: "/placeholder-cenario-office.jpg" },
                  { name: "Estúdio", image: "/placeholder-cenario-estudio.jpg" },
                  { name: "Loja", image: "/placeholder-cenario-loja.jpg" },
                  { name: "Natureza", image: "/placeholder-cenario-natureza.jpg" },
                  { name: "Quarto", image: "/placeholder-cenario-quarto.jpg" },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}

function TabRenderizacao({ form }: { form: UseFormReturn<AvatarFormValues> }) {
  const values = form.getValues();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormField
        control={form.control}
        name="tipoFoto"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Tipo de Foto / Câmera</FormLabel>
            <FormControl>
              <ImageOptionSelector
                columns={3}
                options={[
                  { name: "Selfie / Rosto", color: "linear-gradient(135deg, rgba(75,68,232,0.1) 0%, rgba(75,68,232,0.2) 100%)" },
                  { name: "Meio Corpo", color: "linear-gradient(135deg, rgba(75,68,232,0.1) 0%, rgba(75,68,232,0.2) 100%)" },
                  { name: "Corpo Inteiro", color: "linear-gradient(135deg, rgba(75,68,232,0.1) 0%, rgba(75,68,232,0.2) 100%)" },
                  { name: "Perfil / Lateral", color: "linear-gradient(135deg, rgba(75,68,232,0.1) 0%, rgba(75,68,232,0.2) 100%)" },
                  { name: "De Costas", color: "linear-gradient(135deg, rgba(75,68,232,0.1) 0%, rgba(75,68,232,0.2) 100%)" },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="detalhesExtras"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider">Detalhes Extras (Opcional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Expressão, acessórios, luz..."
                className="bg-surface-2 border-white/10 text-white rounded-xl min-h-[100px] resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="glass-surface p-6 rounded-[24px]">
        <h3 className="text-sm font-semibold text-text-1 mb-4 flex items-center gap-2">
          <Sparkles className="size-4 text-brand-400" /> Resumo do Avatar
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(values).map(([key, val]) => {
            if (!val || key === "nome" || key === "detalhesRoupa" || key === "detalhesExtras") return null;
            return (
              <span key={key} className="inline-flex items-center rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-300">
                {String(val)}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
