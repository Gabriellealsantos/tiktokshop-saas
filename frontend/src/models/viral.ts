// ─────────────────────────────────────────────────────────────────────────────
// Tipos do fluxo viral (Trend Boost). Espelham os DTOs do backend em
// com.venyx.tiktokshop.dtos.Viral*  (/api/viral/**).
// ─────────────────────────────────────────────────────────────────────────────

export interface PendingJob {
  jobId: string;
  status: "PENDING";
}

export interface GenerationResultMessage {
  jobId: string;
  type: string;
  status: "COMPLETED" | "FAILED";
  data: unknown;
  error: string | null;
}

/** Item da listagem de templates — GET /api/viral/templates */
export interface ViralTemplateSummary {
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  previewVideoUrl: string | null;
  /** Tag livre de agrupamento/filtro (ex.: "POV"). */
  category: string | null;
}

/** Personagem/objeto de um template (slug escopado ao template: char-1..char-N) */
export interface ViralCharacter {
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  /** Seção dentro do template: vovo/vova, objeto/fruta. */
  subcategory: string | null;
}

/** Tom disponível (label/desc vêm da API; o ícone é resolvido no front por slug) */
export interface ViralTone {
  slug: string;
  label: string;
  description: string | null;
}

/** Detalhe do template — GET /api/viral/templates/{slug} */
export interface ViralTemplateDetail extends ViralTemplateSummary {
  characters: ViralCharacter[];
  tones: ViralTone[];
}

/** Roteiro viral — saída de POST /scripts e entrada (escolhido) em POST /prompt */
export interface ViralScript {
  id: string;
  title: string;
  description: string;
  quote: string;
}

/** POST /api/viral/scripts */
export interface ViralScriptsRequest {
  templateSlug: string;
  characterSlug: string;
  tone: string;
}

/** POST /api/viral/scripts → resposta */
export interface ViralScriptsResponse {
  scripts: ViralScript[];
}

/** POST /api/viral/prompt */
export interface ViralPromptRequest {
  templateSlug: string;
  characterSlug: string;
  tone: string;
  script: ViralScript;
}

/**
 * POST /api/viral/prompt → ImageGenerationDTO. No fluxo viral o texto final vem
 * em `prompt` e `imageUrl` fica null (a imagem/vídeo é gerada fora, no Veo/Flow).
 */
export interface ViralImageGeneration {
  id: number;
  parentId: number | null;
  flowType: string;
  status: string;
  prompt: string;
  imageUrl: string | null;
  error: string | null;
  createdAt: string;
}

/** GET /api/viral/usage — cota diária do VIRAL_MODEL (separada do avatar) */
export interface ViralUsage {
  used: number;
  max: number;
  remaining: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin (/api/admin/viral/**) — DTOs com id/active (ViralTemplateAdminDTO etc.)
// e payloads de formulário (ViralTemplateFormDTO etc.).
// ─────────────────────────────────────────────────────────────────────────────

export interface ViralTemplateAdmin {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  previewVideoUrl: string | null;
  scriptInstruction: string;
  promptInstruction: string;
  category: string | null;
  active: boolean;
}

export interface ViralCharacterAdmin {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  subcategory: string | null;
  sortOrder: number;
  active: boolean;
}

export interface ViralToneAdmin {
  id: number;
  slug: string;
  label: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
}

/** POST/PUT /api/admin/viral/templates */
export interface ViralTemplateForm {
  slug: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  previewVideoUrl?: string | null;
  scriptInstruction: string;
  promptInstruction: string;
  category?: string | null;
  active?: boolean;
}

/** POST /templates/{templateId}/characters e PUT /characters/{id} */
export interface ViralCharacterForm {
  slug: string;
  name: string;
  description: string;
  imageUrl?: string | null;
  subcategory?: string | null;
  sortOrder?: number;
  active?: boolean;
}

/** POST/PUT /api/admin/viral/tones */
export interface ViralToneForm {
  slug: string;
  label: string;
  description?: string | null;
  sortOrder?: number;
  active?: boolean;
}
