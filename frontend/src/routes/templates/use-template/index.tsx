import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "@/layouts/app-shell";
import { Page } from "@/components/page";
import { Stepper } from "@/components/stepper";
import { Button } from "@/components/button";
import { avatars as initialAvatars } from "@/data/mock";

import { VideoModel } from "./components/video-model";
import { VideoPrint } from "./components/video-print";
import { ClothSwapPanel } from "./components/cloth-swap-panel";
import { User, Crop, RefreshCw, ArrowLeftRight } from "lucide-react";
import { AvatarLibraryModal } from "@/routes/create-avatar/components/avatar-library-modal";
import { CropModal } from "./components/crop-modal";

const STEPS = ["Templates", "Avatar", "Produto", "Prompt"];

export default function TemplateAssemblyScreen() {
  const navigate = useNavigate();
  // Pega os parâmetros da URL
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get("id") ?? undefined;
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

  // Handlers para o modal de avatar
  const handleAvatarSelect = (avatarImage: string) => {
    setAvatarOriginal(avatarImage);
    setAvatarSelecionado(avatarImage);
    setAvatarPickerOpen(false);
    setAvatarConfirmed(false); // Reset confirmation if avatar changes
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

  return (
    <AppShell>
      <Page>
        <div className="max-w-5xl mx-auto w-full flex flex-col pb-12">
          <Stepper steps={STEPS} current={1} />

          <div className="mt-8 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
              {/* CONTAINER 1 — MODELO */}
              <VideoModel videoUrl={videoUrl} videoRef={videoRef} />

              {/* CONTAINER 2 — PRINT DO VÍDEO + CONTROLES AVATAR */}
              <div className="flex flex-col gap-6">
                <VideoPrint />
                
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
                      className="w-full btn-3d-primary rounded-[14px] font-semibold"
                      onClick={() => setAvatarConfirmed(true)}
                    >
                      <ArrowLeftRight className="size-4 mr-2" />
                      Trocar pessoa
                    </Button>
                  </div>
                )}
              </div>

              {/* CONTAINER 3 — PAINEL DE ROUPA */}
              <ClothSwapPanel isBlocked={!avatarConfirmed} />
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
              disabled={!avatarSelecionado}
              className="bg-accent-500 hover:bg-accent-600 text-white shadow-[0_0_24px_-6px_rgba(109,91,245,0.5)] px-8"
              onClick={() => {
                // TODO: etapa Produto (propagar productId se existir)
                console.log("Continuar para Produto com:", { videoId, videoUrl, avatarSelecionado, productId });
              }}
            >
              Continuar
            </Button>
          </div>
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
