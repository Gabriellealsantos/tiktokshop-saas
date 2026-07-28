import { requestBackend } from "@/utils/requests";

export const getStudioPromptConfig = () =>
    requestBackend({
        method: "GET",
        url: "/api/admin/studio/prompt-config",
        withCredentials: true,
    });

export const updateStudioPromptConfig = (promptInstruction: string) =>
    requestBackend({
        method: "PUT",
        url: "/api/admin/studio/prompt-config",
        data: { promptInstruction },
        withCredentials: true,
    });