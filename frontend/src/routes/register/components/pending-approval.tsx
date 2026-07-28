import { Link } from "react-router-dom";
import { Clock3 } from "lucide-react";
import { BrandMark, Button } from "@/components";
import { AuthShell } from "@/layouts/auth-shell";

type Props = {
  title?: string;
  message?: string;
};

export function PendingApproval({
  title = "Conta pendente de aprovação",
  message = "Recebemos seu cadastro. Um administrador vai revisar seus dados e liberar o acesso.",
}: Props) {
  return (
    <AuthShell>
      <div className="relative mx-auto w-full max-w-[420px] rounded-[24px] p-[1px] overflow-hidden entrance">
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "conic-gradient(from var(--border-angle), transparent 0%, transparent 70%, var(--accent-500) 85%, transparent 100%)",
            animation: "border-spin 4s linear infinite",
          }}
        />
        <div className="relative z-10 w-full rounded-[23px] bg-[#09080e] p-8 text-center shadow-2xl border border-white/5">
          <BrandMark className="mx-auto h-20 drop-shadow-[0_0_15px_rgba(109,91,245,0.6)]" />
          <span className="mx-auto mt-8 grid size-16 place-items-center rounded-full bg-warning/10 text-warning">
            <Clock3 className="size-7" />
          </span>
          <h1 className="mt-6 text-2xl font-bold">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-text-2">{message}</p>
          <Link to="/login" className="mt-7 block">
            <Button variant="secondary" className="w-full">
              Voltar ao login
            </Button>
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
