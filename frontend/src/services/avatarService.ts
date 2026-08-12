import { requestBackend } from "@/utils/requests";
import type { AvatarConfigDTO, AvatarFromPhotoRequest } from "@/models/avatar";

export const generateAvatar = (
    config: AvatarConfigDTO,
    referenceImageUrl?: string | null,
    clothingImageUrl?: string | null,
    clothingPart?: string | null,
) =>
    requestBackend({
        method: "POST",
        url: "/api/avatars/generation",
        data: {
            config,
            referenceImageUrl: referenceImageUrl ?? null,
            clothingImageUrl: clothingImageUrl ?? null,
            clothingPart: clothingPart ?? null,
        },
        withCredentials: true,
    });

export const regenerateAvatar = (parentId: number, referenceImageUrl?: string | null) =>
    requestBackend({
        method: "POST",
        url: `/api/avatars/generation/${parentId}/regenerate`,
        data: { referenceImageUrl: referenceImageUrl ?? null },
        withCredentials: true,
    });

export const getGeneration = (id: number) =>
    requestBackend({ method: "GET", url: `/api/avatars/generation/${id}`, withCredentials: true });

export const getAvatarUsage = () =>
    requestBackend({ method: "GET", url: "/api/avatars/generation/usage", withCredentials: true });

export const saveAvatarFromGeneration = (generationId: number, name: string, customPrompt?: string) =>
    requestBackend({
        method: "POST",
        url: "/api/avatars/from-generation",
        data: { generationId, name, customPrompt },
        withCredentials: true,
    });

export const saveAvatarFromUpload = (imageUrl: string, name: string, customPrompt?: string) =>
    requestBackend({
        method: "POST",
        url: "/api/avatars/from-upload",
        data: { imageUrl, name, customPrompt },
        withCredentials: true,
    });

export const listAvatars = (page = 0, size = 20) =>
    requestBackend({
        method: "GET",
        url: "/api/avatars",
        withCredentials: true,
        params: { page, size },
    });

export const renameAvatar = (id: number, name: string) =>
    requestBackend({ method: "PUT", url: `/api/avatars/${id}`, data: { name }, withCredentials: true });

export const deleteAvatar = (id: number) =>
    requestBackend({ method: "DELETE", url: `/api/avatars/${id}`, withCredentials: true });

export const uploadAvatarReference = (file: File) => {
    const data = new FormData();
    data.append("file", file);
    return requestBackend({
        method: "POST",
        url: "/api/avatars/reference",
        data,
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const listGalleryAvatars = (gender?: string, type?: string) =>
    requestBackend({
        method: "GET",
        url: "/api/avatars/gallery",
        withCredentials: true,
        params: { gender: gender || undefined, type: type || undefined },
    });


export const downloadStorageFile = (url: string, filename?: string) =>
    requestBackend({
        method: "GET",
        url: "/api/storage/download",
        withCredentials: true,
        params: { url, filename },
        responseType: "blob",
    });

export const generateAvatarFromPhoto = (data: AvatarFromPhotoRequest) =>
    requestBackend({
        method: "POST",
        url: "/api/avatars/generation/from-photo",
        data,
        withCredentials: true,
    });

