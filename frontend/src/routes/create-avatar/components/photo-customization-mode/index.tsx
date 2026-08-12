import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/utils/utils";
import { Button, Form } from "@/components";
import { GlassPanel } from "@/components/glass-panel";
import { PreviewPanel } from "../preview-panel";

import { avatarPhotoSchema, type AvatarPhotoFormValues } from "./schema";
import { TabSuaFoto } from "./components/tab-your-photo";
import { TabRoupa } from "./components/tab-clothing";

import { useAvatarGenerationStatus } from "../../api/use-avatar-generation-status";
import { useSaveAvatar } from "../../api/use-save-avatar";
import { useAvatarUsage } from "../../api/use-avatars";
import { hasQuota, isUnlimited } from "@/utils/limit-display";
import { toast } from "sonner";
import { useGenerateAvatarFromPhoto } from "../../api/use-generate-avatar-from-photo";

const TABS = [
  { id: 1, label: "Sua foto" },
  { id: 2, label: "Roupa" },
];

export function PhotoCustomizationMode() {
  const [activeTab, setActiveTab] = useState(1);

  const uploadAndGenerate = useGenerateAvatarFromPhoto();
  const generateAvatar = useAvatarGenerationStatus();

  const saveAvatar = useSaveAvatar();
  const { data: usage } = useAvatarUsage();
  const noQuota = usage ? !hasQuota(usage.max, usage.remaining) : false;

  const form = useForm<AvatarPhotoFormValues>({
    resolver: zodResolver(avatarPhotoSchema),
    defaultValues: {
      nome: "",
      modoRoupa: "Automática",
      tipoPeca: "Look completo",
      instrucoesRoupa: "",
      opcoesAdicionais: "",
    },
    mode: "onChange",
  });

  const nome = form.watch("nome");
  const metadata = "Criado a partir de foto";

  const handleNext = () => {
    if (activeTab < 2) {
      setActiveTab((prev) => prev + 1);
      return;
    }
    form.handleSubmit(
      async (data) => {
        try {
          const job = await uploadAndGenerate.mutateAsync(data);
          generateAvatar.track(job);
        } catch {
          // erro de upload/geração já é tratado no onError do hook
        }
      },
      (errors) => {
        const first = Object.keys(errors)[0];
        if (first === "nome" || first === "fotoPrincipal") setActiveTab(1);

        const message = errors[first as keyof typeof errors]?.message;
        toast.error(
          typeof message === "string"
            ? message
            : "Revise os campos destacados.",
        );
      },
    )();
  };

  const handleSave = () => {
    const generation = generateAvatar.generation;
    if (!generation || generation.status !== "COMPLETED") return;

    const nomeAtual = form.getValues("nome").trim();
    if (!nomeAtual) {
      form.setError("nome", {
        message: "Dê um nome ao avatar antes de salvar.",
      });
      setActiveTab(1);
      return;
    }
    saveAvatar.mutate({ generationId: generation.id, name: nomeAtual });
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
                type="button"
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

        <GlassPanel className="my-2">
          <Form {...form}>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="relative overflow-hidden min-h-[500px]"
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
                  {activeTab === 1 && <TabSuaFoto form={form} />}
                  {activeTab === 2 && <TabRoupa form={form} />}
                </motion.div>
              </AnimatePresence>
            </form>
          </Form>
        </GlassPanel>

        {usage && (
          <p className="text-xs text-text-3 px-1">
            {isUnlimited(usage.max)
              ? "Gerações ilimitadas."
              : noQuota
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
            disabled={
              uploadAndGenerate.isPending ||
              generateAvatar.isGenerating ||
              (activeTab === 2 && noQuota)
            }
            className={cn(
              activeTab === 2
                ? "btn-brand gradient-brand luminous-glow text-white/90 drop-shadow-sm hover:luminous-glow-hover hover:brightness-110"
                : "",
            )}
          >
            {activeTab === 2 ? (
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
        isGenerating={
          uploadAndGenerate.isPending || generateAvatar.isGenerating
        }
        generatedImage={generateAvatar.generatedImage}
        prompt={generateAvatar.generation?.prompt ?? null}
        canSave={
          generateAvatar.generation?.status === "COMPLETED" &&
          !saveAvatar.isSuccess
        }
        isSaving={saveAvatar.isPending}
        onSave={handleSave}
      />
    </div>
  );
}
