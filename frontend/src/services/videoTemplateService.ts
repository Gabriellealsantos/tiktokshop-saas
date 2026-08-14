import { requestBackend } from "@/utils/requests";
import type {
  SwapClothesRequest,
  SwapPersonRequest,
  VideoPromptRequest,
  VideoTemplateForm,
} from "@/models/videoTemplate";

// ─────────────────────────────────────────────────────────────────────────────
// Fluxo "Templates / Extrair movimento" — chamadas HTTP.
// Segue o padrão de viralService.ts: funções axios puras; os componentes consomem
// via react-query. Todas exigem sessão autenticada (withCredentials injeta o Bearer).
// ─────────────────────────────────────────────────────────────────────────────

// Catálogo (/api/video-templates)

/** GET /api/video-templates — públicos + privados do usuário (paginado). */
export const listVideoTemplates = (params: { category?: string; page?: number; size?: number } = {}) =>
  requestBackend({
    method: "GET",
    url: "/api/video-templates",
    params: {
      category: params.category || undefined,
      page: params.page ?? 0,
      size: params.size ?? 20,
    },
    withCredentials: true,
  });

// Geração (/api/templates)

/** POST /api/templates/frame — sobe o frame capturado (canvas) → { url }. */
export const uploadTemplateFrame = (blob: Blob) => {
  const data = new FormData();
  data.append("file", blob, "frame.png");
  return requestBackend({
    method: "POST",
    url: "/api/templates/frame",
    data,
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/** POST /api/templates/swap-person — troca a pessoa do frame pelo avatar (consome cota). */
export const swapPerson = (body: SwapPersonRequest) =>
  requestBackend({ method: "POST", url: "/api/templates/swap-person", data: body, withCredentials: true });

/** POST /api/templates/swap-clothes — veste o produto na imagem base (consome cota). */
export const swapClothes = (body: SwapClothesRequest) =>
  requestBackend({ method: "POST", url: "/api/templates/swap-clothes", data: body, withCredentials: true });

/** POST /api/templates/prompt — gera o prompt Veo3 (texto, NÃO consome cota). */
export const generateVideoPrompt = (body: VideoPromptRequest) =>
  requestBackend({ method: "POST", url: "/api/templates/prompt", data: body, withCredentials: true });

/** GET /api/templates/usage — cota diária do VIDEO_TEMPLATE ({used,max,remaining}). */
export const getTemplateUsage = () =>
  requestBackend({ method: "GET", url: "/api/templates/usage", withCredentials: true });

// ─────────────────────────────────────────────────────────────────────────────
// Admin (/api/admin/video-templates) — cadastro dinâmico dos templates PÚBLICOS.
// Exige ROLE_ADMIN. Mesmo padrão de listAdminViralTemplates/createViralTemplate
// (viralService.ts).
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/admin/video-templates — lista completa (só os públicos). */
export const listAdminVideoTemplates = () =>
  requestBackend({ method: "GET", url: "/api/admin/video-templates", withCredentials: true });

/** POST /api/admin/video-templates — cria template público. */
export const createVideoTemplate = (body: VideoTemplateForm) =>
  requestBackend({ method: "POST", url: "/api/admin/video-templates", data: body, withCredentials: true });

/** PUT /api/admin/video-templates/{id} — atualiza template público. */
export const updateVideoTemplate = (id: number, body: VideoTemplateForm) =>
  requestBackend({ method: "PUT", url: `/api/admin/video-templates/${id}`, data: body, withCredentials: true });

/** DELETE /api/admin/video-templates/{id} */
export const deleteVideoTemplate = (id: number) =>
  requestBackend({ method: "DELETE", url: `/api/admin/video-templates/${id}`, withCredentials: true });
