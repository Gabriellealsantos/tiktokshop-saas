import { useEffect, useRef } from "react";
import { Radio } from "lucide-react";
import { AnimatePresence, motion, animate } from "motion/react";
import type { LiveSaleEventDTO } from "@/models/dashboard";

interface LiveSalesProps {
  sales: LiveSaleEventDTO[];
  total: number;
}

export function LiveSales({ sales = [], total = 0 }: LiveSalesProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (node) {
      const safeTotal = total ?? 0;
      const start = parseFloat(node.dataset.value || safeTotal.toString());
      node.dataset.value = safeTotal.toString();
      const controls = animate(start, safeTotal, {
        duration: 0.8,
        onUpdate: (v) => {
          node.textContent = `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
      });
      return () => controls.stop();
    }
  }, [total]);

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 bg-dash-surface backdrop-blur-2xl backdrop-saturate-150 border border-dash-border shadow-[0_8px_32px_-8px_oklch(0_0_0/0.5),inset_0_1px_0_0_oklch(1_0_0/0.10)] duration-200 before:absolute before:inset-0 before:pointer-events-none before:bg-dash-tint after:absolute after:inset-0 after:pointer-events-none after:bg-linear-to-b after:from-white/[0.07] after:via-transparent after:to-transparent">
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-danger/20 bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger transition-all">
          <motion.span
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="size-1.5 rounded-full bg-current"
          />
          <Radio className="size-3" />
          LIVE
        </div>
        <h3 className="mt-5 text-lg font-bold">Vendas ao Vivo</h3>
        <p className="mt-1 text-xs text-text-2">Atualização em tempo real</p>
        <div
          ref={nodeRef}
          data-value={(total ?? 0).toString()}
          className="my-8 text-4xl font-extrabold tabular-nums text-success"
        >
          R$ {(total ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="relative max-h-[160px] overflow-hidden [mask-image:linear-gradient(to_bottom,white_60%,transparent_100%)]">
          <AnimatePresence initial={false}>
            {sales.map((sale) => (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex justify-between border-t border-border py-3 text-xs"
              >
                <span className="text-text-2">{sale.productName}</span>
                <span className="text-success">+ R$ {sale.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
