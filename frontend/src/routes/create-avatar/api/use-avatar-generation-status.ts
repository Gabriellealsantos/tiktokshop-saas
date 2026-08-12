import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { generateAvatar, getGeneration } from "@/services/avatarService";
import { subscribeTopic } from "@/utils/ws";
import type { AvatarConfigDTO, ImageGenerationDTO } from "@/models/avatar";
import { extractError } from "@/utils/api-error";

const POLL_INTERVAL_MS = 3000;

type GenerateInput = {
    config: AvatarConfigDTO;
    clothingImageUrl?: string | null;
    clothingPart?: string | null;
};

export function useAvatarGenerationStatus() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generation, setGeneration] = useState<ImageGenerationDTO | null>(null);

    const awaitingIdRef = useRef<number | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopPolling = useCallback(() => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    }, []);

    const settle = useCallback(
        (event: ImageGenerationDTO) => {
            if (event.id !== awaitingIdRef.current) return;

            if (event.status === "COMPLETED") {
                setGeneration(event);
                setIsGenerating(false);
                awaitingIdRef.current = null;
                stopPolling();
            } else if (event.status === "FAILED") {
                setIsGenerating(false);
                awaitingIdRef.current = null;
                stopPolling();
                toast.error(event.error ?? "A geração falhou. Tente novamente.");
            }
        },
        [stopPolling],
    );

    useEffect(() => {
        const dispose = subscribeTopic<ImageGenerationDTO>(
            "/user/queue/avatar-status",
            settle,
        );
        return dispose;
    }, [settle]);

    useEffect(() => stopPolling, [stopPolling]);

    const startPolling = useCallback(
        (id: number) => {
            stopPolling();
            pollRef.current = setInterval(async () => {
                try {
                    const poll = await getGeneration(id);
                    settle(poll.data as ImageGenerationDTO);
                } catch {
                    // erro transitório: ignora, tenta no próximo tick
                }
            }, POLL_INTERVAL_MS);
        },
        [settle, stopPolling],
    );

    const start = useCallback(
        (job: ImageGenerationDTO) => {
            if (job.status === "FAILED") {
                toast.error(job.error ?? "A geração falhou. Tente novamente.");
                return;
            }
            awaitingIdRef.current = job.id;
            setGeneration(job);
            setIsGenerating(true);
            startPolling(job.id);
        },
        [startPolling],
    );

    const generate = useCallback(
        async ({ config, clothingImageUrl, clothingPart }: GenerateInput) => {
            try {
                const response = await generateAvatar(config, null, clothingImageUrl, clothingPart);
                start(response.data as ImageGenerationDTO);
            } catch (err) {
                toast.error(extractError(err, "Erro ao gerar avatar. Tente novamente."));
            }
        },
        [start],
    );

    return {
        isGenerating,
        generation,
        generatedImage: generation?.imageUrl ?? null,
        generate,
        track: start,
    };
}