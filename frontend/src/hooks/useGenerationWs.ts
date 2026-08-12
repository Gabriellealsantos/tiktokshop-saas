import { useEffect, useRef } from "react";
import { subscribeUser } from "@/utils/ws";
import { requestBackend } from "@/utils/requests";
import type { GenerationResultMessage } from "@/models/viral";

/**
 * Hook que assina o canal WebSocket de geração do usuário atual
 * e disponibiliza a função waitForJob para aguardar um resultado.
 */
export function useGenerationWs() {
  // Mantemos um registro das promises aguardando resolução: jobId -> { resolve, reject, timer }
  const pendingJobsRef = useRef(
    new Map<
      string,
      {
        resolve: (val: GenerationResultMessage) => void;
        reject: (reason?: any) => void;
        timer: ReturnType<typeof setTimeout>;
      }
    >(),
  );

  useEffect(() => {
    const unsubscribe = subscribeUser<GenerationResultMessage>(
      "/queue/generation",
      (msg) => {
        const jobId = msg.jobId;
        const pending = pendingJobsRef.current.get(jobId);
        if (pending) {
          clearTimeout(pending.timer);
          pendingJobsRef.current.delete(jobId);
          pending.resolve(msg);
        }
      },
    );

    return () => {
      unsubscribe();
      // Limpa todos os timers no unmount
      for (const pending of pendingJobsRef.current.values()) {
        clearTimeout(pending.timer);
        pending.reject(new Error("Componente desmontado, cancelando job."));
      }
      pendingJobsRef.current.clear();
    };
  }, []);

  /**
   * Aguarda um job assíncrono.
   * Faz timeout em 90s, no qual cai num fallback de polling.
   */
  const waitForJob = (jobId: string, timeoutMs = 90000): Promise<GenerationResultMessage> => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(async () => {
        pendingJobsRef.current.delete(jobId);
        
        // Tenta buscar no fallback
        try {
          const res = await requestBackend({
            method: "GET",
            url: `/api/generations/${jobId}`,
            withCredentials: true,
          });
          
          const status = res.data.status;
          if (status === "COMPLETED" || status === "FAILED") {
             resolve({
                 jobId,
                 type: res.data.flowType,
                 status,
                 data: res.data,
                 error: res.data.error,
             });
          } else {
             reject(new Error("Tempo limite excedido. O job ainda está pendente ou falhou silenciosamente."));
          }
        } catch (err) {
          reject(new Error("Tempo limite excedido e o job não pôde ser recuperado."));
        }
      }, timeoutMs);

      pendingJobsRef.current.set(jobId, { resolve, reject, timer });
    });
  };

  return { waitForJob };
}
