export type GalleryAvatarAdmin = {
    id: number;
    name: string;
    gender: string | null;
    type: string | null;
    imageUrl: string;
    orderIndex: number | null;
    customPrompt?: string | null;
};

export type GalleryAvatarForm = {
    name: string;
    gender: string | null;
    type: string;
    imageUrl: string;
    orderIndex: number;
    customPrompt?: string | null;
};