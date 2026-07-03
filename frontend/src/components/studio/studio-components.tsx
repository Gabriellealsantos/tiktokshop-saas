import { useState, useEffect } from "react";
import { Bot, Copy, Download, ExternalLink, Sparkles } from "lucide-react";
import { Button, Pill, SelectableCard } from "@/components/base/primitives";
import { TextArea } from "@/components/base/form-controls";
import { takeOptions, voiceTones, finalPrompt } from "@/lib/constants";
import { cn } from "@/lib/utils";

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
