import type { ElementType } from "react";
import { motion } from "motion/react";
import { Coins, Edit3, Image, Store, WandSparkles } from "lucide-react";
import { Button, Pill, Page, PageHeader } from "@/components";
import { AppShell } from "@/layouts/app-shell";
import { useMockSession } from "@/context/mock-session";

type ToolData = {
  id: string;
  title: string;
  description: string;
  icon: ElementType;
  cost: number | null;
  ctaLabel: string;
  footerLabel?: string;
  imageSrc?: string;
  poster?: string;
  action?: () => void;
};

export default function ToolsScreen() {
  const { credits, setCredits } = useMockSession();

  const tools: ToolData[] = [
    {
      id: "influencer-studio",
      title: "Influencer Studio",
      description: "Crie um influenciador virtual consistente.",
      icon: WandSparkles,
      cost: 30,
      ctaLabel: "Abrir",
      imageSrc: "/ia-card1.png",
    },
    {
      id: "editar-imagem",
      title: "Editar Imagem",
      description: "Retoque, expanda e ajuste seus ativos.",
      icon: Edit3,
      cost: 10,
      ctaLabel: "Abrir",
      imageSrc: "/ia-card2.png",
    },
    {
      id: "nano-banana",
      title: "Nano Banana Pro",
      description: "Gere imagens detalhadas por prompt.",
      icon: Image,
      cost: 20,
      ctaLabel: "Abrir",
      imageSrc: "/ia-card3.png",
    },
    {
      id: "store",
      title: "Store",
      description: "Recursos e ferramentas para sua operação.",
      icon: Store,
      cost: null,
      ctaLabel: "Abrir",
      footerLabel: "Explorar",
      imageSrc: "/ia-card4.png",
    },
  ];
  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="Ferramentas IA"
          title="Seu arsenal criativo"
          description="Recursos especializados para acelerar sua produção."
          actions={
            <>
              <Pill>
                <Coins className="size-3" />
                {credits} créditos
              </Pill>
              <Button size="sm" onClick={() => setCredits(100)}>
                Comprar créditos
              </Button>
            </>
          }
        />
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                key={tool.id}
                className="panel group relative flex flex-col overflow-hidden p-0 transition-all hover:shadow-[0_0_30px_rgba(109,91,245,0.15)] focus-within:ring-2 focus-within:ring-violet-500/50"
              >
                {/* Media Region (Portrait 3:4) */}
                <div className="relative aspect-[3/4] w-full overflow-hidden border-b border-white/5 bg-surface-2">
                  <div className="pointer-events-none absolute inset-0 z-10 ring-1 ring-inset ring-white/10" />

                  {tool.imageSrc ? (
                    <img
                      src={tool.imageSrc}
                      alt={`Capa da ferramenta ${tool.title}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-3 to-deep transition-transform duration-500 group-hover:scale-105">
                      <Icon className="size-16 text-violet-500/20" strokeWidth={1} />
                    </div>
                  )}

                  {/* Soft bottom gradient fading into the card body */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2 bg-gradient-to-t from-[#100f17] to-transparent" />
                </div>

                {/* Body */}
                <div className="relative flex flex-1 flex-col px-5 pb-5">
                  {/* Floating Icon Chip */}
                  <div className="absolute -top-6 left-5 z-20 flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-zinc-950/80 text-white shadow-xl backdrop-blur-md">
                    <Icon className="size-5 text-violet-400" />
                  </div>

                  <h2 className="mt-8 text-lg font-bold text-white leading-tight transition-colors group-hover:text-violet-50">
                    {tool.title}
                  </h2>
                  <p className="mt-1.5 line-clamp-2 text-sm text-text-2">
                    {tool.description}
                  </p>

                  {/* Stacked Footer */}
                  <div className="mt-auto pt-6 flex flex-col gap-3">
                    <div className="flex items-center">
                      <Pill>
                        {tool.cost !== null ? `${tool.cost} créditos` : tool.footerLabel}
                      </Pill>
                    </div>
                    <Button variant="secondary" onClick={tool.action} className="w-full focus:outline-none">
                      {tool.ctaLabel}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Page>
    </AppShell>
  );
}
