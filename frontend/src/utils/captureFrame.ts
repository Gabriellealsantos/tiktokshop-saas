/**
 * Captura o frame atual de um <video> como PNG (Blob), via canvas.
 * Usado no fluxo /templates para gerar o "print do vídeo" que serve de base
 * (imagem de referência) para os swaps de pessoa/roupa.
 */
export function captureVideoFrame(video: HTMLVideoElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const doCapture = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (!width || !height) {
        reject(new Error("Vídeo sem dimensões após carregamento."));
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
        reject(e instanceof Error ? e : new Error("Falha ao desenhar o frame."));
        return;
      }

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao exportar o frame."))),
        "image/png"
      );
    };

    if (video.readyState >= 2) {
      doCapture();
    } else {
      video.addEventListener("loadeddata", () => doCapture(), { once: true });
    }
  });
}
