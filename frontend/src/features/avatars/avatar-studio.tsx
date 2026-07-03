import { useState } from "react";
import { Download, History, ImagePlus, RotateCcw, Save, Sparkles } from "lucide-react";
import { Button, LoadingScreen, Pill, SelectableCard } from "@/components/base/primitives";
import { Field, TextArea } from "@/components/base/form-controls";
import { Page, PageHeader, SectionTitle } from "@/components/base/page";
import { Stepper } from "@/components/navigation/stepper";
import { AppShell } from "@/layouts/app-shell";
import { avatars } from "@/mock/data";

const steps = ["Básico", "Pele & Cabelo", "Estilo & Cenário", "Finalizar"];
export function AvatarStudio() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(false);
  const [chosen, setChosen] = useState(0);
  const next = () => {
    if (step === 3) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setResult(true);
      }, 1200);
    } else setStep((v) => v + 1);
  };
  if (result) return <AvatarResult chosen={chosen} setChosen={setChosen} />;
  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="Meus Avatares"
          title="Criar Avatar IA"
          description="Construa um modelo visual consistente para seus conteúdos."
          actions={
            <Button variant="secondary">
              <History />
              Histórico
            </Button>
          }
        />
        <Stepper steps={steps} current={step} />
        {loading ? (
          <LoadingScreen
            title="Gerando duas variações..."
            subtitle="Construindo identidade, pele, cabelo e cenário"
          />
        ) : (
          <div className="space-y-7">
            {step === 0 && (
              <>
                <button className="grid min-h-36 w-full place-items-center rounded-[20px] border border-dashed border-border bg-surface-1 text-sm text-text-2 hover:border-accent-400/40">
                  <span className="grid place-items-center gap-2">
                    <ImagePlus />
                    Imagem de referência opcional
                  </span>
                </button>
                <Options title="Gênero" items={["Feminino", "Masculino"]} />
                <Options title="Idade" items={["Jovem 18–24", "Adulto 25–35", "Maduro 36–50"]} />
                <Options
                  title="Tipo físico"
                  items={["Magro(a)", "Atlético(a)", "Curvy", "Plus Size"]}
                />
              </>
            )}
            {step === 1 && (
              <>
                <Options title="Tom de pele" items={["Clara", "Parda", "Negra", "Asiática"]} />
                <Options
                  title="Estilo de cabelo"
                  items={["Curto", "Médio", "Longo", "Careca", "Afro", "Cacheado"]}
                />
                <Options
                  title="Cor do cabelo"
                  items={["Preto", "Castanho", "Loiro", "Ruivo", "Grisalho", "Rosa"]}
                />
              </>
            )}
            {step === 2 && (
              <>
                <Options
                  title="Tipo de foto / câmera"
                  items={[
                    "Selfie / Rosto",
                    "Meio Corpo",
                    "Corpo Inteiro",
                    "Perfil / Lateral",
                    "De Costas",
                  ]}
                />
                <Options
                  title="Roupa / estética"
                  items={["Casual", "Luxo", "Streetwear", "Fitness", "Corporativo"]}
                />
                <Field label="Detalhes da roupa" placeholder="Ex.: blazer preto minimalista" />
                <Options
                  title="Cenário de fundo"
                  items={["Estúdio", "Natureza", "Urbano", "Casa"]}
                />
              </>
            )}
            {step === 3 && (
              <>
                <TextArea
                  label="Detalhes extras (opcional)"
                  placeholder="Expressão, acessórios, luz..."
                />
                <div className="panel p-5">
                  <div className="flex justify-between text-sm">
                    <span>Tentativas grátis</span>
                    <strong>2/3</strong>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-3">
                    <div className="brand-gradient h-full w-2/3" />
                  </div>
                  <p className="mt-2 text-xs text-text-2">
                    Você ainda tem 1 tentativa grátis este mês.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
        {!loading && (
          <div className="mt-7 flex justify-between">
            <Button variant="ghost" onClick={() => setStep((v) => Math.max(0, v - 1))}>
              Voltar
            </Button>
            <Button onClick={next}>
              {step === 3 ? (
                <>
                  <Sparkles />
                  Gerar Modelo IA
                </>
              ) : (
                "Continuar"
              )}
            </Button>
          </div>
        )}
      </Page>
    </AppShell>
  );
}
function Options({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <SectionTitle title={title} />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((i, x) => (
          <SelectableCard compact key={i} title={i} selected={x === 0} />
        ))}
      </div>
    </div>
  );
}
function AvatarResult({ chosen, setChosen }: { chosen: number; setChosen: (v: number) => void }) {
  const [saved, setSaved] = useState(false);
  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="Resultado"
          title={saved ? "Seu Modelo IA" : "Escolha sua variação"}
          description={
            saved
              ? "O modelo está pronto para seus próximos projetos."
              : "Toque na versão favorita para continuar."
          }
        />
        {!saved ? (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              {avatars.slice(2, 4).map((a, i) => (
                <button
                  onClick={() => setChosen(i)}
                  key={a.id}
                  className={`overflow-hidden rounded-[24px] border bg-surface-1 ${chosen === i ? "border-accent-400/50" : "border-border"}`}
                >
                  <img src={a.image} alt={a.name} className="aspect-[4/3] w-full object-cover" />
                  <div className="p-4 text-sm font-semibold">Variação {i + 1}</div>
                </button>
              ))}
            </div>
            <Button className="mt-6" onClick={() => setSaved(true)}>
              Usar variação {chosen + 1}
            </Button>
          </>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
            <img
              src={avatars[chosen + 2].image}
              alt="Avatar gerado"
              className="aspect-[4/3] w-full rounded-[24px] object-cover"
            />
            <div className="panel p-6">
              <Pill active>MODELO PRONTO</Pill>
              <Field label="Nome do avatar" defaultValue="Minha Creator IA" className="mt-5" />
              <div className="mt-6 flex flex-wrap gap-2">
                <Button>
                  <Save />
                  Salvar no Estúdio e Arsenal
                </Button>
                <Button variant="secondary">
                  <Download />
                  Baixar
                </Button>
                <Button variant="ghost">
                  <RotateCcw />
                  Gerar Novo
                </Button>
              </div>
            </div>
          </div>
        )}
      </Page>
    </AppShell>
  );
}
