import type { StudioImageRequest, StudioVideoRequest } from "@/models/studio";
import { requestBackend } from "@/utils/requests";


export const generateStudioImage = (data: StudioImageRequest) =>
    requestBackend({
        method: "POST",
        url: "/api/studio/image",
        data,
        withCredentials: true,
    });

export const generateStudioVideoPrompt = (data: StudioVideoRequest) =>
    requestBackend({
        method: "POST",
        url: "/api/studio/video-prompt",
        data,
        withCredentials: true,
    });

export const getStudioSession = (id: number) =>
    requestBackend({ method: "GET", url: `/api/studio/${id}`, withCredentials: true });

export const getStudioUsage = () =>
    requestBackend({ method: "GET", url: "/api/studio/usage", withCredentials: true });