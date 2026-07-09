import { useState } from "react";
import type { ElementType } from "react";
import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Bell,
  BookOpen,
  Check,
  Clipboard,
  Coins,
  Download,
  Edit3,
  Image,
  LockKeyhole,
  Play,
  ShoppingBag,
  Sparkles,
  Store,
  Upload,
  Video,
  WandSparkles,
} from "lucide-react";
import { Button, MetricCard, Pill, SelectableCard } from "@/components/base/primitives";
import { Field, TextArea, Toggle } from "@/components/base/form-controls";
import { Page, PageHeader, SectionTitle } from "@/components/base/page";
import { AppShell } from "@/layouts/app-shell";
import { academyModules, prompts } from "@/mock/data";
import { Stepper } from "@/components/navigation/stepper";
import { useMockSession } from "@/lib/mock-session";

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

export function ToolsScreen() {
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
export function PromptsScreen() {
  const [tab, setTab] = useState("Todos");
  const [copied, setCopied] = useState("");
  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="Biblioteca"
          title="Galeria de Prompts"
          description="Estruturas prontas para vídeos, imagens e cenários."
        />
        <div className="mb-6 flex gap-2">
          {["Todos", "Vídeos", "Imagens", "Cenários"].map((t) => (
            <Pill key={t} active={tab === t} onClick={() => setTab(t)}>
              {t}
            </Pill>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {prompts
            .filter((p) => tab === "Todos" || p[1] === tab)
            .map(([title, type, text]) => (
              <div className="panel overflow-hidden" key={title}>
                <div className="grid aspect-video place-items-center bg-gradient-to-br from-surface-3 to-deep">
                  <Sparkles className="size-8 text-text-3" />
                </div>
                <div className="p-5">
                  <Pill>{type}</Pill>
                  <h2 className="mt-4 font-bold">{title}</h2>
                  <p className="mt-2 min-h-16 text-xs leading-5 text-text-2">{text}</p>
                  <Button
                    variant="secondary"
                    className="mt-4 w-full"
                    onClick={() => {
                      navigator.clipboard?.writeText(text);
                      setCopied(title);
                    }}
                  >
                    <Clipboard />
                    {copied === title ? "Copiado" : "Copiar Prompt"}
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </Page>
    </AppShell>
  );
}
export function EditorScreen() {
  const [step, setStep] = useState(0);
  const steps = ["Upload", "Enquadramento", "Texto", "Processar", "Download"];
  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="Lab Studio"
          title="TokEditor"
          description="Editor rápido para preparar vídeos verticais em cinco passos."
        />
        <Stepper steps={steps} current={step} />
        <div className="panel min-h-[380px] p-6">
          {step === 0 && (
            <button className="grid h-72 w-full place-items-center rounded-[18px] border border-dashed border-border bg-deep text-text-2">
              <span className="grid place-items-center gap-3">
                <Upload className="size-8" />
                <b>Enviar vídeos .mp4</b>
                <small>Máximo de 24s no total</small>
              </span>
            </button>
          )}
          {step === 1 && (
            <div className="grid gap-3 md:grid-cols-3">
              {["9:16 Vertical", "1:1 Quadrado", "4:5 Feed"].map((x, i) => (
                <SelectableCard title={x} selected={i === 0} key={x} />
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <Field label="Texto principal" placeholder="Digite o texto na tela" />
              <TextArea label="Legenda" placeholder="Escreva sua legenda..." />
            </div>
          )}
          {step === 3 && (
            <div className="grid min-h-72 place-items-center text-center">
              <div>
                <Sparkles className="mx-auto size-10 text-accent-300" />
                <h2 className="mt-4 text-xl font-bold">Pronto para processar</h2>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="grid min-h-72 place-items-center">
              <Button size="lg">
                <Download />
                Baixar vídeo
              </Button>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-between">
          <Button variant="ghost" onClick={() => setStep((v) => Math.max(0, v - 1))}>
            Voltar
          </Button>
          <Button onClick={() => setStep((v) => Math.min(4, v + 1))}>Continuar</Button>
        </div>
      </Page>
    </AppShell>
  );
}
export function AcademyScreen() {
  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="Creator Academy"
          title="Domine o método completo"
          description="18 aulas · 6 módulos"
          actions={<Pill active>PREMIUM</Pill>}
        />
        <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
          <div className="panel overflow-hidden">
            <div className="grid aspect-video place-items-center bg-deep">
              <button className="grid size-16 place-items-center rounded-full brand-gradient accent-glow">
                <Play fill="currentColor" />
              </button>
            </div>
            <div className="p-5">
              <h2 className="font-bold">Anatomia de um viral</h2>
              <p className="mt-1 text-xs text-text-2">Módulo 1 · Aula 2</p>
            </div>
          </div>
          <div className="panel p-4">
            <Accordion type="single" defaultValue="0" collapsible>
              {academyModules.map((m, i) => (
                <AccordionItem value={String(i)} key={m.title} className="border-border">
                  <AccordionTrigger className="text-sm">{m.title}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1">
                      {m.lessons.map((lesson, x) => (
                        <button
                          className={`flex w-full items-center gap-3 rounded-xl p-3 text-left text-xs ${i === 0 && x === 1 ? "bg-surface-3 text-text-1" : "text-text-2 hover:bg-surface-2"}`}
                          key={lesson}
                        >
                          <span className="grid size-6 place-items-center rounded-full border border-border">
                            {i === 0 && x === 0 ? (
                              <Check className="size-3 text-success" />
                            ) : (
                              <Play className="size-3" />
                            )}
                          </span>
                          {lesson}
                        </button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </Page>
    </AppShell>
  );
}
export function ReferralScreen() {
  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="Programa de indicação"
          title="Indique e Ganhe"
          description="Compartilhe sua página e receba 50% da comissão."
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="Indicações" value="48" icon={BookOpen} />
          <MetricCard label="Conversões" value="17" icon={ShoppingBag} />
          <MetricCard label="Comissão" value="R$ 1.284" tone="green" icon={Coins} />
        </div>
        <div className="panel mt-5 p-6">
          <SectionTitle title="Seu link e cupom" />
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              readOnly
              value="https://exemplo.com/r/MARINA50"
              className="h-11 flex-1 rounded-xl border border-border bg-deep px-4 text-sm text-text-2"
            />
            <Button>
              <Clipboard />
              Copiar link
            </Button>
          </div>
          <p className="mt-4 text-sm text-text-2">
            Divisão de comissão:{" "}
            <strong className="text-text-1">50% para você · 50% para a operação</strong>
          </p>
        </div>
        <div className="panel mt-5 p-6">
          <SectionTitle title="Página de divulgação personalizada" />
          <Field label="Título da página" defaultValue="Minha central de criação favorita" />
          <TextArea
            label="Mensagem"
            defaultValue="Crie conteúdo para TikTok Shop com mais estratégia e velocidade."
          />
          <Button variant="secondary" className="mt-4">
            Salvar página
          </Button>
        </div>
      </Page>
    </AppShell>
  );
}
export function SettingsScreen() {
  const { credits, setCredits, notificationsEnabled, setNotificationsEnabled } = useMockSession();
  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="Conta"
          title="Créditos, Limites e Configurações"
          description="Controle seu perfil e preferências locais."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="panel p-6">
            <SectionTitle
              title="Créditos"
              action={
                <Pill>
                  <Coins className="size-3" />
                  {credits}
                </Pill>
              }
            />
            <p className="text-sm text-text-2">
              Use créditos em ferramentas premium e gerações adicionais.
            </p>
            <Button className="mt-5" onClick={() => setCredits(credits + 100)}>
              Comprar 100 créditos
            </Button>
          </div>
          <div className="panel p-6">
            <SectionTitle title="Limite mensal" />
            <div className="flex justify-between text-sm">
              <span className="text-text-2">Gerações grátis</span>
              <b>2 de 3</b>
            </div>
            <div className="mt-3 h-2 rounded-full bg-surface-3">
              <div className="brand-gradient h-full w-2/3 rounded-full" />
            </div>
          </div>
          <div className="panel p-6">
            <SectionTitle title="Perfil" />
            <div className="space-y-4">
              <Field label="Nome" defaultValue="Marina Rocha" />
              <Field label="E-mail" defaultValue="marina@exemplo.com" />
              <Button variant="secondary">Salvar alterações</Button>
            </div>
          </div>
          <div className="panel p-6">
            <SectionTitle title="Preferências" />
            <div className="space-y-5">
              <div className="flex justify-between">
                <span className="text-sm">Notificações</span>
                <Toggle checked={notificationsEnabled} onChange={setNotificationsEnabled} />
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Tema escuro</span>
                <Toggle checked onChange={() => { }} />
              </div>
            </div>
          </div>
        </div>
      </Page>
    </AppShell>
  );
}
