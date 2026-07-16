import { requestBackend } from "../utils/requests";

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  cpf?: string;
};

/** Auto-cadastro público (POST /api/auth/register). Sem token — endpoint permitAll. */
export const register = (data: RegisterRequest) =>
  requestBackend({ method: "POST", url: "/api/auth/register", data });
