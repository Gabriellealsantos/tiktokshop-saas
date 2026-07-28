export type StudioImageRequest = {
    productId?: number;
    customProductName?: string;
    customProductImageUrl?: string;
    avatarId?: number;
    galleryAvatarId?: number;
    format: "UGC" | "POV" | "CINEMATIC";
    location: string;
    timeOfDay: string;
    lighting: string;
    atmosphere: string;
    pointOfView: string;
    pose: string;
};

export type StudioVideoRequest = {
    sessionId: number;
    script: string;
    voice: string;
};

export type CreationSessionDTO = {
    id: number;
    productId: number | null;
    format: string;
    status: "DRAFT" | "GENERATING" | "COMPLETED" | "FAILED";
    config: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
};

export const SCENE_LOCATION: Record<string, string> = {
    "quarto": "BEDROOM",
    "sala-loft": "LIVING_LOFT",
    "cozinha": "KITCHEN",
    "closet": "CLOSET",
    "home-office": "HOME_OFFICE",
    "rua-urbana": "URBAN_STREET",
    "cafe": "CAFE",
    "restaurante": "RESTAURANT",
    "estudio": "NEUTRAL_STUDIO",
    "praia": "BEACH",
    "parque": "PARK",
    "academia": "GYM",
};

export const TIME_OF_DAY: Record<string, string> = {
    "manha": "MORNING",
    "meio-dia": "MIDDAY",
    "fim-de-tarde": "LATE_AFTERNOON",
    "noite": "NIGHT",
    "madrugada": "DAWN",
};

export const SCENE_LIGHTING: Record<string, string> = {
    "natural": "NATURAL_SOFT",
    "dourada": "GOLDEN_STRONG",
    "neon": "NEON_COLORFUL",
    "cinematografica": "CINEMATIC",
    "ring-light": "RING_LIGHT",
};

export const SCENE_ATMOSPHERE: Record<string, string> = {
    "aconchegante": "COZY",
    "moderada": "MODERATE",
    "vibrante": "VIBRANT",
    "luxuosa": "LUXURIOUS",
};

export const NARRATOR_VOICE: Record<string, string> = {
    "voice-1": "MALE_SALES",
    "voice-2": "FEMALE_YOUNG",
    "voice-3": "MALE_DEEP",
    "voice-4": "FEMALE_ENERGETIC",
};


export const LOCATION_LABEL: Record<string, string> = {
    BEDROOM: "Quarto",
    LIVING_LOFT: "Sala/Loft",
    KITCHEN: "Cozinha",
    CLOSET: "Closet",
    HOME_OFFICE: "Home office",
    URBAN_STREET: "Rua urbana",
    CAFE: "Café",
    RESTAURANT: "Restaurante",
    NEUTRAL_STUDIO: "Estúdio neutro",
    BEACH: "Praia",
    PARK: "Parque",
    GYM: "Academia",
};

export const TIME_LABEL: Record<string, string> = {
    MORNING: "Manhã",
    MIDDAY: "Meio-dia",
    LATE_AFTERNOON: "Fim de tarde",
    NIGHT: "Noite",
    DAWN: "Madrugada",
};

export const LIGHTING_LABEL: Record<string, string> = {
    NATURAL_SOFT: "Natural suave",
    GOLDEN_STRONG: "Dourada forte",
    NEON_COLORFUL: "Neon/colorida",
    CINEMATIC: "Cinematográfica",
    RING_LIGHT: "Ring light",
};

export const ATMOSPHERE_LABEL: Record<string, string> = {
    COZY: "Aconchegante",
    MODERATE: "Moderada",
    VIBRANT: "Vibrante",
    LUXURIOUS: "Luxuosa",
};

export const POINT_OF_VIEW_LABEL: Record<string, string> = {
    SELFIE: "Selfie (POV)",
    FRONTAL: "Frontal",
    CLOSE_UP: "Close-up",
    WIDE: "Plano aberto",
};