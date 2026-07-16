import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

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
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const error = params.get("error");
  const isError = error === "disabled" || error === "locked";

  useEffect(() => {
    if (ran.current || isError) return;
    ran.current = true;
    void loginRedirect();
  }, [isError]);

  return (
    <AuthShell>
      <div className="mx-auto flex w-full max-w-[420px] flex-col items-center gap-4 rounded-[23px] border border-white/5 bg-[#09080e] p-8 text-center">
        <BrandMark className="h-16" />
        {isError ? (
          <>
            <p className="text-sm font-medium text-danger">Acesso Suspenso</p>
            <p className="text-xs text-zinc-400">
              {error === "disabled" 
                ? "Você precisa de um plano ativo para acessar a plataforma."
                : "Sua conta foi bloqueada temporariamente."}
            </p>
            <button 
              onClick={() => navigate("/login")}
              className="btn-brand mt-4 rounded-xl px-6 py-2 text-sm font-semibold"
            >
              Tentar Novamente
            </button>
          </>
        ) : (
          <p className="text-sm text-zinc-400">Redirecionando para o login…</p>
        )}
      </div>
    </AuthShell>
  );
}
