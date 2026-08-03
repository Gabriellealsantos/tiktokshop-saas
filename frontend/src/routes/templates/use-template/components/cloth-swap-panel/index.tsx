import { useState } from "react";
import { Sparkles, Shirt, Package, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/button";
import { cn } from "@/utils/utils";
import { AnimatePresence, motion } from "motion/react";
import type { Product } from "@/models/product";
import type { ClothSwapMode } from "@/models/videoTemplate";

interface ClothSwapPanelProps {
  isBlocked?: boolean;
  produto?: Product | null;
  onEscolherProduto: () => void;
  onAplicar: (mode: ClothSwapMode) => void;
  onManterLook?: () => void;
  loading?: boolean;
}

export function ClothSwapPanel({
  isBlocked,
  produto,
  onEscolherProduto,
  onAplicar,
  onManterLook,
  loading,
}: ClothSwapPanelProps) {
  const [activeTab, setActiveTab] = useState<ClothSwapMode>("completo");
  const [imgError, setImgError] = useState(false);

  const OPCOES: { value: ClothSwapMode; label: string }[] = [
    { value: "completo", label: "Look completo" },
    { value: "substituir", label: "Substituir peça" },
    { value: "adicionar", label: "Adicionar peça" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[10px] font-bold tracking-widest text-brand-400 uppercase pl-1 drop-shadow-sm">
        Etapa 3 &middot; Troca de roupa
      </span>
      <span className="text-xs text-white/50 pl-1 mb-1">
        Substitua, adicione ou mantenha o look.
      </span>

      <div
        className={cn(
          "group relative rounded-[24px] bg-surface-2/60 border border-white/5 backdrop-blur-xl flex flex-col p-6 shadow-2xl ring-1 ring-white/5 transition-all duration-500",
          isBlocked ? "opacity-50" : "opacity-100",
        )}
      >
        <AnimatePresence>
          {isBlocked ? (
            <motion.div
              key="blocked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10 shadow-inner">
                <Shirt className="size-8 text-white/50 stroke-[1.5]" />
              </div>
              <p className="text-sm text-center text-white/60 font-medium px-4">
                Conclua a etapa anterior para liberar a troca de roupa.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col"
            >
              {/* Segmented Control */}
              <div className="grid w-full grid-cols-2 gap-2 rounded-xl bg-white/[0.04] p-2 ring-1 ring-white/10 mb-6">
                {OPCOES.map((opcao, index) => {
                  const ativo = activeTab === opcao.value;
                  const ehUltimo = index === OPCOES.length - 1;
                  return (
                    <button
                      key={opcao.value}
                      type="button"
                      onClick={() => setActiveTab(opcao.value)}
                      className={cn(
                        "h-9 whitespace-nowrap rounded-lg px-3 text-xs font-semibold transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                        ehUltimo && "col-span-2 mx-auto w-[calc(50%-0.25rem)]",
                        ativo
                          ? "btn-brand text-white/90 font-bold"
                          : "bg-white/[0.07] text-white/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),inset_0_-2px_0_0_rgba(0,0,0,0.30),0_2px_4px_rgba(0,0,0,0.25)] hover:bg-white/[0.12] hover:text-white/90",
                      )}
                    >
                      {opcao.label}
                    </button>
                  );
                })}
              </div>

              {/* Texto Contextual */}
              <div className="mb-8">
                <p className="text-sm text-white/60">
                  {activeTab === "completo" &&
                    "Substitui o look inteiro pela referência selecionada."}
                  {activeTab === "substituir" &&
                    "Troca apenas a peça indicada, mantendo o restante do look."}
                  {activeTab === "adicionar" &&
                    "Acrescenta a peça de referência ao look atual."}
                </p>
              </div>

              {/* Referência do Produto — clicável (escolher/trocar) */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase drop-shadow-sm">
                  Referência do Produto
                </span>

                <button
                  type="button"
                  onClick={onEscolherProduto}
                  className="flex items-center gap-4 p-3 rounded-[16px] bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-brand-500/40 transition-all group/prod text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <div className="size-16 rounded-[10px] overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 relative flex items-center justify-center">
                    {produto?.image && !imgError ? (
                      <img
                        src={produto.image}
                        alt={produto.name}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <Package className="size-6 text-white/20" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    {produto ? (
                      <>
                        <span
                          className="text-white font-semibold text-sm truncate"
                          title={produto.name}
                        >
                          {produto.name}
                        </span>
                        <span className="text-white/50 text-xs truncate mt-0.5 font-mono">
                          ID: {produto.id}
                        </span>
                        <span className="text-brand-400 text-[11px] font-medium mt-0.5">
                          Trocar produto
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-white font-semibold text-sm">
                          Escolher produto
                        </span>
                        <span className="text-white/40 text-xs mt-0.5">
                          Selecione um produto do catálogo
                        </span>
                      </>
                    )}
                  </div>
                  <ChevronRight className="size-4 text-white/30 group-hover/prod:text-white/60 transition-colors flex-shrink-0" />
                </button>
              </div>

              {/* Ações */}
              <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-white/10">
                <Button
                  className="w-full btn-3d-primary h-12 rounded-[14px] text-sm font-semibold transition-all group/btn disabled:opacity-50"
                  disabled={!produto || loading}
                  onClick={() => onAplicar(activeTab)}
                >
                  {loading ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="size-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
                  )}
                  Aplicar troca
                </Button>

                {onManterLook && (
                  <button
                    type="button"
                    className="text-xs text-white/40 hover:text-white/80 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-sm"
                    onClick={onManterLook}
                  >
                    Manter look atual
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
