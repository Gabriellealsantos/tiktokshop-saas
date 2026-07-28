import { useState } from "react";
import { useParams } from "react-router-dom";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button, LoadingScreen, Stepper, Page, PageHeader } from "@/components";
import { AppShell } from "@/layouts/app-shell";

import { configs } from "./data";
import { ProductStep } from "./components/step-product";
import { OriginalStep } from "./components/step-original";
import { PovStep } from "./components/step-pov";
import { CinemaStep } from "./components/step-cinema";
import { CreationFinal } from "./components/step-final";

export default function StudioRoute() {
  const { format } = useParams();
  return <CreationWizard format={format ?? ""} />;
}

function CreationWizard({ format }: { format: string }) {
  const key = format in configs ? (format as keyof typeof configs) : "original";
  const config = configs[key];
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [takes, setTakes] = useState(1);
  const [selected, setSelected] = useState(0);

  const advance = () => {
    if (step >= config.steps.length - 1) return;
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setStep((value) => value + 1);
    }, 950);
  };

  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="Estúdio de criação"
          title={config.title}
          description="Configure cada detalhe e leve seus ativos para a ferramenta de vídeo."
        />
        <Stepper steps={config.steps} current={step} />
        {loading ? (
          <LoadingScreen
            title={
              step === config.steps.length - 2
                ? "Preparando seus ativos..."
                : "Salvando suas escolhas..."
            }
          />
        ) : (
          <AnimatePresence>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && (
                <ProductStep selected={selected} setSelected={setSelected} />
              )}{" "}
              {step > 0 && step === config.steps.length - 1 && (
                <CreationFinal takes={takes} />
              )}
              {step > 0 &&
                step < config.steps.length - 1 &&
                (key === "original" ? (
                  <OriginalStep step={step} takes={takes} setTakes={setTakes} />
                ) : key === "imersivo" ? (
                  <PovStep step={step} takes={takes} setTakes={setTakes} />
                ) : (
                  <CinemaStep step={step} />
                ))}
            </motion.div>
          </AnimatePresence>
        )}{" "}
        {!loading && step < config.steps.length - 1 && (
          <div className="mt-7 flex justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep((value) => Math.max(0, value - 1))}
            >
              Voltar
            </Button>
            <Button onClick={advance}>
              Continuar <Check />
            </Button>
          </div>
        )}
      </Page>
    </AppShell>
  );
}
