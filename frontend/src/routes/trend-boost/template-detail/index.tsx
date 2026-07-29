import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Image as ImageIcon, Loader2 } from "lucide-react";
import { Page } from "@/components/page";
import { AppShell } from "@/layouts/app-shell";
import { cn } from "@/utils/utils";
import { TrendHeader } from "../components/trend-header";
import { getViralTemplate } from "@/services/viralService";
import type { ViralCharacter, ViralTemplateDetail } from "@/models/viral";

// Rótulo exibido por seção. Subcategoria fora do mapa cai no próprio slug, então
// cadastrar uma seção nova no admin não exige mexer aqui.
const SUBCATEGORY_LABELS: Record<string, string> = {
  vovo: "Vovô",
  vova: "Vovó",
  objeto: "Objetos",
  fruta: "Frutas",
};

const SUBCATEGORY_ORDER = ["vovo", "vova", "objeto", "fruta"];

function groupBySubcategory(characters: ViralCharacter[]) {
  const groups = new Map<string, ViralCharacter[]>();
  for (const char of characters) {
    const key = char.subcategory ?? "";
    const bucket = groups.get(key);
    if (bucket) bucket.push(char);
    else groups.set(key, [char]);
  }

  return [...groups.entries()].sort(([a], [b]) => {
    // Sem subcategoria vai para o fim; conhecidas seguem SUBCATEGORY_ORDER.
    if (a === "") return 1;
    if (b === "") return -1;
    const ia = SUBCATEGORY_ORDER.indexOf(a);
    const ib = SUBCATEGORY_ORDER.indexOf(b);
    return (ia === -1 ? Number.MAX_SAFE_INTEGER : ia) - (ib === -1 ? Number.MAX_SAFE_INTEGER : ib);
  });
}

export default function RouteComponent() {
  const { template: templateId = "" } = useParams();

  const { data: template, isLoading, isError } = useQuery({
    queryKey: ["viral-template", templateId],
    queryFn: async () => {
      const res = await getViralTemplate(templateId);
      return res.data as ViralTemplateDetail;
    },
    enabled: !!templateId,
  });

  if (isLoading) {
    return (
      <AppShell>
        <Page className="pt-0 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="size-6 animate-spin text-brand-400" />
        </Page>
      </AppShell>
    );
  }

  if (isError || !template) {
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
          subtitle={template.subtitle ?? ""}
          description="Selecione uma opção abaixo para continuar a geração."
          titleHighlight=""
        />

        <div className="mx-auto max-w-6xl mt-12 flex flex-col gap-10">
          {groupBySubcategory(template.characters).map(([subcategory, chars]) => (
            <section key={subcategory || "outros"}>
              {subcategory && (
                <h2 className="mb-4 text-lg font-bold text-white">
                  {SUBCATEGORY_LABELS[subcategory] ?? subcategory}
                </h2>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
                {chars.map((char) => (
              <Link
                key={char.slug}
                to={`/trend-boost/${templateId}/${char.slug}`}
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
                      src={char.imageUrl ?? undefined}
                      alt={char.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-10"
                      onError={(e) => {
                        // Esconde a imagem quebrada para mostrar o fallback
                        e.currentTarget.style.opacity = "0";
                      }}
                    />

                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/90 to-transparent pointer-events-none z-20" />

                    <div className="absolute bottom-0 inset-x-0 p-3 flex items-end z-30">
                      <span className="font-semibold text-sm text-white">{char.name}</span>
                    </div>
                  </div>
                </div>
              </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Page>
    </AppShell>
  );
}
