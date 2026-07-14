import { useState } from "react";
import { Clipboard, Sparkles } from "lucide-react";
import { Button, Pill, Page, PageHeader } from "@/components";
import { AppShell } from "@/layouts/app-shell";
import { prompts } from "./-data";

export default function PromptsScreen() {
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
