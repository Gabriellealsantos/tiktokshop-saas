import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/layouts/app-shell";
import { Page } from "@/components/page";
import { Stepper } from "@/components/stepper";
import { Button } from "@/components/button";

import { VideoModel } from "./components/video-model";
import { VideoPrint } from "./components/video-print";
import { ClothSwapPanel } from "./components/cloth-swap-panel";
import { ProductPickerModal } from "./components/product-picker-modal";
import { User, Crop, RefreshCw, ArrowLeftRight, Copy, ArrowRight, Download, Sparkles, Loader2, Gauge } from "lucide-react";
import { AvatarLibraryModal } from "@/routes/create-avatar/components/avatar-library-modal";
import { CropModal } from "./components/crop-modal";

import { captureVideoFrame } from "@/utils/captureFrame";
import { downloadMedia } from "@/utils/download";
import { uploadTemplateFrame, swapPerson, swapClothes, generateVideoPrompt, getTemplateUsage } from "@/services/videoTemplateService";
import { getProductById } from "@/services/productService";
import { mapBackendToProduct, type BackendProduct } from "@/models/product-mappers";
import type { Product } from "@/models/product";
import type { ClothSwapMode, ImageGenerationResult, TemplateUsage, VideoPromptResponse } from "@/models/videoTemplate";

const STEPS = ["Templates", "Avatar", "Produto", "Prompt"];

/** Extrai a mensagem de erro do backend (StandardError), com destaque para a cota (429). */
function backendError(err: unknown, fallback: string): string {
  const e = err as { response?: { status?: number; data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

export default function TemplateAssemblyScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Parâmetros da URL: slug do template (galeria navega por slug), url do vídeo e produto opcional.
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug") ?? undefined;
  const videoUrl = searchParams.get("video") ?? undefined;
  const productId = searchParams.get("productId") ?? undefined;

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Respeita preferência de redução de movimento do sistema
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion && videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  // Frame cru capturado assim que o vídeo carrega (grátis, sem cota) — reaproveitado no swap.
  const frameBlobRef = useRef<Blob | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [rawFramePreview, setRawFramePreview] = useState<string | null>(null);

  // Os avatares padrão são assets locais (/avatarN.jpeg) ou data URLs (após recorte). O backend
  // (Gemini) só aceita referências HOSPEDADAS no storage — então subimos a imagem escolhida uma
  // vez e reusamos a URL hospedada. Cache no ref, invalidado ao trocar/recortar o avatar.
  const avatarHostedRef = useRef<string | null>(null);

  const resolveHostedAvatarUrl = async (): Promise<string> => {
    if (avatarHostedRef.current) return avatarHostedRef.current;
    if (!avatarSelecionado) throw new Error("Selecione um avatar primeiro.");
    const resp = await fetch(avatarSelecionado);
    if (!resp.ok) throw new Error("Não foi possível carregar a imagem do avatar.");
    const blob = await resp.blob();
    const up = await uploadTemplateFrame(blob);
    const url = (up.data as { url: string }).url;
    avatarHostedRef.current = url;
    return url;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    const capture = async () => {
      try {
        const blob = await captureVideoFrame(video);
        if (cancelled) return;
        frameBlobRef.current = blob;
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        const url = URL.createObjectURL(blob);
        previewUrlRef.current = url;
        setRawFramePreview(url);
      } catch (e) {
        console.warn("Não foi possível capturar o frame automaticamente.", e);
      }
    };

    if (video.readyState >= 2) {
      capture();
    } else {
      video.addEventListener("loadeddata", capture, { once: true });
    }

    return () => {
      cancelled = true;
      video.removeEventListener("loadeddata", capture);
    };
  }, [videoUrl]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  // Estado do avatar e modal
  const [avatarOriginal, setAvatarOriginal] = useState<string | null>(null);
  const [avatarSelecionado, setAvatarSelecionado] = useState<string | null>(null);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [avatarConfirmed, setAvatarConfirmed] = useState(false);

  // Estado do recorte
  const [cropOpen, setCropOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [savedCrop, setSavedCrop] = useState({ zoom: 1, x: 0, y: 0 });
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dims, setDims] = useState({ cw: 0, ch: 0, dw: 0, dh: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Estado do fluxo de geração (frame → swap pessoa → swap roupa → prompt)
  const [produto, setProduto] = useState<Product | null>(null);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [personResultUrl, setPersonResultUrl] = useState<string | null>(null); // resultado do swap de pessoa (base p/ roupa)
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null); // resultado do swap de roupa (ou "manter look")
  const [promptResult, setPromptResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Produto que veio da tela anterior (?productId=): busca e pré-preenche o painel.
  const { data: productFromUrl } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const res = await getProductById(Number(productId));
      return mapBackendToProduct(res.data as BackendProduct);
    },
    enabled: !!productId,
  });

  useEffect(() => {
    if (productFromUrl) setProduto(productFromUrl);
  }, [productFromUrl]);

  // Cota diária (VIDEO_TEMPLATE): só os swaps consomem; revalida a cada geração.
  const { data: usage } = useQuery<TemplateUsage>({
    queryKey: ["template-usage"],
    queryFn: async () => {
      const res = await getTemplateUsage();
      return res.data as TemplateUsage;
    },
  });

  // Imagem exibida no "Print do vídeo": resultado da roupa > resultado da pessoa > frame cru capturado ao carregar.
  const printSrc = finalImageUrl ?? personResultUrl ?? rawFramePreview;

  // ── Mutations ───────────────────────────────────────────────────────────────

  // Trocar pessoa: captura o frame do <video>, sobe pro storage e roda o swap.
  const swapPersonMutation = useMutation({
    mutationFn: async () => {
      if (!videoRef.current) throw new Error("Vídeo não está pronto.");
      if (!avatarSelecionado) throw new Error("Selecione um avatar primeiro.");
      // Reaproveita o frame já capturado ao carregar a tela (mesmo que o usuário vê no preview);
      // só recaptura se por algum motivo isso ainda não rodou.
      const blob = frameBlobRef.current ?? await captureVideoFrame(videoRef.current);
      const frameRes = await uploadTemplateFrame(blob);
      const frameUrl = (frameRes.data as { url: string }).url;
      // Garante que o avatar seja uma URL hospedada (assets locais/data URLs não servem ao Gemini).
      const avatarImageUrl = await resolveHostedAvatarUrl();
      const res = await swapPerson({ frameUrl, avatarImageUrl });
      const gen = res.data as ImageGenerationResult;
      if (gen.status === "FAILED" || !gen.imageUrl) throw new Error(gen.error ?? "Falha ao trocar a pessoa.");
      return gen.imageUrl;
    },
    onSuccess: (imageUrl) => {
      setPersonResultUrl(imageUrl);
      setFinalImageUrl(null); // troca de pessoa reinicia a etapa de roupa
      setAvatarConfirmed(true);
      queryClient.invalidateQueries({ queryKey: ["template-usage"] });
      toast.success("Pessoa trocada! Agora aplique a roupa ou gere o prompt.");
    },
    onError: (err) => toast.error(backendError(err, "Não foi possível trocar a pessoa.")),
  });

  // Trocar roupa: veste o produto sobre o resultado do swap de pessoa.
  const swapClothesMutation = useMutation({
    mutationFn: async (mode: ClothSwapMode) => {
      if (!personResultUrl) throw new Error("Faça a troca de pessoa antes.");
      if (!produto?.image) throw new Error("Selecione um produto com imagem.");
      const res = await swapClothes({ baseImageUrl: personResultUrl, productImageUrl: produto.image, mode });
      const gen = res.data as ImageGenerationResult;
      if (gen.status === "FAILED" || !gen.imageUrl) throw new Error(gen.error ?? "Falha ao aplicar a roupa.");
      return gen.imageUrl;
    },
    onSuccess: (imageUrl) => {
      setFinalImageUrl(imageUrl);
      queryClient.invalidateQueries({ queryKey: ["template-usage"] });
      toast.success("Roupa aplicada!");
    },
    onError: (err) => toast.error(backendError(err, "Não foi possível aplicar a roupa.")),
  });

  // Gerar prompt Veo3 (texto, não consome cota).
  const promptMutation = useMutation({
    mutationFn: async () => {
      if (!slug) throw new Error("Template inválido.");
      if (!produto) throw new Error("Escolha um produto.");
      const res = await generateVideoPrompt({
        templateSlug: slug,
        productId: Number(produto.id),
        finalImageUrl: finalImageUrl ?? personResultUrl,
        avatarImageUrl: avatarHostedRef.current ?? avatarSelecionado,
      });
      return (res.data as VideoPromptResponse).prompt;
    },
    onSuccess: (prompt) => setPromptResult(prompt),
    onError: (err) => toast.error(backendError(err, "Não foi possível gerar o prompt.")),
  });

  const handleCopyPrompt = async () => {
    if (!promptResult) return;
    await navigator.clipboard.writeText(promptResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadImage = async () => {
    const url = finalImageUrl ?? personResultUrl;
    if (!url) return;
    try {
      await downloadMedia(url, "montagem.png");
    } catch {
      toast.error("Não foi possível baixar a imagem.");
    }
  };

  // Handlers para o modal de avatar
  const handleAvatarSelect = (avatarImage: string) => {
    setAvatarOriginal(avatarImage);
    setAvatarSelecionado(avatarImage);
    setAvatarPickerOpen(false);
    setAvatarConfirmed(false); // Reset confirmation if avatar changes
    setPersonResultUrl(null);
    setFinalImageUrl(null);
    avatarHostedRef.current = null; // invalida a URL hospedada do avatar anterior
    setSavedCrop({ zoom: 1, x: 0, y: 0 });
    setDims({ cw: 0, ch: 0, dw: 0, dh: 0 });
  };

  const handleAvatarClick = () => {
    if (!avatarSelecionado) {
      setAvatarPickerOpen(true);
    }
  };

  // Handlers para o recorte
  const openCropModal = () => {
    setZoom(savedCrop.zoom);
    setPosition({ x: savedCrop.x, y: savedCrop.y });
    setCropOpen(true);
  };

  const saveCrop = () => {
    if (!avatarOriginal || dims.cw === 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const imgLeft = (dims.cw - dims.dw * zoom) / 2 + position.x;
      const imgTop = (dims.ch - dims.dh * zoom) / 2 + position.y;

      const scaleX = canvas.width / dims.cw;
      const scaleY = canvas.height / dims.ch;

      ctx.drawImage(
        img,
        imgLeft * scaleX,
        imgTop * scaleY,
        dims.dw * zoom * scaleX,
        dims.dh * zoom * scaleY
      );

      try {
        const dataUrl = canvas.toDataURL("image/png");
        setAvatarSelecionado(dataUrl);
        setSavedCrop({ zoom, x: position.x, y: position.y });
        avatarHostedRef.current = null; // o recorte gerou uma nova imagem → re-upload no próximo swap
      } catch (e) {
        console.error("Erro de CORS ao exportar crop", e);
      } finally {
        setCropOpen(false);
      }
    };
    img.src = avatarOriginal;
  };

  const resetCrop = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const clampPosition = (newX: number, newY: number, currentZoom: number) => {
    if (dims.cw === 0) return { x: newX, y: newY };
    const maxX = Math.max(0, (dims.dw * currentZoom - dims.cw) / 2);
    const maxY = Math.max(0, (dims.dh * currentZoom - dims.ch) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, newX)),
      y: Math.max(-maxY, Math.min(maxY, newY))
    };
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
    setPosition(prev => clampPosition(prev.x, prev.y, newZoom));
  };

  const handleCropWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(1, zoom + delta), 3);
    handleZoomChange(newZoom);
  };

  const handleCropPointerDown = (e: React.PointerEvent) => {
    setIsDraggingCrop(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleCropPointerMove = (e: React.PointerEvent) => {
    if (isDraggingCrop) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition(clampPosition(newX, newY, zoom));
    }
  };

  const handleCropPointerUp = (e: React.PointerEvent) => {
    setIsDraggingCrop(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;

    const baseScale = Math.max(clientWidth / naturalWidth, clientHeight / naturalHeight);
    const dw = naturalWidth * baseScale;
    const dh = naturalHeight * baseScale;

    setDims({ cw: clientWidth, ch: clientHeight, dw, dh });
    setPosition(prev => {
      const maxX = Math.max(0, (dw * zoom - clientWidth) / 2);
      const maxY = Math.max(0, (dh * zoom - clientHeight) / 2);
      return {
        x: Math.max(-maxX, Math.min(maxX, prev.x)),
        y: Math.max(-maxY, Math.min(maxY, prev.y))
      };
    });
  };

  const currentStep = promptResult ? 3 : produto ? 2 : 1;
  const swapLoading = swapPersonMutation.isPending || swapClothesMutation.isPending;

  return (
    <AppShell>
      <Page>
        <div className="max-w-5xl mx-auto w-full flex flex-col pb-12">
          <div className="flex items-center justify-between gap-4">
            <Stepper steps={STEPS} current={currentStep} />
            {usage && (
              <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60">
                <Gauge className="size-3.5 text-brand-400" />
                {usage.remaining}/{usage.max} gerações hoje
              </div>
            )}
          </div>

          {promptResult ? (
            /* ── PASSO PROMPT (resultado) ─────────────────────────────────── */
            <div className="mt-10 max-w-4xl mx-auto w-full flex flex-col">
              <div className="flex flex-col md:flex-row gap-5 mb-5 items-start">
                {/* IMAGEM FINAL + BOTÃO DE DOWNLOAD */}
                {printSrc && (
                  <div className="flex flex-col gap-3 w-full md:w-[280px] shrink-0">
                    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-deep aspect-[9/16]">
                      <img src={printSrc} alt="Imagem final" className="h-full w-full object-cover" />
                    </div>
                    <Button variant="outline" className="w-full h-10 text-sm rounded-xl" onClick={handleDownloadImage}>
                      <Download className="size-4 mr-2" />
                      Baixar imagem
                    </Button>
                  </div>
                )}

                {/* PROMPT */}
                <div className="flex-1 min-w-0 w-full rounded-xl border border-white/10 bg-deep p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white text-[15px]">Prompt gerado (em inglês)</h3>
                    <button
                      onClick={handleCopyPrompt}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-2 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md"
                    >
                      <Copy className="size-3" />
                      {copied ? "Copiado!" : "Copiar"}
                    </button>
                  </div>

                  <div className="bg-[#0b0914] rounded-lg p-4 border border-white/5 max-h-[420px] overflow-y-auto">
                    <pre className="font-mono text-xs text-text-2 whitespace-pre-wrap leading-[1.6]">
                      {promptResult}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://labs.google/fx/tools/flow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 btn-brand inline-flex items-center justify-center h-10 text-sm rounded-xl font-semibold px-4 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_0_15px_-4px_rgba(75,68,232,0.6)]"
                >
                  Gerar vídeo no Google Flow
                  <ArrowRight className="ml-1.5 size-3.5" />
                </a>
                <Button
                  variant="ghost"
                  className="flex-1 h-10 text-sm rounded-xl text-white/70 hover:text-white hover:bg-white/5"
                  onClick={() => setPromptResult(null)}
                >
                  Voltar à montagem
                </Button>
              </div>
            </div>
          ) : (
            /* ── PASSOS DE MONTAGEM ───────────────────────────────────────── */
            <>
              <div className="mt-8 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
                  {/* CONTAINER 1 — MODELO */}
                  <VideoModel videoUrl={videoUrl} videoRef={videoRef} />

                  {/* CONTAINER 2 — PRINT DO VÍDEO + CONTROLES AVATAR */}
                  <div className="flex flex-col gap-6">
                    <VideoPrint src={printSrc} loading={swapLoading} />

                    {/* CONTROLES DO AVATAR */}
                    {!avatarSelecionado ? (
                      <div className="flex flex-col gap-3 mt-4">
                        <Button
                          className="w-full btn-3d-surface border border-dashed border-white/20 rounded-[14px]"
                          onClick={handleAvatarClick}
                        >
                          <User className="size-4 mr-2 text-white/50" />
                          Selecionar avatar
                        </Button>
                        <Button
                          className="w-full rounded-[14px] btn-3d-primary cursor-not-allowed opacity-50 shadow-none hover:bg-brand-500 hover:scale-100"
                          disabled
                        >
                          <ArrowLeftRight className="size-4 mr-2" />
                          Trocar pessoa
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 mt-4">
                        <div className="flex flex-col gap-3 p-4 rounded-[16px] bg-surface-2 border border-white/5 shadow-lg">
                          {/* LINHA SUPERIOR: Botões */}
                          <div className="flex flex-row gap-2 w-full">
                            <Button variant="secondary" size="sm" className="flex-1 text-xs btn-3d-surface h-8" onClick={openCropModal}>
                              <Crop className="size-3.5 mr-1" />
                              Recortar
                            </Button>
                            <Button variant="secondary" size="sm" className="flex-1 text-xs btn-3d-surface h-8" onClick={() => setAvatarPickerOpen(true)}>
                              <RefreshCw className="size-3.5 mr-1" />
                              Trocar
                            </Button>
                          </div>

                          {/* LINHA INFERIOR: Thumbnail e Textos */}
                          <div className="flex items-center gap-3 min-w-0 w-full">
                            <div className="size-10 rounded-[10px] overflow-hidden bg-black/50 border border-white/10 flex-shrink-0">
                              <img src={avatarSelecionado} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-[10px] font-bold tracking-widest text-brand-400 uppercase drop-shadow-sm flex-shrink-0">Avatar Selecionado</span>
                              <span className="text-white font-semibold text-sm truncate" title="Modelo Customizado">Modelo Customizado</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          className="w-full btn-3d-primary rounded-[14px] font-semibold disabled:opacity-50"
                          disabled={swapPersonMutation.isPending}
                          onClick={() => swapPersonMutation.mutate()}
                        >
                          {swapPersonMutation.isPending ? (
                            <Loader2 className="size-4 mr-2 animate-spin" />
                          ) : (
                            <ArrowLeftRight className="size-4 mr-2" />
                          )}
                          {avatarConfirmed ? "Trocar pessoa novamente" : "Trocar pessoa"}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* CONTAINER 3 — PAINEL DE ROUPA */}
                  <ClothSwapPanel
                    isBlocked={!avatarConfirmed}
                    produto={produto}
                    onEscolherProduto={() => setProductPickerOpen(true)}
                    onAplicar={(mode) => swapClothesMutation.mutate(mode)}
                    onManterLook={() => setFinalImageUrl(personResultUrl)}
                    loading={swapClothesMutation.isPending}
                  />
                </div>
              </div>

              {/* NAVEGAÇÃO FOOTER */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-auto">
                <Button
                  variant="ghost"
                  className="text-white/70 hover:text-white hover:bg-white/5"
                  onClick={() => navigate("/templates")}
                >
                  Voltar
                </Button>

                <Button
                  disabled={!slug || !produto || !avatarConfirmed || promptMutation.isPending}
                  className="bg-accent-500 hover:bg-accent-600 text-white shadow-[0_0_24px_-6px_rgba(109,91,245,0.5)] px-8 disabled:opacity-50"
                  onClick={() => promptMutation.mutate()}
                >
                  {promptMutation.isPending ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="size-4 mr-2" />
                  )}
                  Gerar prompt
                </Button>
              </div>
            </>
          )}
        </div>

        {/* MODAL DE SELEÇÃO DE AVATAR */}
        <AvatarLibraryModal
          open={avatarPickerOpen}
          onOpenChange={setAvatarPickerOpen}
          mode="select"
          onSelect={(avatar) => handleAvatarSelect(avatar.image)}
          title="Selecione o avatar"
          subtitle="Escolha quem apresentará o vídeo."
        />

        {/* MODAL DE SELEÇÃO DE PRODUTO */}
        <ProductPickerModal
          open={productPickerOpen}
          onOpenChange={setProductPickerOpen}
          onSelect={(p) => setProduto(p)}
        />

        {/* MODAL DE RECORTE DE AVATAR */}
        <CropModal
          open={cropOpen}
          onOpenChange={setCropOpen}
          avatarOriginal={avatarOriginal}
          containerRef={containerRef}
          dims={dims}
          position={position}
          zoom={zoom}
          handleCropPointerDown={handleCropPointerDown}
          handleCropPointerMove={handleCropPointerMove}
          handleCropPointerUp={handleCropPointerUp}
          onImgLoad={onImgLoad}
          handleZoomChange={handleZoomChange}
          resetCrop={resetCrop}
          saveCrop={saveCrop}
          handleCropWheel={handleCropWheel}
        />
      </Page>
    </AppShell>
  );
}
