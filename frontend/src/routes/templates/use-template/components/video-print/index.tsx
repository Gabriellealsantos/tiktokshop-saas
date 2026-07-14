import { Image as ImageIcon } from "lucide-react";

export function VideoPrint() {
  return (
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
  );
}
