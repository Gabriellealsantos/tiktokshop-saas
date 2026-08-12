import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { listAvatars, deleteAvatar, listGalleryAvatars, renameAvatar } from "@/services/avatarService";
import type { AvatarDTO } from "@/models/avatar";
import { getAvatarUsage } from "@/services/avatarService";
import { extractError } from "@/utils/api-error";

export type GalleryAvatarDTO = {
    id: number;
    name: string;
    imageUrl: string;
    gender?: string;
    type?: string;
    customPrompt?: string | null;
};

export type DailyUsageDTO = {
    used: number;
    max: number;
    remaining: number;
};


export function useMyAvatars() {
    return useQuery({
        queryKey: ["avatars"],
        queryFn: async () => {
            const response = await listAvatars(0, 20);
            const page = response.data as { content: AvatarDTO[]; page?: { totalElements: number } };
            return {
                items: page.content ?? [],
                total: page.page?.totalElements ?? page.content?.length ?? 0,
            };
        },
    });
}

export function useGalleryAvatars() {
    return useQuery({
        queryKey: ["gallery-avatars"],
        queryFn: async () => {
            const response = await listGalleryAvatars();
            return response.data as GalleryAvatarDTO[];
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useDeleteAvatar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteAvatar(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["avatars"] });
            toast.success("Avatar excluído.");
        },
        onError: (err) => toast.error(extractError(err, "Não foi possível excluir o avatar.")),
    });
}

export function useAvatarUsage() {
    return useQuery({
        queryKey: ["avatar-usage"],
        queryFn: async () => {
            const response = await getAvatarUsage();
            return response.data as DailyUsageDTO;
        },
    });
}

export function useRenameAvatar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, name }: { id: number; name: string }) => renameAvatar(id, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["avatars"] });
            toast.success("Avatar renomeado.");
        },
        onError: (err) => toast.error(extractError(err, "Não foi possível renomear.")),
    });
}