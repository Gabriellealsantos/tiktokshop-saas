/**
 * Captura o frame atual de um <video> como PNG (Blob), via canvas.
 * Usado no fluxo /templates para gerar o "print do vídeo" que serve de base
 * (imagem de referência) para os swaps de pessoa/roupa.
 */
export function captureVideoFrame(video: HTMLVideoElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      reject(new Error("Vídeo ainda não carregou (sem dimensões)."));
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Não foi possível obter o contexto do canvas."));
      return;
    }

    try {
      ctx.drawImage(video, 0, 0, width, height);
    } catch (e) {
      // Vídeo cross-origin sem CORS "tainta" o canvas e bloqueia a exportação.
      reject(e instanceof Error ? e : new Error("Falha ao desenhar o frame."));
      return;
    }

    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao exportar o frame."))),
      "image/png"
    );
  });
}
