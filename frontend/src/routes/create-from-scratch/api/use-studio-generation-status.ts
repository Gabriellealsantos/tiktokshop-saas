import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { generateStudioImage, getStudioSession } from "@/services/studioService";
import { subscribeTopic } from "@/utils/ws";
import type { StudioImageRequest, CreationSessionDTO } from "@/models/studio";
import { extractError } from "@/utils/api-error";

const POLL_INTERVAL_MS = 3000;

export function useStudioGenerationStatus() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [session, setSession] = useState<CreationSessionDTO | null>(null);

    const awaitingIdRef = useRef<number | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopPolling = useCallback(() => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    }, []);

    const settle = useCallback(
        (event: CreationSessionDTO) => {
            if (event.id !== awaitingIdRef.current) return;

            if (event.status === "COMPLETED") {
                setSession(event);
                setIsGenerating(false);
                awaitingIdRef.current = null;
                stopPolling();
            } else if (event.status === "FAILED") {
                setIsGenerating(false);
                awaitingIdRef.current = null;
                stopPolling();
                toast.error(
                    (event.config?.error as string) ?? "A geração falhou. Tente novamente.",
                );
            }
        },
        [stopPolling],
    );

    // Caminho feliz: STOMP empurra o resultado assim que fica pronto.
    useEffect(() => {
        const dispose = subscribeTopic<CreationSessionDTO>(
            "/user/queue/studio-status",
            settle,
        );
        return dispose;
    }, [settle]);

    // Limpa o polling se o componente desmontar no meio.
    useEffect(() => stopPolling, [stopPolling]);

    const generate = useCallback(
        async (req: StudioImageRequest) => {
            try {
                const response = await generateStudioImage(req);
                const created = response.data as CreationSessionDTO;

                if (created.status === "FAILED") {
                    toast.error(
                        (created.config?.error as string) ?? "A geração falhou. Tente novamente.",
                    );
                    return;
                }

                awaitingIdRef.current = created.id;
                setSession(created);
                setIsGenerating(true);

                // Rede de segurança: se o STOMP não chegar, o polling resolve.
                stopPolling();
                pollRef.current = setInterval(async () => {
                    try {
                        const poll = await getStudioSession(created.id);
                        settle(poll.data as CreationSessionDTO);
                    } catch {
                        // erro transitório de rede: ignora, tenta de novo no próximo tick
                    }
                }, POLL_INTERVAL_MS);
            } catch (err) {
                toast.error(extractError(err, "Erro ao gerar a imagem. Tente novamente."));
            }
        },
        [settle, stopPolling],
    );

    return {
        isGenerating,
        session,
        generatedImage: (session?.config?.imageUrl as string) ?? null,
        generate,
    };
}