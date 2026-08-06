import { asset } from "@/lib/media";
import { cn } from "@/utils/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src={asset("/logo-Sfundo.png")}
      alt="Logo do sistema"
      className={cn("h-10 w-auto object-contain", className)}
    />
  );
}
