import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/utils/utils";
import { Button, Form } from "@/components";

import { useGenerateAvatar } from "../../api/use-generate-avatar";
import { PreviewPanel } from "../preview-panel";

import { TABS } from "./data";
import { TabIdentidade } from "./components/tab-identity";
import { TabCorpo } from "./components/tab-body";
import { TabRosto } from "./components/tab-face";
import { TabCabelo } from "./components/tab-hair";
import { TabEstilo } from "./components/tab-style";
import { TabRenderizacao } from "./components/tab-rendering";

import { buildAvatarConfig } from "@/models/avatar";
import { useSaveAvatar } from "../../api/use-save-avatar";
import { useAvatarUsage } from "../../api/use-avatars";
import { toast } from "sonner";

export const avatarSchema = z.object({
  nome: z.string().min(1, "O nome do avatar é obrigatório."),
  genero: z.enum(["Feminino", "Masculino", "Andrógino", "Não-binário"], {
    required_error: "Selecione o gênero.",
  }),
  idade: z.number().min(18).max(65),
  etnia: z.enum(
    [
      "Latino/Latina",
      "Caucasiana",
      "Negra",
      "Asiática",
      "Árabe",
      "Indígena",
      "Mestiça",
    ],
    { required_error: "Selecione a etnia." },
  ),
  tomPele: z.enum(
    [
      "Tom 01",
      "Tom 02",
      "Tom 03",
      "Tom 04",
      "Tom 05",
      "Tom 06",
      "Tom 07",
      "Tom 08",
      "Tom 09",
      "Tom 10",
    ],
    { required_error: "Selecione o tom de pele." },
  ),
  tipoFisico: z.enum(["Magro(a)", "Atlético(a)", "Curvy", "Plus Size"], {
    required_error: "Selecione o tipo físico.",
  }),
  altura: z.number().min(150).max(200),
  formatoRosto: z.enum(["Oval", "Redondo", "Quadrado", "Coração", "Alongado"], {
    required_error: "Selecione o formato do rosto.",
  }),
  corOlhos: z.enum(["Castanho", "Preto", "Azul", "Verde", "Mel", "Cinza"], {
    required_error: "Selecione a cor dos olhos.",
  }),
  expressao: z.enum(["Neutra", "Sorrindo", "Séria", "Confiante", "Sensual"], {
    required_error: "Selecione a expressão.",
  }),
  pelosFaciais: z.enum(
    ["Nenhum", "Barba curta", "Barba cheia", "Bigode", "Cavanhaque"],
    { required_error: "Selecione a opção de pelos." },
  ),
  boca: z.enum(
    [
      "Lábios finos",
      "Lábios médios",
      "Lábios carnudos",
      "Arco do cupido",
      "Boca larga",
      "Boca pequena",
    ],
    { required_error: "Selecione a boca." },
  ),
  sobrancelha: z.enum(
    ["Reta", "Arqueada", "Angulosa", "Grossa / cheia", "Fina", "Curvada suave"],
    { required_error: "Selecione a sobrancelha." },
  ),
  nariz: z.enum(
    ["Reto", "Aquilino", "Arrebitado", "Largo", "Afilado", "Botão"],
    { required_error: "Selecione o nariz." },
  ),
  estiloCabelo: z.enum(
    [
      "Careca",
      "Militar",
      "Curto",
      "Pixie",
      "Undercut",
      "Topete",
      "Médio",
      "Longo",
      "Franja",
      "Cacheado",
      "Afro",
      "Dreads",
      "Tranças",
      "Rabo de cavalo",
      "Coque",
      "Man bun",
    ],
    { required_error: "Selecione o estilo de cabelo." },
  ),
  corCabelo: z.enum(
    [
      "Preto",
      "Castanho",
      "Castanho claro",
      "Mel",
      "Loiro claro",
      "Ruivo",
      "Prateado",
      "Amarelo",
      "Azul",
    ],
    { required_error: "Selecione a cor de cabelo." },
  ),
  roupa: z.enum(
    [
      "Casual",
      "Luxo",
      "Streetwear",
      "Fitness",
      "Corporativo",
      "Geração Automática",
      "Enviar Imagem",
    ],
    { required_error: "Selecione a roupa." },
  ),
  detalhesRoupa: z.string().max(120, "Máximo 120 caracteres.").optional(),
  detalhesExtras: z.string().max(150, "Máximo 150 caracteres.").optional(),
});

const FIELD_TAB: Record<string, number> = {
  nome: 1,
  genero: 1,
  idade: 1,
  etnia: 1,
  tomPele: 1,
  tipoFisico: 2,
  altura: 2,
  formatoRosto: 3,
  corOlhos: 3,
  expressao: 3,
  pelosFaciais: 3,
  boca: 3,
  sobrancelha: 3,
  nariz: 3,
  estiloCabelo: 4,
  corCabelo: 4,
  roupa: 5,
  detalhesRoupa: 5,
  detalhesExtras: 6,
};

export type AvatarFormValues = z.infer<typeof avatarSchema>;

export function FullCustomizationMode() {
  const [activeTab, setActiveTab] = useState(1);
  const generateAvatar = useGenerateAvatar();
  const saveAvatar = useSaveAvatar();

  const { data: usage } = useAvatarUsage();
  const noQuota = usage ? usage.remaining <= 0 : false;

  const form = useForm<AvatarFormValues>({
    resolver: zodResolver(avatarSchema),
    defaultValues: {
      nome: "",
      genero: "Feminino",
      idade: 28,
      etnia: "Latino/Latina",
      tomPele: "Tom 05",
      tipoFisico: "Magro(a)",
      altura: 170,
      formatoRosto: "Oval",
      corOlhos: "Castanho",
      expressao: "Neutra",
      pelosFaciais: "Nenhum",
      boca: "Lábios médios",
      sobrancelha: "Arqueada",
      nariz: "Reto",
      estiloCabelo: "Curto",
      corCabelo: "Preto",
      roupa: "Casual",
      detalhesRoupa: "",
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

  const handleSave = () => {
    const generation = generateAvatar.data;
    if (!generation || generation.status !== "COMPLETED") return;

    const nome = form.getValues("nome").trim();
    if (!nome) {
      form.setError("nome", {
        message: "Dê um nome ao avatar antes de salvar.",
      });
      setActiveTab(1);
      return;
    }
    saveAvatar.mutate({ generationId: generation.id, name: nome });
  };

  const handleNext = () => {
    if (activeTab < 6) {
      setActiveTab((prev) => prev + 1);
      return;
    }
    form.handleSubmit(
      (data) => generateAvatar.mutate(buildAvatarConfig(data)),
      (errors) => {
        const first = Object.keys(errors)[0];
        const tab = FIELD_TAB[first];
        if (tab) setActiveTab(tab);
        toast.error(
          errors[first as keyof typeof errors]?.message ??
            "Revise os campos destacados.",
        );
      },
    )();
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
                    : "bg-linear-to-b from-white/10 to-brand-500/5 backdrop-blur-md border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.15)] text-text-2 hover:from-white/15 hover:to-brand-500/10 hover:border-white/30 hover:text-white",
                )}
              >
                {tab.id}. {tab.label}
              </button>
            );
          })}
        </div>

        <Form {...form}>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="relative overflow-hidden min-h-[500px] p-4 -mx-4"
          >
            <AnimatePresence>
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

        {usage && (
          <p className="text-xs text-text-3 px-1">
            {noQuota
              ? "Você atingiu o limite de gerações de hoje."
              : `Restam ${usage.remaining} de ${usage.max} gerações hoje.`}
          </p>
        )}

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
            disabled={generateAvatar.isPending || (activeTab === 6 && noQuota)}
            className={cn(
              activeTab === 6
                ? "bg-brand-500 hover:bg-brand-600 text-white shadow-[0_0_24px_-6px_rgba(75,68,232,0.5)]"
                : "",
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
        generatedImage={generateAvatar.data?.imageUrl ?? null}
        prompt={generateAvatar.data?.prompt ?? null}
        canSave={
          generateAvatar.data?.status === "COMPLETED" && !saveAvatar.isSuccess
        }
        isSaving={saveAvatar.isPending}
        onSave={handleSave}
      />
    </div>
  );
}
