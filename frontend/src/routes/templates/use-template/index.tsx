import { useState, useRef, useEffect, type ChangeEvent, type DragEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "@/layouts/app-shell";
import { Page } from "@/components/page";
import { Stepper } from "@/components/stepper";
import { Button } from "@/components/button";
import { avatars as initialAvatars } from "@/data/mock";

import { VideoModel } from "./components/video-model";
import { VideoPrint } from "./components/video-print";
import { AvatarPreview } from "./components/avatar-preview";
import { AvatarPickerModal } from "./components/avatar-picker-modal";
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
  const [customAvatars, setCustomAvatars] = useState<{ id: string; name: string; image: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Estado do recorte
  const [cropOpen, setCropOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [savedCrop, setSavedCrop] = useState({ zoom: 1, x: 0, y: 0 });
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dims, setDims] = useState({ cw: 0, ch: 0, dw: 0, dh: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Avatar system data
  const allAvatars = [...initialAvatars.slice(0, 4), ...customAvatars];

  // Handlers para o modal de avatar
  const handleAvatarSelect = (avatarImage: string) => {
    setAvatarOriginal(avatarImage);
    setAvatarSelecionado(avatarImage);
    setAvatarPickerOpen(false);
    setSavedCrop({ zoom: 1, x: 0, y: 0 });
    setDims({ cw: 0, ch: 0, dw: 0, dh: 0 });
  };

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      const newAvatar = { id: `custom-${Date.now()}`, name: file.name.split(".")[0] || "Avatar Importado", image: url };
      setCustomAvatars((prev) => [...prev, newAvatar]);
      // Seleciona automaticamente o avatar recém-importado
      handleAvatarSelect(url);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
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
        <div className="max-w-5xl mx-auto w-full flex flex-col h-[calc(100vh-8rem)]">
          <Stepper steps={STEPS} current={1} />

          <div className="flex-1 min-h-0 overflow-y-auto mt-4 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 h-full items-start">
              {/* CONTAINER 1 — MODELO */}
              <VideoModel videoUrl={videoUrl} videoRef={videoRef} />

              {/* CONTAINER 2 — PRINT DO VÍDEO */}
              <VideoPrint />

              {/* CONTAINER 3 — AVATAR */}
              <AvatarPreview
                avatarSelecionado={avatarSelecionado}
                handleAvatarClick={handleAvatarClick}
                openCropModal={openCropModal}
                setAvatarPickerOpen={setAvatarPickerOpen}
                openFilePicker={openFilePicker}
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

        {/* INPUT HIDDEN PARA UPLOAD */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {/* MODAL DE SELEÇÃO DE AVATAR */}
        <AvatarPickerModal
          open={avatarPickerOpen}
          onOpenChange={setAvatarPickerOpen}
          openFilePicker={openFilePicker}
          handleDrop={handleDrop}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          allAvatars={allAvatars}
          handleAvatarSelect={handleAvatarSelect}
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
        />
      </Page>
    </AppShell>
  );
}
