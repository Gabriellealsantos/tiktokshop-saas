import { useState } from "react";
import { Download, Sparkles, Upload } from "lucide-react";
import { Button, SelectableCard, Field, TextArea, Page, PageHeader, Stepper } from "@/components";
import { AppShell } from "@/layouts/app-shell";

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
