import type { ReactNode } from "react";
import { SignatureBackground } from "@/layouts/signature-background";
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <SignatureBackground />
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
