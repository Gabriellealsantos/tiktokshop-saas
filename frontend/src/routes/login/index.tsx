import { useEffect, useRef } from "react";

import { BrandMark } from "@/components";
import { AuthShell } from "@/layouts/auth-shell";
import { useDocumentTitle } from "@/utils/use-document-title";
import { loginRedirect } from "@/utils/requests";

/**
 * No fluxo OAuth2 Authorization Code + PKCE a tela de credenciais é servida pelo
 * back (8080), estilizada idêntica a esta. Então /login apenas dispara o redirect
 * para o /oauth2/authorize — não há formulário duplicado no front.
 */
export default function LoginRoute() {
  useDocumentTitle("Entrar — Estúdio Criativo");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    void loginRedirect();
  }, []);

  return (
    <AuthShell>
      <div className="mx-auto flex w-full max-w-[420px] flex-col items-center gap-4 rounded-[23px] border border-white/5 bg-[#09080e] p-8 text-center">
        <BrandMark className="h-16" />
        <p className="text-sm text-zinc-400">Redirecionando para o login…</p>
      </div>
    </AuthShell>
  );
}
