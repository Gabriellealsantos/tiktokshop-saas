import { type PointerEvent, type SyntheticEvent, type RefObject } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/dialog";
import { Slider } from "@/components/slider";
import { Button } from "@/components/button";
import { cn } from "@/utils/utils";
import { S3Image } from "@/components";

interface CropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avatarOriginal: string | null;
  containerRef: RefObject<HTMLDivElement | null>;
  dims: { cw: number; ch: number; dw: number; dh: number };
  position: { x: number; y: number };
  zoom: number;
  handleCropPointerDown: (e: PointerEvent) => void;
  handleCropPointerMove: (e: PointerEvent) => void;
  handleCropPointerUp: (e: PointerEvent) => void;
  onImgLoad: (e: SyntheticEvent<HTMLImageElement>) => void;
  handleZoomChange: (newZoom: number) => void;
  resetCrop: () => void;
  saveCrop: () => void;
  handleCropWheel: (e: React.WheelEvent) => void;
}

export function CropModal({
  open,
  onOpenChange,
  avatarOriginal,
  containerRef,
  dims,
  position,
  zoom,
  handleCropPointerDown,
  handleCropPointerMove,
  handleCropPointerUp,
  onImgLoad,
  handleZoomChange,
  resetCrop,
  saveCrop,
  handleCropWheel,
}: CropModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-surface-1/95 border-white/10 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="px-1 text-left pb-4 border-b border-white/5">
          <DialogTitle className="text-xl font-bold text-white">
            Recortar avatar
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Já enquadramos o rosto para melhor fidelidade. Ajuste se quiser, ou
            use "Resetar" para o corpo inteiro. O formato 9:16 é fixo e o
            recorte vale apenas neste uso.
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
            onWheel={handleCropWheel}
          >
            <S3Image
              src={avatarOriginal || ""}
              alt="Avatar Crop"
              className={cn(
                "absolute max-w-none origin-center pointer-events-none",
                dims.cw === 0 ? "opacity-0" : "opacity-100",
              )}
              onLoad={onImgLoad}
              style={
                dims.cw > 0
                  ? {
                      width: `${dims.dw}px`,
                      height: `${dims.dh}px`,
                      left: `${(dims.cw - dims.dw) / 2}px`,
                      top: `${(dims.ch - dims.dh) / 2}px`,
                      transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    }
                  : { width: "100%", height: "100%", objectFit: "cover" }
              }
            />
          </div>

          {/* Slider Zoom */}
          <div className="w-full flex items-center gap-4 px-2">
            <span className="text-xs font-medium text-white/50 w-10 text-right">
              {zoom.toFixed(2)}x
            </span>
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
          <Button
            variant="ghost"
            onClick={resetCrop}
            className="text-white/70 hover:text-white"
          >
            Resetar
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-white/70 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={saveCrop}
              className="bg-accent-500 hover:bg-accent-600 text-white shadow-[0_0_24px_-6px_rgba(109,91,245,0.5)]"
            >
              Salvar recorte
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
