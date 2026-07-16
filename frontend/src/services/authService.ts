import { requestBackend } from "../utils/requests";
import type { RegisterRequest } from "@/models/user";

// ── Auth — chamadas HTTP ─────────────────────────────────────────────────────

/** Auto-cadastro público (POST /api/auth/register). Sem token — endpoint permitAll. */
export const register = (data: RegisterRequest) =>
  requestBackend({ method: "POST", url: "/api/auth/register", data });
