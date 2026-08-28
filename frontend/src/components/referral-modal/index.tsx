import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Crown, MessageSquare, Gift, Tag, CheckCircle2, ChevronLeft, Sparkles, Percent, Unlock, ImagePlus, User } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/dialog";
import { Button } from "@/components/button";
import { Slider } from "@/components/slider";
import { useAuth } from "@/context/auth";

export function ReferralModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [usages, setUsages] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();

  // When modal is closed, reset state
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(() => setStep(1), 300); // Reset after closing animation
    }
    onOpenChange(isOpen);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Link gerado e copiado para a área de transferência!");
      onOpenChange(false);
      setTimeout(() => setStep(1), 300);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={`glass-premium-purple w-[92vw] sm:w-full mx-auto ${step === 1 ? 'max-w-lg' : 'max-w-[620px]'} p-0 overflow-hidden border-white/10 rounded-[28px] sm:rounded-[32px] transition-[max-width] duration-300`}>
        {/* Hidden titles for accessibility */}
        <DialogTitle className="sr-only">Acesso Creator</DialogTitle>
        <DialogDescription className="sr-only">Modal de indicação e benefícios</DialogDescription>

        <div className="relative overflow-y-auto max-h-[95vh] hide-scrollbar p-5 sm:p-8">
          <AnimatePresence mode="wait" initial={false}>
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                {/* Creator badge + Title + Subtitle inside a bordered card */}
                <div className="rounded-2xl border border-brand-500/20 bg-brand-500/[0.04] p-5 sm:p-6">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-4">
                    <Sparkles className="size-3" />
                    Acesso Creator
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">Sua</span> condição especial
                  </h2>
                  <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
                    Seu reconhecimento como Creator permite liberar uma condição exclusiva para sua audiência.
                  </p>

                  {/* User profile card */}
                  <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="size-10 shrink-0 rounded-full overflow-hidden bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
                      {user?.photoUrl ? (
                        <img src={user.photoUrl} alt="Foto de perfil" className="size-full object-cover" />
                      ) : (
                        <User className="size-5 text-brand-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        @{user?.name?.toLowerCase().replace(/\s+/g, '') ?? 'usuario'}
                      </p>
                      <p className="text-[11px] text-zinc-500">Creator reconhecido</p>
                    </div>
                    <div className="shrink-0 rounded-md border border-brand-500/30 bg-brand-500/10 px-2.5 py-1 text-[10px] font-bold text-brand-400 uppercase tracking-wider">
                      Reconhecido
                    </div>
                  </div>
                </div>

                {/* O que o convidado recebe */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">O que o convidado recebe</p>
                  <div className="space-y-2">
                    <div className="flex gap-3 items-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]">
                      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-500/15 border border-brand-500/30 text-brand-400">
                        <Percent className="size-4" />
                      </div>
                      <p className="text-sm text-zinc-300 font-medium">
                        <strong className="text-white">50% de desconto</strong> ao comprar.
                      </p>
                    </div>
                    <div className="flex gap-3 items-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]">
                      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-500/15 border border-brand-500/30 text-brand-400">
                        <Unlock className="size-4" />
                      </div>
                      <p className="text-sm text-zinc-300 font-medium">
                        <strong className="text-white">Todas as funcionalidades</strong> da ferramenta desbloqueadas
                      </p>
                    </div>
                    <div className="flex gap-3 items-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]">
                      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-500/15 border border-brand-500/30 text-brand-400">
                        <ImagePlus className="size-4" />
                      </div>
                      <p className="text-sm text-zinc-300 font-medium">
                        <strong className="text-white">Gerações de imagens</strong> ilimitadas
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 mt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <Gift className="size-5 text-brand-400" />
                    <h3 className="text-white font-bold">Link presente</h3>
                  </div>
                  <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
                    Cada link dá ao seu amigo acesso à ferramenta completa + 50% de desconto. Escolha de 1 a 10 usos e gere o link abaixo.
                  </p>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      <span>Quantos usos?</span>
                      <span className="text-brand-400 bg-brand-500/20 px-2 py-0.5 rounded-md">{usages} {usages === 1 ? 'uso' : 'usos'}</span>
                    </div>
                    <div className="px-1">
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[usages]}
                        onValueChange={(val) => setUsages(val[0])}
                      />
                      <div className="flex justify-between mt-2 text-[10px] font-bold text-zinc-500">
                        <span>1</span>
                        <span>10</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-[0_0_15px_rgba(var(--color-brand-500),0.2)] hover:shadow-[0_0_20px_rgba(var(--color-brand-500),0.4)] transition-all font-bold h-12 mt-2"
                  onClick={() => setStep(2)}
                >
                  <Gift className="mr-2 size-5" />
                  Gerar link
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3"
                style={{ zoom: 0.82 } as React.CSSProperties & { zoom: number }}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="size-4" />
                    Voltar
                  </button>
                </div>

                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">Seu</span> link de convite
                  </h2>
                  <p className="text-zinc-400 mt-1 font-medium uppercase tracking-wider text-[11px] sm:text-xs">o que seu amigo recebe ao usar o seu link</p>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="flex flex-col items-start text-left gap-2 sm:gap-3 py-4 sm:py-6 px-3 sm:px-5 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-500/15 border border-brand-500/30 text-brand-400">
                      <Tag className="size-4" />
                    </div>
                    <div className="mt-1">
                      <p className="text-[13px] font-bold text-white mb-0.5">50% OFF</p>
                      <p className="text-[10px] text-zinc-400 leading-tight">Metade do preço no plano mensal ou vitalício.</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start text-left gap-2 sm:gap-3 py-4 sm:py-6 px-3 sm:px-5 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-500/15 border border-brand-500/30 text-brand-400">
                      <Crown className="size-4" />
                    </div>
                    <div className="mt-1">
                      <p className="text-[13px] font-bold text-white mb-0.5">Funcionalidades</p>
                      <p className="text-[10px] text-zinc-400 leading-tight">Todas as funcionalidades totalmente liberadas.</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start text-left gap-2 sm:gap-3 py-4 sm:py-6 px-3 sm:px-5 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-500/15 border border-brand-500/30 text-brand-400">
                      <CheckCircle2 className="size-4" />
                    </div>
                    <div className="mt-1">
                      <p className="text-[13px] font-bold text-white mb-0.5">Promoção oficial</p>
                      <p className="text-[10px] text-zinc-400 leading-tight">Desconto e benefícios automáticos no checkout.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-2">
                  {/* Mensal */}
                  <div className="relative p-3 sm:p-6 rounded-[20px] border border-brand-500/30 bg-[linear-gradient(135deg,rgba(75,68,232,0.10)_0%,rgba(0,0,0,0.2)_100%)] shadow-[0_0_15px_rgba(75,68,232,0.08)] flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs font-bold uppercase text-brand-300/60 mb-2 sm:mb-3">Mensal</p>
                      <p className="text-xs sm:text-[15px] text-zinc-500 line-through">R$ 299,90</p>
                      <p className="text-xl sm:text-4xl font-black text-white leading-none mt-1 sm:mt-2">R$ 149,00 <span className="text-[10px] sm:text-sm font-normal text-zinc-400">/mês</span></p>
                    </div>
                    <div className="mt-4 sm:mt-6">
                      <div className="h-px w-full bg-white/10 mb-3 sm:mb-4" />
                      <div className="flex items-center gap-1.5 sm:gap-3 text-green-400">
                        <CheckCircle2 className="size-3 sm:size-5 shrink-0" />
                        <p className="text-[10px] sm:text-sm font-semibold leading-tight">Economia de R$ 150,90</p>
                      </div>
                    </div>
                  </div>

                  {/* Vitalício (Featured) */}
                  <div className="relative p-3 sm:p-6 rounded-[20px] border border-amber-500/50 bg-[linear-gradient(135deg,rgba(245,158,11,0.15)_0%,rgba(0,0,0,0.2)_100%)] shadow-[0_0_15px_rgba(245,158,11,0.1)] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2 sm:mb-3">
                        <p className="text-[10px] sm:text-xs font-bold uppercase text-amber-500/80">Vitalício</p>
                        <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white text-[8px] sm:text-[10px] font-extrabold uppercase px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-md text-center leading-tight">
                          Mais Popular
                        </div>
                      </div>
                      <p className="text-xs sm:text-[15px] text-zinc-500 line-through">R$ 597,00</p>
                      <p className="text-lg sm:text-4xl font-black text-white leading-none mt-1 sm:mt-2">12x R$ 33,84</p>
                      <p className="text-[11px] sm:text-[17px] font-bold text-zinc-300 mt-1.5 sm:mt-2.5 leading-tight">ou R$ 295,00 pagamento único</p>
                    </div>
                    <div className="mt-4 sm:mt-6">
                      <div className="h-px w-full bg-white/10 mb-3 sm:mb-4" />
                      <div className="flex items-center gap-1.5 sm:gap-3 text-green-400">
                        <CheckCircle2 className="size-3 sm:size-5 shrink-0" />
                        <p className="text-[10px] sm:text-sm font-semibold leading-tight">Economia de R$ 302,00</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-3 mt-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Gift className="size-4 text-brand-400" />
                    <h3 className="text-[13px] text-white font-bold">Link de convite</h3>
                  </div>
                  <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                    Escolha quantos usos liberar (até 10 no total) e confirme. O link já sai com o desconto aplicado.
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      <span>Quantos usos?</span>
                      <span className="text-brand-400 bg-brand-500/20 px-2 py-0.5 rounded-md">{usages} {usages === 1 ? 'uso' : 'usos'}</span>
                    </div>
                    <div className="px-1">
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[usages]}
                        onValueChange={(val) => setUsages(val[0])}
                      />
                      <div className="flex justify-between mt-1.5 text-[9px] font-bold text-zinc-500">
                        <span>1</span>
                        <span>10</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-1 text-center">
                  <Button
                    size="lg"
                    disabled={isGenerating}
                    onClick={handleGenerate}
                    className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-[0_0_15px_rgba(var(--color-brand-500),0.2)] hover:shadow-[0_0_20px_rgba(var(--color-brand-500),0.4)] transition-all font-bold h-11 relative overflow-hidden"
                  >
                    {isGenerating ? (
                      <span className="animate-pulse">Gerando link seguro...</span>
                    ) : (
                      <>
                        <Gift className="mr-2 size-5" />
                        Gerar {usages} {usages === 1 ? 'uso' : 'usos'}
                      </>
                    )}
                  </Button>
                  <p className="text-[10px] font-medium text-zinc-500 mt-4 tracking-wide uppercase">
                    Promoção por tempo limitado.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
