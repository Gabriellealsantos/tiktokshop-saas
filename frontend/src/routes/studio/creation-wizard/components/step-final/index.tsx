import { useState } from "react";
import { ArrowRight, Check, Copy, Download, ExternalLink, Flame, Hash, Image as ImageIcon, Package, Play, RefreshCw, Sparkles, UserRound } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button } from "@/components";
import { avatars, products } from "@/services/data";
import { cn } from "@/utils/utils";
import { finalPrompt } from "@/utils/constants";
import { ActionCardButton } from "../action-card-button";

export function CreationFinal({ takes = 1 }: { takes?: number }) {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGeneratePrompt = () => {
    if (hasGenerated) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasGenerated(true);
    }, 1200);
  };

  const cardBase = "glass-surface relative overflow-hidden rounded-[20px] border border-white/[0.08] border-t-white/[0.14] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)] transition-all duration-300 hover:shadow-[0_16px_48px_-12px_rgba(139,92,246,0.2)] hover:border-accent-500/30 motion-reduce:transform-none";

  const getAssetTheme = (type: string) => {
    switch (type) {
      case "Produto": return { badge: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: "text-amber-500" };
      case "Avatar": return { badge: "bg-accent-500/10 text-accent-300 border-accent-500/20", icon: "text-accent-400" };
      case "Cenário": return { badge: "bg-teal-500/10 text-teal-400 border-teal-500/20", icon: "text-teal-400" };
      default: return { badge: "bg-white/10 text-white border-white/20", icon: "text-white" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Container Criação de Referência */}
      <div className={cn(cardBase, "p-6")}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-accent-500/10 text-accent-400">
              <ImageIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-1 tracking-tight">Criação de Referência</h2>
              <p className="text-sm text-text-2 mt-0.5">Gere a imagem base para o seu vídeo.</p>
            </div>
          </div>
          <Button className="bg-success hover:bg-success/80 text-black border-none font-semibold shadow-md gap-2 pl-2" onClick={() => {/* TODO: baixar todos os ativos */}}>
            <div className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-black/10">
              <Download className="size-4" />
            </div>
            Baixar Todos
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["PRODUTO", "Produto", Package, products[0].image],
            ["AVATAR", "Avatar", UserRound, avatars[0].image],
            ["CENÁRIO", "Cenário", ImageIcon, products[3].image],
          ].map(([badgeStr, title, Icon, image]) => {
            const theme = getAssetTheme(title as string);
            return (
              <div className="glass-surface relative overflow-hidden rounded-[16px] border border-white/[0.08] group hover:-translate-y-0.5 transition-all duration-300" key={title as string}>
                <div className="absolute top-3 left-3 z-10">
                  <div className={cn("px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wider backdrop-blur-md", theme.badge)}>
                    {badgeStr as string}
                  </div>
                </div>

                {/* Ações individuais: Trocar e Baixar */}
                <div className="absolute top-3 right-3 z-10 flex gap-2">
                  <button type="button" onClick={() => {/* TODO: trocar ativo */}} className="flex size-8 items-center justify-center rounded-[9px] bg-black/40 text-white/80 border border-white/10 backdrop-blur-md transition-colors hover:bg-black/60 hover:text-white" title="Trocar ativo">
                    <RefreshCw className="size-4" />
                  </button>
                  <button type="button" onClick={() => {/* TODO: baixar ativo individual */}} className="flex size-8 items-center justify-center rounded-[9px] bg-black/40 text-white/80 border border-white/10 backdrop-blur-md transition-colors hover:bg-black/60 hover:text-white" title="Baixar ativo">
                    <Download className="size-4" />
                  </button>
                </div>

                <div className="aspect-[4/3] sm:aspect-video w-full overflow-hidden bg-surface-3">
                  <img
                    src={image as string}
                    alt={title as string}
                    className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                <div className="absolute bottom-0 inset-x-0 flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-white/10 backdrop-blur-md", theme.icon)}>
                      <Icon className="size-4" />
                    </div>
                    <span className="text-sm font-bold text-white drop-shadow-md">{title as string}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mesclagem Colapsável */}
      <Accordion type="single" collapsible className="space-y-4">
        <AccordionItem value="mesclagem" className={cn(cardBase, "border-white/[0.08] data-[state=open]:pb-0")}>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-500/50 to-transparent" />

          <AccordionTrigger className="px-6 sm:px-7 py-6 hover:no-underline hover:bg-white/[0.02]">
            <div className="flex flex-1 items-center justify-between gap-4 mr-4">
              <div className="flex items-center gap-4 text-left">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br from-accent-400 to-accent-600 text-white shadow-lg">
                  <Flame className="size-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-text-1 tracking-tight">Mesclagem Manual</h2>
                  <p className="text-sm text-text-2 mt-0.5">Grok / VEO 3.1 · Prompts técnicos e sequência.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-bold tracking-widest shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                PRONTO
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-6 sm:px-7 pb-7 pt-2">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* COLUNA ESQUERDA */}
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-[7px] bg-white/5 text-text-3">
                      <Copy className="size-3" />
                    </div>
                    <span className="text-sm font-semibold text-text-1">Prompt de Mesclagem</span>
                  </div>
                </div>
                <div className="relative flex-1 min-h-[180px] rounded-[16px] border border-white/5 bg-[rgba(0,0,0,0.28)] p-5 font-mono text-[13px] leading-relaxed text-white/80 shadow-inner overflow-hidden">
                  <div className="absolute top-3 right-3">
                    <Button size="sm" variant="ghost" className="h-7 px-2.5 bg-accent-500/10 text-accent-400 hover:bg-accent-500/20 hover:text-accent-300 text-xs font-semibold rounded-[7px]" onClick={() => { if (finalPrompt) navigator.clipboard?.writeText(finalPrompt); setCopied(true); }}>
                      {copied ? <Check className="size-3.5 mr-1.5" /> : <Copy className="size-3.5 mr-1.5" />}
                      {copied ? "Copiado" : "Copiar"}
                    </Button>
                  </div>
                  <div className="pt-6">
                    {finalPrompt || "// TODO: fonte do prompt completo"}
                  </div>
                </div>
              </div>

              {/* COLUNA DIREITA */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:w-56 shrink-0">
                <div className="flex-1 flex flex-col gap-2.5">
                  <div className="relative aspect-video w-full overflow-hidden rounded-[14px] border border-white/10 bg-surface-3 group/img">
                    <img src={avatars[0].image} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105 opacity-90" alt="Avatar" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[14px]" />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-[#34d399] to-[#10b981] hover:from-[#10b981] hover:to-[#059669] text-black border-none font-bold shadow-md pl-1.5 gap-2 h-10 rounded-[12px]" onClick={() => {/* TODO: download avatar real */}}>
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-black/10">
                      <Download className="size-4" />
                    </div>
                    Baixar Avatar
                  </Button>
                </div>
                <div className="flex-1 flex flex-col gap-2.5">
                  <div className="relative aspect-video w-full overflow-hidden rounded-[14px] border border-white/10 bg-surface-3 group/img">
                    <img src={products[0].image} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105 opacity-90" alt="Produto" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[14px]" />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-[#34d399] to-[#10b981] hover:from-[#10b981] hover:to-[#059669] text-black border-none font-bold shadow-md pl-1.5 gap-2 h-10 rounded-[12px]" onClick={() => {/* TODO: download produto real */}}>
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-black/10">
                      <Download className="size-4" />
                    </div>
                    Baixar Produto
                  </Button>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Mover botões Abrir e Gerar Prompt */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCardButton
            icon={Play}
            title="Abrir Flow VEO3"
            description="Vídeos profissionais"
            onClick={() => {/* TODO: definir destino do VEO3 */}}
          />
          <ActionCardButton
            icon={ExternalLink}
            title="Abrir Nano Banana"
            description="Edição de imagem"
            onClick={() => {/* TODO: definir destino do Nano Banana */}}
          />
          <ActionCardButton
            icon={ExternalLink}
            title="Abrir Grok"
            description="Roteiro e mesclagem"
            onClick={() => {/* TODO: definir destino do Grok */}}
          />
        </div>
        <ActionCardButton
          icon={isGenerating ? RefreshCw : Sparkles}
          title={isGenerating ? "Gerando..." : hasGenerated ? "Regerar Prompt" : "Gerar Prompt"}
          description="Storyboard técnico VEO 3.1 em segundos"
          actionIcon={ArrowRight}
          primary
          spinning={isGenerating}
          onClick={handleGeneratePrompt}
          disabled={isGenerating}
        />
      </div>

      {/* "Gerar Prompt" revela a caixa do prompt gerado */}
      <AnimatePresence>
        {hasGenerated && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-6 pt-4">
              {/* Seções Take - Prompt VEO 3.1 */}
              <Accordion type="multiple" defaultValue={Array.from({ length: takes }).map((_, i) => `take-${i}`)} className="space-y-4">
                {Array.from({ length: takes }).map((_, i) => (
                  <AccordionItem value={`take-${i}`} key={i} className={cn(cardBase, "border-white/[0.08] data-[state=open]:pb-0")}>
                    <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-white/[0.02]">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center px-3 py-1.5 rounded-[9px] bg-accent-500/15 text-accent-400 border border-accent-500/20 text-xs font-bold tracking-widest">
                          TAKE {i + 1}
                        </div>
                        <span className="text-base font-semibold text-text-1">Prompt VEO 3.1</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2">
                      <div className="space-y-5">
                        <div className="rounded-[14px] border border-white/5 bg-[rgba(0,0,0,0.2)] p-5 font-mono text-[13px] leading-relaxed text-white/80 shadow-inner">
                          {`// TODO: fonte do prompt gerado por take\n[MANDATORY GLOBAL INSTRUCTIONS]\n[CLEAN OUTPUT]\n[Roteiro/Prompt específico para este take]`}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="flex size-6 shrink-0 items-center justify-center rounded-[7px] bg-white/5 text-text-3">
                              <Check className="size-3" />
                            </div>
                            <h4 className="text-sm font-semibold text-text-1">Regras (Guardrails)</h4>
                          </div>
                          <ul className="list-disc list-inside text-sm text-text-2 space-y-2 ml-1">
                            <li>{`// TODO: texto das regras/enforcement`}</li>
                            <li>Não altere a identidade visual do avatar.</li>
                            <li>Mantenha o produto sempre em foco.</li>
                            <li>Siga o estilo selecionado rigorosamente.</li>
                          </ul>
                        </div>

                        <div className="rounded-[14px] bg-red-500/10 border border-red-500/20 p-5 relative overflow-hidden">
                          <div className="absolute top-0 left-0 bottom-0 w-1 bg-red-500/50" />
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-red-500/20 text-red-400">
                              <Flame className="size-4" />
                            </div>
                            <h4 className="text-xs font-bold text-red-400 tracking-wider">PRIORITY & ENFORCEMENT</h4>
                          </div>
                          <p className="text-[13px] text-red-300/80 leading-relaxed pl-10">
                            {`// TODO: texto das regras/enforcement`}<br/>
                            O cumprimento destas regras é mandatório para aprovação da mesclagem. A consistência visual entre takes deve ser estritamente mantida.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hashtags sugeridas */}
      <div className={cn(cardBase, "p-6 sm:p-7")}>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-white/5 text-text-3">
            <Hash className="size-4" />
          </div>
          <span className="text-sm font-bold text-text-1 uppercase tracking-widest">Hashtags Sugeridas</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {["#tiktokshop", "#achadinhos", "#viralizou", "#paravoce", "#reviewreal"].map((tag) => (
            <div key={tag} className="px-4 py-2 rounded-full border border-accent-500/30 bg-accent-500/15 text-[13px] font-semibold text-accent-300 hover:bg-accent-500/25 hover:border-accent-500/50 transition-colors cursor-pointer">
              {tag}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
