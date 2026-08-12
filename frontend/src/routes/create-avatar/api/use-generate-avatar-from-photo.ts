import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { uploadAvatarReference, generateAvatarFromPhoto } from "@/services/avatarService";
import { CLOTHING_MODE, CLOTHING_PART } from "@/models/avatar";
import type { ImageGenerationDTO } from "@/models/avatar";
import { extractError } from "@/utils/api-error";
import type { AvatarPhotoFormValues } from "../components/photo-customization-mode/schema";

export function useGenerateAvatarFromPhoto() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: AvatarPhotoFormValues) => {
            const photoResponse = await uploadAvatarReference(data.fotoPrincipal as File);
            const photoUrl = photoResponse.data.url as string;

            const isUpload = data.modoRoupa === "Upload de imagem";
            let clothingImageUrl: string | undefined;

            if (isUpload) {
                const clothingResponse = await uploadAvatarReference(data.fotoRoupa as File);
                clothingImageUrl = clothingResponse.data.url as string;
            }

            const response = await generateAvatarFromPhoto({
                photoUrl,
                clothingMode: CLOTHING_MODE[data.modoRoupa],
                clothingImageUrl,
                clothingPart: isUpload && data.tipoPeca ? CLOTHING_PART[data.tipoPeca] : undefined,
                clothingInstructions: data.instrucoesRoupa?.trim() || undefined,
                extraOptions: data.opcoesAdicionais?.trim() || undefined,
            });

            return response.data as ImageGenerationDTO;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["avatar-usage"] });
        },
        onError: (err) => toast.error(extractError(err, "Erro ao gerar avatar. Tente novamente.")),
    });
}