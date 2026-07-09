import { useState, useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronLeft, ArrowRight, Package, User, Camera, Image as ImageIcon, Sparkles, Pencil, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppShell } from "@/layouts/app-shell";
import { Page } from "@/components/base/page";
import { Stepper } from "@/components/navigation/stepper";
import { Button } from "@/components/base/primitives";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { avatars, products } from "@/mock/data";

const steps = ["Produto", "Influencer", "Cenário", "Pose + Imagem", "Fala & Voz", "Vídeo"];

// TODO: confirmar o texto exato das 3 sugestões (podem variar conforme produto/cenário)
const SUGESTOES = [
  { id: "sugestao-1", label: "Sugestão 1", text: "Segurando o celular para a selfie enquanto a outra mão puxa levemente a gola da camisa." },
  { id: "sugestao-2", label: "Sugestão 2", text: "Encostado na parede do quarto, sorrindo e deixando a mão livre descansar suavemente sobre o quadril." },
  { id: "sugestao-3", label: "Sugestão 3", text: "Inclinando levemente a cabeça para o lado enquanto a mão livre toca o bordado da bandeira brasileira." },
  { id: "manual", label: "Descrever manualmente", text: "", isManual: true },
];

export function PoseScreen() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as any;
  
  const [isLoading, setIsLoading] = useState(true);
  const [poseSelecionada, setPoseSelecionada] = useState<string | null>(search.pose || null);
  const [poseManualText, setPoseManualText] = useState(search.poseManual || "");
  const [productImgError, setProductImgError] = useState(false);
  const [avatarImgError, setAvatarImgError] = useState(false);

  // Simulando loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Resolvendo mocks para exibir os nomes na barra de resumo
  const produto = products.find((p) => p.id === Number(search.productId));
  const avatar = avatars.find((a) => a.id === Number(search.avatarId));
  
  // Formatando o resumo do cenário
  const local = search.local ? search.local.charAt(0).toUpperCase() + search.local.slice(1) : "?";
  const horario = search.horario ? search.horario.charAt(0).toUpperCase() + search.horario.slice(1) : "?";
  const iluminacao = search.iluminacao ? search.iluminacao.charAt(0).toUpperCase() + search.iluminacao.slice(1) : "?";
  const atmosfera = search.atmosfera ? search.atmosfera.charAt(0).toUpperCase() + search.atmosfera.slice(1) : "?";

  // Botão gerar ativo?
  const isPoseValid = poseSelecionada !== null && (poseSelecionada !== "manual" || poseManualText.trim().length > 0);

  return (
    <AppShell>
      <Page>
        {/* TOPO */}
        <header className="entrance mb-8 flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="bg-white/5 border border-white/10 hover:bg-white/10"
            onClick={() => navigate({ 
              to: "/criar-do-zero/cenario", 
              search: (prev: any) => prev
            })}
          >
            <ChevronLeft className="size-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-[.2em] text-accent-400">
              Criar do zero
            </span>
            <span className="text-sm font-medium text-text-2">
              Passo 4 de 6
            </span>
          </div>
        </header>

        {/* STEPPER */}
        <Stepper steps={steps} current={3} />

        {/* TÍTULO DA ETAPA */}
        <div className="mt-10 mb-8">
          <h1 className="text-3xl font-extrabold tracking-[-.035em] text-text-1 md:text-4xl">
            Pose & geração da imagem
          </h1>
          <p className="mt-3 text-sm leading-6 text-text-2">
            Defina como o avatar deve aparecer com o produto e gere a imagem.
          </p>
        </div>

        {/* LINHA DE RESUMO */}
        <div className="mb-10 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-2xl glass-surface p-4 border border-white/10">
            {produto?.image && !productImgError ? (
              <img
                src={produto.image}
                alt={produto.name}
                className="size-10 shrink-0 rounded-xl object-cover border border-white/12 shadow-sm"
                onError={() => setProductImgError(true)}
              />
            ) : (
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-400">
                <Package className="size-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-3">Produto</p>
              <p className="text-sm font-medium text-text-1 truncate">{produto?.name || "Desconhecido"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 rounded-2xl glass-surface p-4 border border-white/10">
            {avatar?.image && !avatarImgError ? (
              <img
                src={avatar.image}
                alt={avatar.name}
                className="size-10 shrink-0 rounded-xl object-cover border border-white/12 shadow-sm"
                onError={() => setAvatarImgError(true)}
              />
            ) : (
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-400">
                <User className="size-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-3">Influencer</p>
              <p className="text-sm font-medium text-text-1 truncate">{avatar?.name || "Desconhecido"} (padrão)</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl glass-surface p-4 border border-white/10">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-400">
              <Camera className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-3">Ponto de Vista</p>
              {/* TODO: origem do "ponto de vista" — se ainda não é escolhido em nenhuma etapa, definir default ou etapa de origem */}
              <p className="text-sm font-medium text-text-1 truncate">Selfie (POV)</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl glass-surface p-4 border border-white/10">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-400">
              <ImageIcon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-3">Cenário</p>
              <p className="text-sm font-medium text-text-1 truncate">{local} · {horario} · {iluminacao} · {atmosfera}</p>
            </div>
          </div>
        </div>

        {/* CARD PRINCIPAL */}
        <div className="mb-8 rounded-[24px] glass-surface p-5 sm:p-8 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="grid size-8 place-items-center rounded-full bg-violet-500/15 text-violet-400">
              <Sparkles className="size-4" />
            </div>
            <h2 className="text-xl font-extrabold text-text-1 tracking-tight">
              Como o avatar deve posar com o produto?
            </h2>
          </div>
          <p className="text-sm text-text-3 mb-8 ml-11">
            {isLoading 
              ? "Gerando sugestões com base nas suas escolhas…"
              : "Escolha uma sugestão ou clique em descrever manualmente."}
          </p>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <AnimatePresence mode="wait">
              {isLoading ? (
                // SKELETONS
                Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={`skel-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-5 h-[140px]"
                  >
                    <div className="h-3 w-1/3 rounded-full bg-white/10 animate-pulse" />
                    <div className="space-y-2 mt-2">
                      <div className="h-2.5 w-full rounded-full bg-white/5 animate-pulse" />
                      <div className="h-2.5 w-[90%] rounded-full bg-white/5 animate-pulse" />
                      <div className="h-2.5 w-[60%] rounded-full bg-white/5 animate-pulse" />
                    </div>
                  </motion.div>
                ))
              ) : (
                // OPÇÕES FIXAS (Cascata)
                SUGESTOES.map((opcao, i) => {
                  const isSelected = poseSelecionada === opcao.id;
                  
                  return (
                    <motion.div
                      key={opcao.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: i * 0.1, // Stagger de 100ms
                        ease: [0.21, 0.47, 0.32, 0.98] 
                      }}
                      className="h-full" // O container do framer-motion ocupa altura toda pra o botão expandir
                    >
                      <button
                        onClick={() => setPoseSelecionada(opcao.id)}
                        className={cn(
                          "relative flex flex-col items-start gap-2 h-full w-full p-5 rounded-2xl border text-left transition-all duration-300",
                          opcao.isManual ? "border-dashed border-violet-500/30" : "border-solid",
                          isSelected
                            ? "bg-violet-500/10 border-violet-500 shadow-[0_0_24px_-4px_rgba(139,92,246,0.3)]"
                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {opcao.isManual && <Pencil className="size-3.5 text-violet-400" />}
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            isSelected ? "text-violet-300" : "text-text-3"
                          )}>
                            {opcao.label}
                          </span>
                        </div>
                        
                        {!opcao.isManual && (
                          <span className="text-sm text-text-1 leading-relaxed">
                            {opcao.text}
                          </span>
                        )}

                        {isSelected && (
                          <div className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-violet-500 text-white shadow-sm">
                            <Check className="size-3" />
                          </div>
                        )}
                      </button>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* TEXTAREA (Apenas quando manual selecionado) */}
          <AnimatePresence>
            {!isLoading && poseSelecionada === "manual" && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-1 relative shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]">
                  <textarea
                    value={poseManualText}
                    onChange={(e) => setPoseManualText(e.target.value)}
                    placeholder="Descreva exatamente como quer que o avatar segure ou vista o produto na cena..."
                    className="w-full h-32 rounded-xl bg-transparent px-4 py-4 text-sm text-text-1 placeholder:text-text-3 resize-none focus:outline-none"
                    autoFocus
                  />
                  <div className="absolute bottom-3 right-4 pointer-events-none">
                    <span className="text-[10px] text-text-3 font-medium uppercase tracking-widest">
                      Comando livre
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 flex justify-center">
            <Button
              disabled={isLoading || !isPoseValid}
              size="lg"
              className="rounded-full px-8 font-semibold shadow-[0_0_30px_-5px_rgba(139,92,246,0.5)]"
              onClick={() => {
                // TODO: fluxo de geração da imagem
                toast("Em breve: Fluxo de geração da imagem");
              }}
            >
              <Sparkles className="size-4 mr-2" />
              Gerar imagem
            </Button>
          </div>
        </div>

        {/* RODAPÉ */}
        <div className="flex items-center justify-between border-t border-white/10 pt-6">
          <Button 
            variant="ghost"
            onClick={() => navigate({ 
              to: "/criar-do-zero/cenario",
              search: (prev: any) => prev
            })}
            className="text-text-2 hover:text-white"
          >
            Voltar
          </Button>
          <Button
            onClick={() => {
              // TODO: etapa Fala & Voz
              toast("Em breve: Etapa Fala & Voz");
              navigate({
                to: "/criar-do-zero/fala" as any,
                search: (prev: any) => ({
                  ...prev,
                  pose: poseSelecionada,
                  poseManual: poseManualText,
                })
              }).catch(() => {});
            }}
          >
            Próximo
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>
      </Page>
    </AppShell>
  );
}
