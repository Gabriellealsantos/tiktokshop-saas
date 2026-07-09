import { useState } from "react";
import { Download, History, ImagePlus, RotateCcw, Save, Sparkles, ClipboardCheck, Camera, Cake, Palette, Accessibility, Scissors, Shirt, Users, Image as ImageIcon } from "lucide-react";
import { Button, LoadingScreen, Pill, SelectableCard } from "@/components/base/primitives";
import { Field, TextArea } from "@/components/base/form-controls";
import { Page, PageHeader, SectionTitle } from "@/components/base/page";
import { Stepper } from "@/components/navigation/stepper";
import { AppShell } from "@/layouts/app-shell";
import { OptionImageCard } from "@/features/creation/creation-studio";
import { avatars } from "@/mock/data";

const steps = ["Básico", "Pele & Cabelo", "Estilo & Cenário", "Finalizar"];
export function AvatarStudio() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(false);
  const [chosen, setChosen] = useState(0);
  const [gender, setGender] = useState("Feminino");
  const [bodyType, setBodyType] = useState("Magro(a)");
  const [skinTone, setSkinTone] = useState("Clara");
  const [hairColor, setHairColor] = useState("Preto");
  const [photoType, setPhotoType] = useState("Selfie / Rosto");
  const [background, setBackground] = useState("Estúdio");
  const [age, setAge] = useState("Jovem 18–24");
  const [hairStyle, setHairStyle] = useState("Curto");
  const [clothing, setClothing] = useState("Casual");
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
                <div>
                  <SectionTitle title="Gênero" />
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
                    {["Feminino", "Masculino"].map((g) => (
                      <OptionImageCard
                        key={g}
                        title={g}
                        imageSlug={`genero-${g.toLowerCase()}`}
                        selected={gender === g}
                        onClick={() => setGender(g)}
                      />
                    ))}
                  </div>
                </div>
                <Options title="Idade" items={["Jovem 18–24", "Adulto 25–35", "Maduro 36–50"]} value={age} onChange={setAge} />
                <div>
                  <SectionTitle title="Tipo físico" />
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-4">
                    {["Magro(a)", "Atlético(a)", "Curvy", "Plus Size"].map((t) => {
                      const typeSlug = t === "Magro(a)" ? "magro" : t === "Atlético(a)" ? "atletico" : t === "Curvy" ? "curvy" : "plus-size";
                      const finalSlug = `${typeSlug}-${gender.toLowerCase()}`;
                      
                      return (
                        <OptionImageCard
                          key={t}
                          title={t}
                          imageSlug={finalSlug}
                          selected={bodyType === t}
                          onClick={() => setBodyType(t)}
                        />
                      );
                    })}
                  </div>
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <div>
                  <SectionTitle title="Tom de pele" />
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-4">
                    {[
                      { name: "Clara", slug: "pele-clara", color: "#F1C9A5" },
                      { name: "Parda", slug: "pele-parda", color: "#C68642" },
                      { name: "Negra", slug: "pele-negra", color: "#6B4226" },
                      { name: "Asiática", slug: "pele-asiatica", color: "#E8C39E" }
                    ].map((s) => (
                      <OptionImageCard
                        compact
                        key={s.name}
                        title={s.name}
                        imageSlug={s.slug}
                        fallbackColor={s.color}
                        selected={skinTone === s.name}
                        onClick={() => setSkinTone(s.name)}
                      />
                    ))}
                  </div>
                </div>
                <Options
                  title="Estilo de cabelo"
                  items={["Curto", "Médio", "Longo", "Careca", "Afro", "Cacheado"]}
                  value={hairStyle}
                  onChange={setHairStyle}
                />
                <div>
                  <SectionTitle title="Cor do cabelo" />
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                    {[
                      { name: "Preto", slug: "cabelo-preto", color: "#1A1A1A" },
                      { name: "Castanho", slug: "cabelo-castanho", color: "#6B4226" },
                      { name: "Loiro", slug: "cabelo-loiro", color: "#E6C67A" },
                      { name: "Ruivo", slug: "cabelo-ruivo", color: "#B55239" },
                      { name: "Grisalho", slug: "cabelo-grisalho", color: "#B8B8B8" },
                      { name: "Rosa", slug: "cabelo-rosa", color: "#E56AA0" }
                    ].map((c) => (
                      <OptionImageCard
                        compact
                        key={c.name}
                        title={c.name}
                        imageSlug={c.slug}
                        fallbackColor={c.color}
                        selected={hairColor === c.name}
                        onClick={() => setHairColor(c.name)}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div>
                  <SectionTitle title="Tipo de foto / câmera" />
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-4">
                    {[
                      { name: "Selfie / Rosto", slug: "foto-selfie" },
                      { name: "Meio Corpo", slug: "foto-meio-corpo" },
                      { name: "Corpo Inteiro", slug: "foto-corpo-inteiro" },
                      { name: "Perfil / Lateral", slug: "foto-perfil" },
                      { name: "De Costas", slug: "foto-de-costas" }
                    ].map((p) => (
                      <OptionImageCard
                        compact
                        key={p.name}
                        title={p.name}
                        imageSlug={p.slug}
                        fallbackColor="linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(109,91,245,0.3) 100%)"
                        showFallbackIcon
                        selected={photoType === p.name}
                        onClick={() => setPhotoType(p.name)}
                      />
                    ))}
                  </div>
                </div>
                <Options
                  title="Roupa / estética"
                  items={["Casual", "Luxo", "Streetwear", "Fitness", "Corporativo"]}
                  value={clothing}
                  onChange={setClothing}
                />
                <Field label="Detalhes da roupa" placeholder="Ex.: blazer preto minimalista" />
                <div>
                  <SectionTitle title="Cenário de fundo" />
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-4">
                    {[
                      { name: "Academia", slug: "academia" },
                      { name: "Ar livre", slug: "ar-livre" },
                      { name: "Banheiro", slug: "banheiro" },
                      { name: "Cozinha", slug: "cozinha" },
                      { name: "Escritório", slug: "escritorio" },
                      { name: "Estúdio", slug: "estudio" },
                      { name: "Loja", slug: "loja" },
                      { name: "Natureza", slug: "natureza" },
                      { name: "Quarto", slug: "quarto" }
                    ].map((c) => (
                      <OptionImageCard
                        compact
                        key={c.name}
                        title={c.name}
                        imageSlug={c.slug}
                        selected={background === c.name}
                        onClick={() => setBackground(c.name)}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <TextArea
                  label="Detalhes extras (opcional)"
                  placeholder="Expressão, acessórios, luz..."
                  className="glass-surface bg-transparent hover:border-white/10"
                />
                <div className="glass-surface p-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <span className="grid size-7 place-items-center rounded-full bg-accent-500/15 text-accent-400">
                      <ClipboardCheck className="size-4" />
                    </span>
                    <h3 className="text-sm font-semibold text-text-1">Resumo do avatar</h3>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {gender && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-400/40 bg-accent-500/15 px-3 py-1.5 text-xs font-medium text-accent-300">
                        <Users className="size-3.5" /> {gender}
                      </span>
                    )}
                    {age && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-400/40 bg-accent-500/15 px-3 py-1.5 text-xs font-medium text-accent-300">
                        <Cake className="size-3.5" /> {age}
                      </span>
                    )}
                    {bodyType && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-400/40 bg-accent-500/15 px-3 py-1.5 text-xs font-medium text-accent-300">
                        <Accessibility className="size-3.5" /> {bodyType}
                      </span>
                    )}
                    {skinTone && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-400/40 bg-accent-500/15 px-3 py-1.5 text-xs font-medium text-accent-300">
                        <Palette className="size-3.5" /> {skinTone}
                      </span>
                    )}
                    {(hairStyle || hairColor) && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-400/40 bg-accent-500/15 px-3 py-1.5 text-xs font-medium text-accent-300">
                        <Scissors className="size-3.5" /> {[hairStyle, hairColor].filter(Boolean).join(" · ")}
                      </span>
                    )}
                    {clothing && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-400/40 bg-accent-500/15 px-3 py-1.5 text-xs font-medium text-accent-300">
                        <Shirt className="size-3.5" /> {clothing}
                      </span>
                    )}
                    {photoType && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-400/40 bg-accent-500/15 px-3 py-1.5 text-xs font-medium text-accent-300">
                        <Camera className="size-3.5" /> {photoType}
                      </span>
                    )}
                    {background && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-400/40 bg-accent-500/15 px-3 py-1.5 text-xs font-medium text-accent-300">
                        <ImageIcon className="size-3.5" /> {background}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {!loading && (
          step === 3 ? (
            <div className="mt-8 flex flex-col lg:flex-row items-center justify-between gap-6 glass-surface p-5 lg:p-5 lg:pl-6 rounded-[24px] shadow-[0_16px_40px_-12px_rgba(139,92,246,0.15)]" style={{ background: "linear-gradient(120deg, rgba(139,92,246,0.14), rgba(139,92,246,0.06))", borderColor: "rgba(167,139,250,0.3)" }}>
              <div className="flex items-center gap-4 w-full text-left">
                <div className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent-400 to-accent-600 text-white shadow-lg">
                  <Sparkles className="size-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-text-1">Tudo pronto para gerar</h3>
                  <p className="text-xs sm:text-sm text-text-2 mt-0.5 max-w-[320px]">Seu modelo consistente será criado a partir das escolhas acima.</p>
                </div>
              </div>
              
              <div className="flex w-full lg:w-auto flex-col-reverse sm:flex-row items-center gap-3">
                <Button variant="ghost" onClick={() => setStep((v) => Math.max(0, v - 1))} className="text-text-2 hover:text-text-1 w-full sm:w-auto px-6">
                  Voltar
                </Button>
                <Button 
                  onClick={next}
                  className="w-full sm:w-auto bg-accent-500 hover:bg-accent-600 text-white shadow-[0_0_24px_-6px_rgba(109,91,245,0.5)] px-8 h-12 rounded-xl font-bold"
                >
                  <Sparkles className="mr-2 size-5" />
                  Gerar Modelo IA
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-7 flex justify-between">
              <Button variant="ghost" onClick={() => setStep((v) => Math.max(0, v - 1))} className="text-text-2 hover:text-text-1">
                Voltar
              </Button>
              <Button onClick={next}>
                Continuar
              </Button>
            </div>
          )
        )}
      </Page>
    </AppShell>
  );
}
function Options({ title, items, value, onChange }: { title: string; items: string[]; value?: string; onChange?: (v: string) => void }) {
  return (
    <div>
      <SectionTitle title={title} />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((i, x) => (
          <SelectableCard compact key={i} title={i} selected={value ? value === i : x === 0} onClick={() => onChange?.(i)} />
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
