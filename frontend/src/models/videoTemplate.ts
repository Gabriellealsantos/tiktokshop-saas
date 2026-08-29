// ─────────────────────────────────────────────────────────────────────────────
// Tipos do fluxo "Templates / Extrair movimento" (/api/video-templates + /api/templates).
// Espelham os DTOs do backend em com.venyx.tiktokshop.dtos.VideoTemplate* / Swap* / VideoPrompt*.
// ─────────────────────────────────────────────────────────────────────────────

export interface PendingJob {
  jobId: string;
  status: "PENDING";
}

/** Card da galeria — GET /api/video-templates. `owned` = vídeo privado (upload manual do usuário). */
export interface VideoTemplateSummary {
  slug: string;
  title: string;
  category: string | null;
  thumbnailUrl: string | null;
  videoUrl: string;
  owned: boolean;
  duration: string | null;
}

/** Modo de troca de roupa (casa com o backend ClothSwapMode). */
export type ClothSwapMode = "completo" | "substituir" | "adicionar" | "segurar_objeto";

/** Camada de áudio/fala do prompt gerado (casa com o backend VideoAudioMode). */
export type VideoAudioMode = "NARRACAO" | "MUSICA" | "SILENCIO";

/** POST /api/templates/swap-person */
export interface SwapPersonRequest {
  frameUrl: string;
  avatarImageUrl: string;
  /** Avatar original sem crop (corpo inteiro) — referência extra de tom de pele/corpo. */
  avatarBodyImageUrl?: string;
  customPrompt?: string;
  templateSlug?: string;
}

/** POST /api/templates/swap-clothes */
export interface SwapClothesRequest {
  baseImageUrl: string;
  productImageUrl: string;
  mode: ClothSwapMode;
  productName?: string;
  productDescription?: string;
  avatarImageUrl?: string;
  customPrompt?: string;
  templateSlug?: string;
}

/** Resposta dos swaps — ImageGenerationDTO (aqui `imageUrl` traz a imagem gerada). */
export interface ImageGenerationResult {
  id: number;
  parentId: number | null;
  flowType: string;
  status: string;
  prompt: string | null;
  imageUrl: string | null;
  error: string | null;
  createdAt: string;
}

/**
 * POST /api/templates/prompt. O produto é opcional e mutuamente exclusivo: `productId` para a
 * vitrine, `userProductId` para o produto próprio do usuário (espaços de id distintos).
 * Nenhum dos dois = "manter look atual", prompt sem produto.
 */
export interface VideoPromptRequest {
  templateSlug: string;
  productId?: number | null;
  userProductId?: number | null;
  finalImageUrl?: string | null;
  avatarImageUrl?: string | null;
}

/** POST /api/templates/prompt → texto Veo3 para o Google Flow. */
export interface VideoPromptResponse {
  prompt: string;
}

/** GET /api/templates/usage — cota diária do VIDEO_TEMPLATE (só os swaps consomem). */
export interface TemplateUsage {
  used: number;
  max: number;
  remaining: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin (/api/admin/video-templates) — cadastro dinâmico dos templates PÚBLICOS.
// Espelham VideoTemplateAdminDTO/VideoTemplateFormDTO. Só o admin usa.
// ─────────────────────────────────────────────────────────────────────────────

/** Visão administrativa completa (id, active, sortOrder e direção de prompt). */
export interface VideoTemplateAdmin {
  id: number;
  slug: string;
  title: string;
  category: string | null;
  thumbnailUrl: string | null;
  videoUrl: string;
  videoStyle: string | null;
  objective: string | null;
  tone: string | null;
  energy: string | null;
  duration: string | null;
  motionInstruction: string | null;
  /** LEGADO: só é enviado à IA quando `scenePrompt` está vazio. */
  imagePrompt: string | null;
  /** Descrição apenas da cena (FRAMING/POSE/EXPRESSION/OUTFIT/ENVIRONMENT), sem traços da pessoa. */
  scenePrompt: string | null;
  audioMode: VideoAudioMode;
  active: boolean;
  sortOrder: number;
}

/** POST /api/admin/video-templates e PUT /api/admin/video-templates/{id} */
export interface VideoTemplateForm {
  slug: string;
  title: string;
  category?: string | null;
  thumbnailUrl?: string | null;
  videoUrl: string;
  videoStyle?: string | null;
  objective?: string | null;
  tone?: string | null;
  energy?: string | null;
  duration?: string | null;
  motionInstruction?: string | null;
  imagePrompt?: string | null;
  scenePrompt?: string | null;
  audioMode?: VideoAudioMode;
  sortOrder?: number;
  active?: boolean;
}
