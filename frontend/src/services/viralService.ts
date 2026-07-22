import { requestBackend } from "@/utils/requests";
import type {
  ViralCharacterForm,
  ViralPromptRequest,
  ViralScriptsRequest,
  ViralTemplateForm,
  ViralToneForm,
} from "@/models/viral";

// ─────────────────────────────────────────────────────────────────────────────
// Fluxo viral (Trend Boost) — chamadas HTTP. Segue o padrão de productService.ts:
// funções axios puras; os componentes consomem via react-query (useQuery/useMutation).
// Todas exigem sessão autenticada (withCredentials injeta o Bearer).
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/viral/templates — lista de templates (cards). */
export const listViralTemplates = () =>
  requestBackend({ method: "GET", url: "/api/viral/templates", withCredentials: true });

/** GET /api/viral/templates/{slug} — detalhe com personagens e tons. */
export const getViralTemplate = (slug: string) =>
  requestBackend({ method: "GET", url: `/api/viral/templates/${slug}`, withCredentials: true });

/** POST /api/viral/scripts — gera 3 roteiros (NÃO consome cota). */
export const generateViralScripts = (body: ViralScriptsRequest) =>
  requestBackend({ method: "POST", url: "/api/viral/scripts", data: body, withCredentials: true });

/** POST /api/viral/prompt — gera o prompt final do vídeo (consome cota; 429 no limite). */
export const generateViralPrompt = (body: ViralPromptRequest) =>
  requestBackend({ method: "POST", url: "/api/viral/prompt", data: body, withCredentials: true });

/** GET /api/viral/usage — cota diária do fluxo viral ({used,max,remaining}). */
export const getViralUsage = () =>
  requestBackend({ method: "GET", url: "/api/viral/usage", withCredentials: true });

// ─────────────────────────────────────────────────────────────────────────────
// Admin (/api/admin/viral/**) — cadastro dinâmico. Exige ROLE_ADMIN.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Upload genérico de imagem pro storage (S3/MinIO). Retorna { url } que é usada
 * nos campos imageUrl/thumbnailUrl. Só aceita imagem (o backend valida magic bytes).
 */
export const uploadStorage = (file: File, folder: string) => {
  const data = new FormData();
  data.append("file", file);
  data.append("folder", folder);
  return requestBackend({
    method: "POST",
    url: "/api/admin/storage/upload",
    data,
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/**
 * Upload de vídeo pro storage (S3/MinIO). Retorna { url } usada em previewVideoUrl.
 * Só aceita vídeo (o backend valida magic bytes de mp4/webm). A validação de
 * duração/resolução é feita no client, antes de subir.
 */
export const uploadVideoStorage = (file: File, folder: string) => {
  const data = new FormData();
  data.append("file", file);
  data.append("folder", folder);
  return requestBackend({
    method: "POST",
    url: "/api/admin/storage/upload-video",
    data,
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/**
 * Baixa um arquivo do storage via proxy do backend (Content-Disposition: attachment).
 * Necessário porque a URL do S3/MinIO é cross-origin e o atributo download do <a>
 * é ignorado nesse caso — o browser navegaria pro storage em vez de baixar.
 */
export const downloadStorage = (url: string, filename: string) =>
  requestBackend({
    method: "GET",
    url: "/api/storage/download",
    params: { url, filename },
    responseType: "blob",
    withCredentials: true,
  });

// --- templates ---
export const listAdminViralTemplates = () =>
  requestBackend({ method: "GET", url: "/api/admin/viral/templates", withCredentials: true });

export const createViralTemplate = (body: ViralTemplateForm) =>
  requestBackend({ method: "POST", url: "/api/admin/viral/templates", data: body, withCredentials: true });

export const updateViralTemplate = (id: number, body: ViralTemplateForm) =>
  requestBackend({ method: "PUT", url: `/api/admin/viral/templates/${id}`, data: body, withCredentials: true });

export const deleteViralTemplate = (id: number) =>
  requestBackend({ method: "DELETE", url: `/api/admin/viral/templates/${id}`, withCredentials: true });

// --- personagens ---
export const listAdminViralCharacters = (templateId: number) =>
  requestBackend({ method: "GET", url: `/api/admin/viral/templates/${templateId}/characters`, withCredentials: true });

export const addViralCharacter = (templateId: number, body: ViralCharacterForm) =>
  requestBackend({ method: "POST", url: `/api/admin/viral/templates/${templateId}/characters`, data: body, withCredentials: true });

export const updateViralCharacter = (id: number, body: ViralCharacterForm) =>
  requestBackend({ method: "PUT", url: `/api/admin/viral/characters/${id}`, data: body, withCredentials: true });

export const deleteViralCharacter = (id: number) =>
  requestBackend({ method: "DELETE", url: `/api/admin/viral/characters/${id}`, withCredentials: true });

// --- tons (sem delete) ---
export const listAdminViralTones = () =>
  requestBackend({ method: "GET", url: "/api/admin/viral/tones", withCredentials: true });

export const createViralTone = (body: ViralToneForm) =>
  requestBackend({ method: "POST", url: "/api/admin/viral/tones", data: body, withCredentials: true });

export const updateViralTone = (id: number, body: ViralToneForm) =>
  requestBackend({ method: "PUT", url: `/api/admin/viral/tones/${id}`, data: body, withCredentials: true });
