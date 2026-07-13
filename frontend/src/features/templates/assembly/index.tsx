import { useState, useRef, useEffect, type ChangeEvent, type DragEvent } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Play, UserPlus, Image as ImageIcon, Crop, RefreshCcw, Upload, Plus } from "lucide-react";
import { AppShell } from "@/layouts/app-shell";
import { Page, Stepper, Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Slider } from "@/components";
import { avatars as initialAvatars } from "@/services/data";
import { cn } from "@/utils/utils";

const STEPS = ["Templates", "Avatar", "Produto", "Prompt"];

export function TemplateAssemblyScreen() {
  const navigate = useNavigate();
  // Pega os parâmetros da URL
  const search = useSearch({ strict: false }) as Record<string, string | undefined>;
  const videoId = search.id;
  const videoUrl = search.video;
  
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
              <div className="flex flex-col gap-3">
                <span className="text-sm font-semibold tracking-wide text-white/50 uppercase pl-1">Modelo</span>
                <div className="group relative overflow-hidden rounded-[20px] bg-gradient-to-br from-surface-3 to-deep border border-white/5 aspect-[9/16] flex flex-col items-center justify-center">
                  {videoUrl ? (
                    <>
                      <video
                        ref={videoRef}
                        src={videoUrl}
                        className="h-full w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        onError={(e) => {
                          (e.target as HTMLVideoElement).style.display = 'none';
                          (e.target as HTMLVideoElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      {/* Fallback caso erro ao carregar o vídeo */}
                      <div className="hidden absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent flex flex-col items-center justify-center text-white/30 gap-4">
                        <div className="size-16 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-md border border-white/10">
                          <Play className="size-6 ml-1" />
                        </div>
                        <span className="text-sm font-medium">Erro ao carregar vídeo</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent flex flex-col items-center justify-center text-white/30 gap-4">
                      <div className="size-16 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-md border border-white/10">
                        <Play className="size-6 ml-1" />
                      </div>
                      <span className="text-sm font-medium">Vídeo do Modelo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CONTAINER 2 — PRINT DO VÍDEO */}
              <div className="flex flex-col gap-3">
                <span className="text-sm font-semibold tracking-wide text-white/50 uppercase pl-1">Print do vídeo</span>
                <div className="group relative overflow-hidden rounded-[20px] bg-gradient-to-br from-surface-3 to-deep border border-white/5 aspect-[9/16] flex flex-col items-center justify-center">
                  {/* TODO: fonte do print/frame do vídeo */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 gap-4">
                    <div className="size-16 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-md border border-white/10">
                      <ImageIcon className="size-6" />
                    </div>
                    <span className="text-sm font-medium text-center px-4">Print do vídeo<br/>(Placeholder)</span>
                  </div>
                </div>
              </div>

              {/* CONTAINER 3 — AVATAR */}
              <div className="flex flex-col gap-3">
                <span className="text-sm font-semibold tracking-wide text-white/50 uppercase pl-1">Avatar</span>
                
                {!avatarSelecionado ? (
                  <button 
                    onClick={handleAvatarClick}
                    className="group relative overflow-hidden rounded-[20px] bg-white/[0.02] border-2 border-dashed border-accent-400/30 hover:border-accent-400/60 hover:bg-white/[0.04] transition-all duration-300 aspect-[9/16] flex flex-col items-center justify-center text-center p-6 outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  >
                    <div className="size-16 rounded-full bg-accent-500/10 flex items-center justify-center text-accent-400 mb-5 group-hover:scale-110 group-hover:bg-accent-500/20 transition-all duration-300">
                      <UserPlus className="size-7" />
                    </div>
                    <span className="font-semibold text-white/90 group-hover:text-white transition-colors text-lg mb-2">Selecionar avatar</span>
                    <span className="text-sm text-white/40">Clique para escolher quem apresentará o vídeo</span>
                  </button>
                ) : (
                  <div className="group relative overflow-hidden rounded-[20px] bg-surface-3 border border-white/10 aspect-[9/16]">
                    <img 
                      src={avatarSelecionado} 
                      alt="Avatar Selecionado" 
                      className="w-full h-full object-cover origin-center"
                    />
                    
                    {/* Overlay gradient & buttons */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 gap-2.5">
                      <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md h-10" onClick={openCropModal}>
                        <Crop className="size-4 mr-2" />
                        Recortar
                      </Button>
                      <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md h-10" onClick={() => setAvatarPickerOpen(true)}>
                        <RefreshCcw className="size-4 mr-2" />
                        Trocar avatar
                      </Button>
                      <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md h-10" onClick={openFilePicker}>
                        <Upload className="size-4 mr-2" />
                        Importar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* NAVEGAÇÃO FOOTER */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-auto">
            <Button 
              variant="ghost" 
              className="text-white/70 hover:text-white hover:bg-white/5"
              onClick={() => navigate({ to: "/templates" })}
            >
              Voltar
            </Button>
            
            <Button 
              disabled={!avatarSelecionado}
              className="bg-accent-500 hover:bg-accent-600 text-white shadow-[0_0_24px_-6px_rgba(109,91,245,0.5)] px-8"
              onClick={() => {
                // TODO: etapa Produto (propagar search.productId se existir)
                console.log("Continuar para Produto com:", { videoId, videoUrl, avatarSelecionado, productId: search.productId });
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
        <Dialog open={avatarPickerOpen} onOpenChange={setAvatarPickerOpen}>
          <DialogContent className="max-w-4xl bg-surface-1/95 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <DialogHeader className="px-1 text-left pb-4 border-b border-white/5">
              <DialogTitle className="text-2xl font-bold text-white">Selecionar avatar</DialogTitle>
              <DialogDescription className="text-white/60">
                Escolha um avatar da sua galeria ou importe um novo.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto px-1 py-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {/* Botão Importar (Card) */}
                <div
                  onClick={openFilePicker}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openFilePicker();
                    }
                  }}
                  className={cn(
                    "group flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed transition-all hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-accent-500/50",
                    isDragging
                      ? "border-accent-400 bg-accent-500/10 shadow-[0_0_24px_rgba(139,92,246,0.2)]"
                      : "border-white/10 bg-white/5 hover:border-accent-500/50 hover:bg-white/10 hover:shadow-[0_12px_24px_-12px_rgba(139,92,246,0.15)]"
                  )}
                >
                  <div className="grid size-12 place-items-center rounded-full bg-white/5 text-accent-400 transition-transform group-hover:scale-110 group-hover:bg-accent-500/20">
                    <Plus className="size-6" />
                  </div>
                  <p className="text-center text-sm font-medium text-white/60 transition-colors group-hover:text-white px-4">
                    Importar do computador
                  </p>
                </div>

                {/* Lista de Avatares */}
                {allAvatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => handleAvatarSelect(avatar.image)}
                    className="group relative overflow-hidden rounded-[20px] bg-surface-3 border border-white/5 transition-all hover:border-accent-500/50 hover:-translate-y-1 hover:shadow-[0_12px_24px_-12px_rgba(139,92,246,0.3)] focus:outline-none focus:ring-2 focus:ring-accent-500/50 aspect-[3/4] text-left"
                  >
                    <img
                      src={avatar.image}
                      alt={avatar.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="truncate text-sm font-semibold text-white drop-shadow-md">{avatar.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* MODAL DE RECORTE DE AVATAR */}
        <Dialog open={cropOpen} onOpenChange={setCropOpen}>
          <DialogContent className="max-w-md bg-surface-1/95 border-white/10 backdrop-blur-xl shadow-2xl">
            <DialogHeader className="px-1 text-left pb-4 border-b border-white/5">
              <DialogTitle className="text-xl font-bold text-white">Recortar avatar</DialogTitle>
              <DialogDescription className="text-white/60">
                Dê zoom e arraste para enquadrar. O formato 9:16 é fixo. Este recorte é usado apenas neste uso e não altera sua biblioteca.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center py-4 gap-6">
              {/* Viewport 9:16 */}
              <div 
                ref={containerRef}
                className="relative h-72 sm:h-80 aspect-[9/16] rounded-xl overflow-hidden bg-black/50 border border-white/10 cursor-grab active:cursor-grabbing touch-none ring-1 ring-white/5 shadow-inner"
                onPointerDown={handleCropPointerDown}
                onPointerMove={handleCropPointerMove}
                onPointerUp={handleCropPointerUp}
                onPointerCancel={handleCropPointerUp}
              >
                <img
                  src={avatarOriginal || ""}
                  alt="Avatar Crop"
                  className={cn("absolute max-w-none origin-center pointer-events-none", dims.cw === 0 ? "opacity-0" : "opacity-100")}
                  onLoad={onImgLoad}
                  style={dims.cw > 0 ? {
                    width: `${dims.dw}px`,
                    height: `${dims.dh}px`,
                    left: `${(dims.cw - dims.dw) / 2}px`,
                    top: `${(dims.ch - dims.dh) / 2}px`,
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`
                  } : { width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              {/* Slider Zoom */}
              <div className="w-full flex items-center gap-4 px-2">
                <span className="text-xs font-medium text-white/50 w-10 text-right">{zoom.toFixed(2)}x</span>
                <Slider
                  value={[zoom]}
                  min={1}
                  max={3}
                  step={0.01}
                  onValueChange={(vals) => handleZoomChange(vals[0])}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <Button variant="ghost" onClick={resetCrop} className="text-white/70 hover:text-white">
                Resetar
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setCropOpen(false)} className="text-white/70 hover:text-white">Cancelar</Button>
                <Button onClick={saveCrop} className="bg-accent-500 hover:bg-accent-600 text-white shadow-[0_0_24px_-6px_rgba(109,91,245,0.5)]">
                  Salvar recorte
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Page>
    </AppShell>
  );
}
