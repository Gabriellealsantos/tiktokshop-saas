const BASE = import.meta.env.VITE_MEDIA_BASE_URL ?? "";

const toWebp = (path: string): string =>
    path.replace(/\.(png|jpe?g)$/i, ".webp");

export const withGenderVariant = (path: string, masculine: boolean): string =>
    masculine ? path.replace(/(\.[^./]+)$/, "-masc$1") : path;

export const asset = (path?: string): string => {
    if (!path) return "";
    if (/^https?:\/\//.test(path)) return path;
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${BASE}${toWebp(normalized)}`;
};