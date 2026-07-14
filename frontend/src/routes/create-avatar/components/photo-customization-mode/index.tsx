import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/utils/utils";
import { Button, Form } from "@/components";
import { useGenerateAvatar } from "../../api/use-generate-avatar";
import { PreviewPanel } from "../preview-panel";

import { avatarPhotoSchema, type AvatarPhotoFormValues } from "./schema";
import { TabSuaFoto } from "./components/tab-your-photo";
import { TabRoupa } from "./components/tab-clothing";

const TABS = [
  { id: 1, label: "Sua foto" },
  { id: 2, label: "Roupa" },
];

export function PhotoCustomizationMode() {
  const [activeTab, setActiveTab] = useState(1);
  const generateAvatar = useGenerateAvatar();

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
    if (activeTab < 2) setActiveTab((prev) => prev + 1);
    else {
      form.handleSubmit((data) => {
        generateAvatar.mutate({
          prompt: data.instrucoesRoupa || data.opcoesAdicionais || `Avatar para ${data.nome}`,
          style: data.modoRoupa === "Upload de imagem" ? "image-upload" : "auto",
          cameraAngle: "front",
          shotType: data.tipoPeca === "Look completo" ? "full-body" : "medium",
          gender: "unspecified",
          ageRange: "adult"
        });
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
                type="button"
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
                {activeTab === 1 && <TabSuaFoto form={form} />}
                {activeTab === 2 && <TabRoupa form={form} />}
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
              activeTab === 2 ? "bg-brand-500 hover:bg-brand-600 text-white shadow-[0_0_24px_-6px_rgba(75,68,232,0.5)]" : ""
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
        isGenerating={generateAvatar.isPending}
        generatedImage={generateAvatar.data || null}
      />
    </div>
  );
}
