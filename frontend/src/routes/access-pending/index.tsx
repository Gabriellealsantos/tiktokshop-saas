import { useAuth } from "@/context/auth";
import { useDocumentTitle } from "@/utils/use-document-title";
import { PendingApproval } from "@/routes/register/components/pending-approval";

/**
 * Destino de quem autenticou mas não pode usar a plataforma (sem plano ou conta
 * bloqueada). Fica fora do PrivateRoute de propósito: a sessão já foi derrubada,
 * então qualquer rota protegida aqui reiniciaria o OAuth em loop.
 */
export default function AccessPendingRoute() {
  useDocumentTitle("Acesso pendente — Estúdio Criativo");
  const { blockedReason } = useAuth();

  if (blockedReason === "bloqueado") {
    return (
      <PendingApproval
        title="Conta bloqueada"
        message="Sua conta foi bloqueada temporariamente. Fale com o suporte para regularizar o acesso."
      />
    );
  }

  return (
    <PendingApproval
      title="Acesso aguardando liberação"
      message="Seu cadastro já está feito. Um administrador precisa liberar seu plano para você entrar na plataforma."
    />
  );
}
