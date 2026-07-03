import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src="/logo-Sfundo.png"
      alt="Logo do sistema"
      className={cn("h-10 w-auto object-contain", className)}
    />
  );
}
