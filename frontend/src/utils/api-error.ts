import axios from "axios";

export const extractError = (err: unknown, fallback: string) => {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string; errors?: { message: string }[] };
        const message = data?.errors?.[0]?.message ?? data?.message ?? "";

        if (message.includes("prohibited content") || message.includes("Prohibited")) {
            return "Não foi possível gerar a partir desta imagem. Tente outra foto.";
        }
        return message || fallback;
    }
    if (err instanceof Error && err.message.includes("prohibited content")) {
        return "Não foi possível gerar a partir desta imagem. Tente outra foto.";
    }
    return fallback;
};