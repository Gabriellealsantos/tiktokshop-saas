import { useEffect, useRef } from "react";
import { subscribeUser } from "@/utils/ws";
import { requestBackend } from "@/utils/requests";
import type { GenerationResultMessage } from "@/models/viral";
import type { ImageGenerationDTO } from "@/models/avatar";

const POLL_INTERVAL_MS = 3000;

/**
 * Jobs sem id numérico (correlationId) não são persistidos, então não há o que
 * consultar — para esses vale um teto de tempo. O pior caso é a geração de texto
 * com as 3 tentativas de retry do Gemini.
 */
const CORRELATION_TIMEOUT_MS = 180_000;

type PendingJob = {
  resolve: (val: GenerationResultMessage) => void;
  reject: (reason?: unknown) => void;
  timer?: ReturnType<typeof setTimeout>;
  pollTimer?: ReturnType<typeof setInterval>;
};

/**
 * O WebSocket envia o prompt como string no fluxo viral, enquanto o polling
 * devolve o DTO inteiro. Normaliza para que os dois caminhos entreguem o mesmo.
 */
function toMessage(jobId: string, job: ImageGenerationDTO): GenerationResultMessage {
  const isPromptFlow = job.flowType === "VIRAL_MODEL";
  return {
    jobId,
    type: isPromptFlow ? "VIRAL_PROMPT" : job.flowType,
    status: job.status,
    data: isPromptFlow ? job.prompt : job,
    error: job.error,
  } as GenerationResultMessage;
}

/**
 * Assina o canal WebSocket de geração do usuário e expõe waitForJob.
 * O STOMP é o caminho rápido; o polling é a rede de segurança para quando
 * a conexão cai no meio da geração.
 */
export function useGenerationWs() {
  const pendingJobsRef = useRef(new Map<string, PendingJob>());

  const clearPending = (jobId: string): PendingJob | undefined => {
    const pending = pendingJobsRef.current.get(jobId);
    if (!pending) return undefined;
    if (pending.timer) clearTimeout(pending.timer);
    if (pending.pollTimer) clearInterval(pending.pollTimer);
    pendingJobsRef.current.delete(jobId);
    return pending;
  };

  useEffect(() => {
    const jobs = pendingJobsRef.current;

    const unsubscribe = subscribeUser<GenerationResultMessage>(
      "/queue/generation",
      (msg) => clearPending(msg.jobId)?.resolve(msg),
    );

    return () => {
      unsubscribe();
      for (const pending of jobs.values()) {
        if (pending.timer) clearTimeout(pending.timer);
        if (pending.pollTimer) clearInterval(pending.pollTimer);
        pending.reject(new Error("Componente desmontado, cancelando job."));
      }
      jobs.clear();
    };
  }, []);

  const waitForJob = (jobId: string): Promise<GenerationResultMessage> => {
    return new Promise((resolve, reject) => {
      const isPersisted = /^\d+$/.test(jobId);

      let pollTimer: ReturnType<typeof setInterval> | undefined;
      let timer: ReturnType<typeof setTimeout> | undefined;

      if (isPersisted) {
        // Sem teto de tempo: quem encerra é o backend, marcando COMPLETED ou
        // FAILED. O OrphanJobCleaner garante que todo job termina em até 30 min.
        pollTimer = setInterval(async () => {
          try {
            const res = await requestBackend({
              method: "GET",
              url: `/api/generations/${jobId}`,
              withCredentials: true,
            });
            const job = res.data as ImageGenerationDTO;
            if (job.status === "COMPLETED" || job.status === "FAILED") {
              clearPending(jobId)?.resolve(toMessage(jobId, job));
            }
          } catch (err) {
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status === 404 || status === 403) {
              clearPending(jobId)?.reject(new Error("Geração não encontrada."));
            }
            // Demais erros são transitórios — tenta de novo no próximo tick.
          }
        }, POLL_INTERVAL_MS);
      } else {
        timer = setTimeout(() => {
          clearPending(jobId)?.reject(new Error("Tempo limite excedido para a operação."));
        }, CORRELATION_TIMEOUT_MS);
      }

      pendingJobsRef.current.set(jobId, { resolve, reject, timer, pollTimer });
    });
  };

  return { waitForJob };
}