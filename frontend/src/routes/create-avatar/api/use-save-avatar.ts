import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


import { saveAvatarFromGeneration } from "@/services/avatarService";
import type { AvatarDTO } from "@/models/avatar";
import { extractError } from "@/utils/api-error";


export function useSaveAvatar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ generationId, name }: { generationId: number; name: string }) => {
            const response = await saveAvatarFromGeneration(generationId, name);
            return response.data as AvatarDTO;
        },
        onSuccess: (avatar) => {
            queryClient.invalidateQueries({ queryKey: ["avatars"] });
            toast.success(`"${avatar.name}" foi salvo na sua biblioteca.`);
        },
        onError: (err) =>
            toast.error(extractError(err, "Não foi possível salvar o avatar.")),
    });
}