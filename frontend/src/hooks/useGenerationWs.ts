import { useEffect, useRef } from "react";
import { subscribeUser } from "@/utils/ws";
import { requestBackend } from "@/utils/requests";
import type { GenerationResultMessage } from "@/models/viral";

const POLL_INTERVAL_MS = 3000;

/**
 * Hook que assina o canal WebSocket de geração do usuário atual
 * e disponibiliza a função waitForJob para aguardar um resultado.
 */
export function useGenerationWs() {
  // Mantemos um registro das promises aguardando resolução: jobId -> { resolve, reject, timer, pollTimer }
  const pendingJobsRef = useRef(
    new Map<
      string,
      {
        resolve: (val: GenerationResultMessage) => void;
        reject: (reason?: any) => void;
        timer: ReturnType<typeof setTimeout>;
        pollTimer?: ReturnType<typeof setInterval>;
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
          if (pending.pollTimer) clearInterval(pending.pollTimer);
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
        if (pending.pollTimer) clearInterval(pending.pollTimer);
        pending.reject(new Error("Componente desmontado, cancelando job."));
      }
      pendingJobsRef.current.clear();
    };
  }, []);

  /**
   * Aguarda um job assíncrono.
   * Faz timeout em 90s, no qual cai num fallback de polling.
   * Se o job tiver ID numérico (salvo no BD), faz polling ativo a cada 3s.
   */
  const waitForJob = (jobId: string, timeoutMs = 90000): Promise<GenerationResultMessage> => {
    return new Promise((resolve, reject) => {
      const isNumericId = /^\d+$/.test(jobId);

      let pollTimer: ReturnType<typeof setInterval> | undefined;

      if (isNumericId) {
        // Se for um job persistido no banco, faz o polling ativo de segurança
        pollTimer = setInterval(async () => {
          try {
            const res = await requestBackend({
              method: "GET",
              url: `/api/generations/${jobId}`,
              withCredentials: true,
            });
            const status = res.data.status;
            if (status === "COMPLETED" || status === "FAILED") {
              const pending = pendingJobsRef.current.get(jobId);
              if (pending) {
                clearTimeout(pending.timer);
                clearInterval(pending.pollTimer);
                pendingJobsRef.current.delete(jobId);
                pending.resolve({
                  jobId,
                  type: res.data.flowType,
                  status,
                  data: res.data,
                  error: res.data.error,
                });
              }
            }
          } catch (err) {
            // Ignora erro transitório no polling
          }
        }, POLL_INTERVAL_MS);
      }

      const timer = setTimeout(async () => {
        const pending = pendingJobsRef.current.get(jobId);
        if (pending) {
          if (pending.pollTimer) clearInterval(pending.pollTimer);
          pendingJobsRef.current.delete(jobId);
        }

        if (isNumericId) {
          // Tenta buscar no fallback como último recurso
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
        } else {
          reject(new Error("Tempo limite excedido para a operação (correlationId)."));
        }
      }, timeoutMs);

      pendingJobsRef.current.set(jobId, { resolve, reject, timer, pollTimer });
    });
  };

  return { waitForJob };
}
