import { useState, useEffect } from "react";
import { Check, Image as ImageIcon, Bot, Copy, Download, ExternalLink, Sparkles } from "lucide-react";
import { cn } from "@/utils/utils";
import { Pill, SelectableCard } from "@/components/primitives";
import { Button } from "@/components/button";
import { TextArea } from "@/components/form-controls";
import { takeOptions, voiceTones, finalPrompt } from "@/utils/constants";

export const toSlug = (text: string) => {
  const map: Record<string, string> = {
    "De Frente": "de-frente",
    "Mais Próximo": "mais-proximo",
    "Corpo Completo": "corpo-completo",
    "Automático": "automatico",
    "Quarto": "quarto",
    "Estúdio": "estudio",
    "Ao ar livre": "ar-livre",
    "Academia": "academia",
    "Cozinha": "cozinha",
    "Escritório": "escritorio",
    "Banheiro": "banheiro",
    "Loja": "loja",
    "Natureza": "natureza",
    "Personalizado": "personalizado",
    "UGC Natural": "ugc-natural",
    "Hook TikTok": "hook-tiktok",
    "Mostrar o Produto": "mostrar-produto",
    "Review": "review",
    "Natural": "natural",
    "Mais Expressivo": "expressivo",
    "Mais Discreto": "discreto",
    "Traição": "traicao",
    "Drama Familiar": "drama-familiar",
    "Vida na Favela": "vida-na-favela",
    "Fofoca / Barraco": "fofoca",
    "Romance Proibido": "romance-proibido",
    "Vingança": "vinganca",
    "Superação": "superacao",
    "Mistério": "misterio",
    "Bancada de Mármore": "bancada-marmore",
    "Setup Gamer": "setup-gamer",
    "Mesa de Escritório": "mesa-escritorio",
    "Closet Maquiagem": "closet-maquiagem",
    "Unboxing Madeira": "umboxing-madeira",
    "De Lado": "de-lado",
    "Ângulo 3/4": "3-4",
    "Sentado(a)": "sentado",
    "Andando": "andando",
    "Maçã": "maca",
    "Tábua de Corte": "tabua-de-corte",
    "Xícara": "xicara"
  };
  return map[text] || text.toLowerCase().replace(/ /g, '-');
};

export function OptionImageCard({ title, imageSlug, selected, onClick, compact, fallbackColor, showFallbackIcon }: { title: string; imageSlug?: string; selected: boolean; onClick: () => void; compact?: boolean; fallbackColor?: string; showFallbackIcon?: boolean }) {
  const [imgError, setImgError] = useState(false);
  const slug = imageSlug || toSlug(title);
  const imageSrc = `/${slug}.png`;

  useEffect(() => {
    setImgError(false);
  }, [imageSrc]);

  return (
    <div
      onClick={onClick}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "glass-surface is-interactive group relative overflow-hidden rounded-[14px] cursor-pointer text-left transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
        selected && "border-accent-400/50 shadow-[0_0_0_2px_rgba(139,124,255,.12),0_0_20px_-4px_rgba(109,91,245,0.4)]"
      )}
    >
      <div className={cn("w-full bg-deep relative", compact ? "aspect-[4/3]" : "aspect-[4/3]")}>
        {!imgError ? (
          <img
            src={imageSrc}
            alt={title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : fallbackColor ? (
          <div className="h-full w-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105" style={{ background: fallbackColor }}>
            {showFallbackIcon && <ImageIcon className="mb-2 size-6 text-white/50" />}
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-surface-2 to-surface-3">
            <ImageIcon className="mb-2 size-6 text-text-3" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>
      <div className={cn("absolute bottom-0 inset-x-0 flex items-center justify-between bg-surface-2/80 backdrop-blur-md", compact ? "p-2" : "p-2.5")}>
        <span className={cn("font-semibold text-text-1", compact ? "text-[10px] sm:text-xs" : "text-xs")}>{title}</span>
      </div>
      {selected && (
        <span className={cn("brand-gradient accent-glow absolute right-2 top-2 grid place-items-center rounded-full", compact ? "size-5" : "size-6")}>
          <Check className={cn("text-primary-foreground", compact ? "size-3" : "size-3.5")} />
        </span>
      )}
    </div>
  );
}

export function OptionTextCard({
  title,
  description,
  icon: Icon,
  selected,
  onClick
}: {
  title: string;
  description: string;
  icon: any;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "glass-surface is-interactive group relative rounded-[14px] p-[15px] cursor-pointer text-left transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-accent-500 hover:-translate-y-0.5 flex flex-col gap-3",
        selected
          ? "border-accent-400/50 shadow-[0_0_0_2px_rgba(139,124,255,.12),0_0_20px_-4px_rgba(109,91,245,0.4)]"
          : "border-white/10 hover:border-white/20"
      )}
    >
      <div className="flex size-8 items-center justify-center rounded-[8px] bg-accent-500/15 text-accent-300">
        <Icon className="size-4" />
      </div>
      <div>
        <div className="font-semibold text-text-1 text-[13.5px] tracking-tight mb-0.5">{title}</div>
        <div className="text-[12.5px] text-white/55 line-clamp-1 leading-snug">{description}</div>
      </div>
      {selected && (
        <span className="brand-gradient accent-glow absolute right-3 top-3 grid place-items-center rounded-full size-5">
          <Check className="text-primary-foreground size-3" />
        </span>
      )}
    </div>
  );
}

export function TakesSelector({
  value,
  onChange,
  options = takeOptions,
}: {
  value: number;
  onChange: (value: number) => void;
  options?: { takes: number; seconds: number }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {options.map((option) => (
        <SelectableCard
          key={option.takes}
          compact
          title={`${option.takes} take${option.takes > 1 ? "s" : ""}`}
          description={`${option.seconds}s de vídeo`}
          selected={value === option.takes}
          onClick={() => onChange(option.takes)}
        />
      ))}
    </div>
  );
}

export function VoiceConfig() {
  const [gender, setGender] = useState("Feminino");
  const [tone, setTone] = useState("Natural");
  const [energy, setEnergy] = useState("Média");
  return (
    <div className="glass-surface grid gap-5 p-5 md:grid-cols-3">
      <Choice
        label="Gênero"
        options={["Feminino", "Masculino"]}
        value={gender}
        setValue={setGender}
      />
      <Choice label="Tonalidade" options={voiceTones.slice(0, 3)} value={tone} setValue={setTone} />
      <Choice
        label="Energia"
        options={["Baixa", "Média", "Alta"]}
        value={energy}
        setValue={setEnergy}
      />
    </div>
  );
}
function Choice({
  label,
  options,
  value,
  setValue,
}: {
  label: string;
  options: string[];
  value: string;
  setValue: (value: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-white/50">{label}</p>
      <div className="flex rounded-full bg-white/[0.04] border border-white/[0.08] p-1.5" role="radiogroup">
        {options.map((option) => {
          const isActive = value === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setValue(option)}
              className={cn(
                "flex-1 rounded-full py-2 text-[13px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
                isActive
                  ? "brand-gradient text-white shadow-[0_0_12px_-2px_rgba(109,91,245,0.5)]"
                  : "text-white/55 hover:text-white hover:bg-white/5"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TakeEditor({ count = 1 }: { count?: number }) {
  const [texts, setTexts] = useState<string[]>(["Você ainda está ignorando o detalhe que muda tudo neste produto."]);

  useEffect(() => {
    setTexts((prev) => {
      if (prev.length === count) return prev;
      if (prev.length < count) {
        const newArr = [...prev];
        while (newArr.length < count) newArr.push("");
        return newArr;
      }
      return prev.slice(0, count);
    });
  }, [count]);

  const fill = () =>
    setTexts(
      texts.map(
        (_, i) =>
          [
            "Pare de rolar: isso resolve um problema que quase ninguém percebe.",
            "Olha de perto a textura e como ele funciona sem esforço.",
            "Eu testei por sete dias e esse foi o resultado que me surpreendeu.",
            "Se você quer praticidade, aproveita enquanto ainda está disponível.",
            "Salva este vídeo porque você vai querer lembrar depois.",
          ][i % 5],
      ),
    );
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-2">
          {texts.filter(Boolean).length} de {count} takes com fala personalizada
        </p>
        <Button variant="secondary" size="sm" onClick={fill}>
          <Bot />
          Preencher com IA
        </Button>
      </div>
      {texts.map((text, index) => (
        <div key={index} className="glass-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <Pill active>
              {index === 0
                ? "HOOK + TENSÃO"
                : index === count - 1 && count > 1
                  ? "LOOP FINAL"
                  : `TAKE ${index + 1}`}
            </Pill>
            <span
              className={cn(
                "text-[11px] tabular-nums",
                text.split(" ").filter(Boolean).length > 20 ? "text-danger" : "text-text-3",
              )}
            >
              {text.split(" ").filter(Boolean).length}/20 palavras
            </span>
          </div>
          <TextArea
            label=""
            value={text}
            onChange={(event) =>
              setTexts((current) =>
                current.map((item, i) => (i === index ? event.target.value : item)),
              )
            }
            placeholder="Escreva a fala deste take..."
            className="min-h-20 bg-white/5 border-white/10"
          />
        </div>
      ))}
    </div>
  );
}

export function PromptResult({
  title = "Resultado pronto para o Flow",
  objectMode = false,
}: {
  title?: string;
  objectMode?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-5">
      <div className="glass-surface p-6">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <Pill active>
              <Sparkles />
              PRONTO
            </Pill>
            <h2 className="mt-4 text-2xl font-bold text-text-1">{title}</h2>
            <p className="mt-2 text-sm text-text-2">
              Prompts técnicos e sequência preparados para produção externa.
            </p>
          </div>
          {objectMode && (
            <Button variant="secondary" size="icon">
              <Download />
            </Button>
          )}
        </div>
        <div className="rounded-[14px] border border-white/10 bg-white/5 p-4 font-mono text-xs leading-6 text-text-2">
          {finalPrompt}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={() => {
              navigator.clipboard?.writeText(finalPrompt);
              setCopied(true);
            }}
          >
            <Copy />
            {copied ? "Copiado" : "Copiar prompt"}
          </Button>
          <Button variant="secondary">
            <ExternalLink />
            Abrir Flow VEO3
          </Button>
          <Button variant="secondary" onClick={() => {/* TODO: definir destino do Nano Banana */}}>
            <ExternalLink />
            Abrir Nano Banana
          </Button>
          <Button variant="secondary" onClick={() => {/* TODO: definir destino do Grok */}}>
            <ExternalLink />
            Abrir Grok
          </Button>
        </div>
      </div>
      <div className="glass-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-3">
          Hashtags sugeridas
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["#tiktokshop", "#achadinhos", "#viralizou", "#paravoce", "#reviewreal"].map((tag) => (
            <Pill key={tag}>{tag}</Pill>
          ))}
        </div>
      </div>
    </div>
  );
}
