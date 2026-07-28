import { requestBackend } from "@/utils/requests";

// ─────────────────────────────────────────────────────────────────────────────
// Upload genérico pro storage (S3/MinIO) que não é específico do domínio viral.
// uploadStorage/uploadVideoStorage (imagem/vídeo) seguem em viralService.ts por
// serem usados só lá; áudio nasce aqui para não acoplar o som de notificação ao
// service do fluxo viral.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Upload de áudio pro storage (S3/MinIO). Retorna { url }. Só aceita
 * mp3/wav/ogg (o backend valida magic bytes).
 */
export const uploadAudioStorage = (file: File, folder: string) => {
  const data = new FormData();
  data.append("file", file);
  data.append("folder", folder);
  return requestBackend({
    method: "POST",
    url: "/api/admin/storage/upload-audio",
    data,
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });
};