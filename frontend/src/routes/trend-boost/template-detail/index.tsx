import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Image as ImageIcon } from "lucide-react";
import { Page } from "@/components/page";
import { AppShell } from "@/layouts/app-shell";
import { cn } from "@/utils/utils";
import { TrendHeader } from "../components/trend-header";
import { trendTemplates } from "../components/trend-data";

export default function RouteComponent() {
  const { template: templateId = "" } = useParams();
  const template = trendTemplates[templateId];

  if (!template) {
    return (
      <AppShell>
        <Page className="pt-0 flex flex-col items-center justify-center min-h-[50vh]">
          <p className="text-text-2 mb-4">Template não encontrado.</p>
          <Link to="/trend-boost" className="text-brand-400 hover:underline">
            Voltar para templates
          </Link>
        </Page>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Page className="pt-0 pb-20">
        <div className="mb-6 max-w-6xl mx-auto">
          <Link
            to="/trend-boost"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-2 hover:text-white transition-colors"
          >
            <ChevronLeft className="size-4" />
            Voltar
          </Link>
        </div>

        <TrendHeader
          title={template.title}
          subtitle={template.subtitle}
          description="Selecione uma opção abaixo para continuar a geração."
          titleHighlight=""
        />

        <div className="mx-auto max-w-6xl mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
          {template.characters.map((char) => {
            return (
              <Link
                key={char.id}
                to={`/trend-boost/${templateId}/${char.id}`}
                className="group relative w-full text-left outline-none block cursor-pointer"
              >
                <div
                  className={cn(
                    "relative w-full aspect-[9/16] rounded-xl transition-all duration-300",
                    "group-hover:-translate-y-1 group-hover:shadow-[0_10px_30px_-10px_rgba(106,99,242,0.3)]",
                    "ring-1 ring-white/10 group-hover:ring-brand-400/50 bg-deep/50",
                    "group-focus-visible:ring-2 group-focus-visible:ring-brand-500"
                  )}
                >
                  <div className="w-full h-full rounded-xl overflow-hidden relative">
                    {/* Fallback Icon (fica por trás e aparece se a imagem falhar/não carregar) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 bg-surface-2">
                      <ImageIcon className="size-8 mb-2 opacity-50" />
                      <span className="text-[10px] uppercase tracking-widest font-semibold opacity-50 text-center px-2">{char.name}</span>
                    </div>

                    <img
                      src={char.image}
                      alt={char.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-10"
                      onError={(e) => {
                        // Esconde a imagem quebrada para mostrar o fallback
                        e.currentTarget.style.opacity = "0";
                      }}
                    />

                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent pointer-events-none z-20" />

                    <div className="absolute bottom-0 inset-x-0 p-3 flex items-end z-30">
                      <span className="font-semibold text-sm text-white">{char.name}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Page>
    </AppShell>
  );
}
