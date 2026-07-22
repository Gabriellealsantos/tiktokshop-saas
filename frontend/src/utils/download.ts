import { downloadStorage } from "@/services/viralService";

const triggerSave = (blob: Blob, filename: string) => {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
};

/**
 * Baixa uma mídia forçando o "salvar como" no browser.
 * - URL da mesma origem (ex.: /characters/...png estático): fetch direto.
 * - URL cross-origin (S3/MinIO): passa pelo proxy do backend, porque o browser
 *   ignora o atributo download cross-origin e navegaria pro storage.
 */
export const downloadMedia = async (url: string, filename: string) => {
  const isCrossOrigin =
    /^https?:\/\//i.test(url) && new URL(url).origin !== window.location.origin;

  if (isCrossOrigin) {
    const res = await downloadStorage(url, filename);
    triggerSave(res.data as Blob, filename);
    return;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed: ${res.status}`);
  triggerSave(await res.blob(), filename);
};
