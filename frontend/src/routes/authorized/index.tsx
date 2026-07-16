import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { exchangeCodeForToken } from "@/utils/requests";
import { saveAuthData } from "@/localStorage/access-token-repository";
import { getState, removeCodeVerifier, removeState } from "@/utils/pkce";
import { AuthShell } from "@/layouts/auth-shell";
import { BrandMark } from "@/components";

/**
 * Rota de retorno do OAuth (redirect_uri = /authorized). Troca o `code` por
 * tokens e recarrega a aplicação já autenticada.
 */
export default function AuthorizedRoute() {
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // evita dupla execução no StrictMode (code só serve uma vez)
    ran.current = true;

    const code = params.get("code");
    const returnedState = params.get("state");
    const savedState = getState();

    if (!code) {
      setError("Código de autorização ausente.");
      return;
    }
    if (returnedState && savedState && returnedState !== savedState) {
      setError("State inválido — possível CSRF. Refaça o login.");
      return;
    }

    exchangeCodeForToken(code)
      .then((res) => {
        saveAuthData(res.data);
        removeCodeVerifier();
        removeState();
        // Reload total para o AuthProvider inicializar com a sessão nova.
        window.location.replace("/");
      })
      .catch(() => setError("Falha ao autenticar. Tente novamente."));
  }, [params]);

  return (
    <AuthShell>
      <div className="mx-auto flex w-full max-w-[420px] flex-col items-center gap-4 rounded-[23px] border border-white/5 bg-[#09080e] p-8 text-center">
        <BrandMark className="h-16" />
        {error ? (
          <>
            <p className="text-sm text-danger">{error}</p>
            <a href="/login" className="text-sm text-accent-400 hover:underline">
              Voltar ao login
            </a>
          </>
        ) : (
          <p className="text-sm text-zinc-400">Autenticando…</p>
        )}
      </div>
    </AuthShell>
  );
}
