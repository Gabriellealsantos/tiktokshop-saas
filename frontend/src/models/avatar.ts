import type { AvatarFormValues } from "@/routes/create-avatar/components/full-customization-mode/avatar-schema";


export type AvatarConfigDTO = {
    gender: string;
    age: number;
    ethnicity: string;
    skinTone: string;
    bodyType: string;
    height: number;
    faceShape: string;
    eyeColor: string;
    expression: string;
    facialHair: string;
    mouthShape: string;
    eyebrow: string;
    noseShape: string;
    hairStyle: string;
    hairColor: string;
    outfit: string;
    outfitDetails?: string;
    extraDetails?: string;
};

export type ImageGenerationDTO = {
    id: number;
    parentId: number | null;
    flowType: string;
    status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
    prompt: string;
    imageUrl: string | null;
    error: string | null;
    createdAt: string;
};

export type AvatarDTO = {
    id: number;
    name: string;
    imageUrl: string;
    generationId: number | null;
    createdAt: string;
    customPrompt?: string;
};

export const GENDER: Record<string, string> = {
    "Feminino": "FEMALE",
    "Masculino": "MALE",
    "Andrógino": "ANDROGYNOUS",
    "Não-binário": "NON_BINARY",
};

export const ETHNICITY: Record<string, string> = {
    "Latino/Latina": "LATINO",
    "Caucasiana": "CAUCASIAN",
    "Negra": "BLACK",
    "Asiática": "ASIAN",
    "Árabe": "ARAB",
    "Indígena": "INDIGENOUS",
    "Mestiça": "MIXED",
};

export const SKIN_TONE: Record<string, string> = {
    "Tom 01": "TONE_01", "Tom 02": "TONE_02", "Tom 03": "TONE_03",
    "Tom 04": "TONE_04", "Tom 05": "TONE_05", "Tom 06": "TONE_06",
    "Tom 07": "TONE_07", "Tom 08": "TONE_08", "Tom 09": "TONE_09",
    "Tom 10": "TONE_10",
};

export const BODY_TYPE: Record<string, string> = {
    "Magro(a)": "SLIM",
    "Atlético(a)": "ATHLETIC",
    "Curvy": "CURVY",
    "Plus Size": "PLUS_SIZE",
};

export const FACE_SHAPE: Record<string, string> = {
    "Oval": "OVAL",
    "Redondo": "ROUND",
    "Quadrado": "SQUARE",
    "Coração": "HEART",
    "Alongado": "OBLONG",
};

export const EYE_COLOR: Record<string, string> = {
    "Castanho": "BROWN",
    "Preto": "DARK_BROWN",
    "Azul": "BLUE",
    "Verde": "GREEN",
    "Mel": "HONEY",
    "Cinza": "GRAY",
};

export const EXPRESSION: Record<string, string> = {
    "Neutra": "NEUTRAL",
    "Sorrindo": "SMILING",
    "Séria": "SERIOUS",
    "Confiante": "CONFIDENT",
    "Sensual": "SENSUAL",
};

export const FACIAL_HAIR: Record<string, string> = {
    "Nenhum": "NONE",
    "Barba curta": "SHORT_BEARD",
    "Barba cheia": "FULL_BEARD",
    "Bigode": "MUSTACHE",
    "Cavanhaque": "GOATEE",
};

export const MOUTH_SHAPE: Record<string, string> = {
    "Lábios finos": "THIN_LIPS",
    "Lábios médios": "MEDIUM_LIPS",
    "Lábios carnudos": "FULL_LIPS",
    "Arco do cupido": "DEFINED_CUPID",
    "Boca larga": "WIDE_MOUTH",
    "Boca pequena": "SMALL_MOUTH",
};

export const EYEBROW: Record<string, string> = {
    "Reta": "STRAIGHT",
    "Arqueada": "ARCHED",
    "Angulosa": "ANGULAR",
    "Grossa / cheia": "THICK",
    "Fina": "THIN",
    "Curvada suave": "SOFT_CURVED",
};

export const NOSE_SHAPE: Record<string, string> = {
    "Reto": "STRAIGHT",
    "Aquilino": "AQUILINE",
    "Arrebitado": "UPTURNED",
    "Largo": "WIDE",
    "Afilado": "REFINED",
    "Botão": "BUTTON",
};

export const HAIR_STYLE: Record<string, string> = {
    "Careca": "BALD", "Militar": "BUZZ_CUT", "Curto": "SHORT",
    "Pixie": "PIXIE", "Undercut": "UNDERCUT", "Topete": "QUIFF",
    "Médio": "MEDIUM", "Longo": "LONG", "Franja": "BANGS",
    "Cacheado": "CURLY", "Afro": "AFRO", "Dreads": "DREADS",
    "Tranças": "BRAIDS", "Rabo de cavalo": "PONYTAIL",
    "Coque": "BUN", "Man bun": "MAN_BUN",
};

export const HAIR_COLOR: Record<string, string> = {
    "Preto": "BLACK",
    "Castanho": "BROWN",
    "Castanho claro": "LIGHT_BROWN",
    "Mel": "HONEY",
    "Loiro claro": "LIGHT_BLONDE",
    "Ruivo": "RED",
    "Prateado": "SILVER",
    "Amarelo": "YELLOW",
    "Azul": "BLUE",
};

export const OUTFIT: Record<string, string> = {
    "Casual": "CASUAL",
    "Luxo": "LUXURY",
    "Streetwear": "STREETWEAR",
    "Fitness": "FITNESS",
    "Corporativo": "CORPORATE",
    "Geração Automática": "AUTO",
};

export const buildAvatarConfig = (form: AvatarFormValues): AvatarConfigDTO => ({
    gender: GENDER[form.genero],
    age: form.idade,
    ethnicity: ETHNICITY[form.etnia],
    skinTone: SKIN_TONE[form.tomPele],
    bodyType: BODY_TYPE[form.tipoFisico],
    height: form.altura,
    faceShape: FACE_SHAPE[form.formatoRosto],
    eyeColor: EYE_COLOR[form.corOlhos],
    expression: EXPRESSION[form.expressao],
    facialHair: FACIAL_HAIR[form.pelosFaciais],
    mouthShape: MOUTH_SHAPE[form.boca],
    eyebrow: EYEBROW[form.sobrancelha],
    noseShape: NOSE_SHAPE[form.nariz],
    hairStyle: HAIR_STYLE[form.estiloCabelo],
    hairColor: HAIR_COLOR[form.corCabelo],
    outfit: OUTFIT[form.roupa] ?? "CASUAL",
    outfitDetails: form.detalhesRoupa?.trim() || undefined,
    extraDetails: form.detalhesExtras?.trim() || undefined,
});


export type AvatarFromPhotoRequest = {
    photoUrl: string;
    clothingMode: "AUTO" | "UPLOAD";
    clothingImageUrl?: string;
    clothingPart?: "FULL_LOOK" | "TOP" | "BOTTOM";
    clothingInstructions?: string;
    extraOptions?: string;
};

export const CLOTHING_MODE: Record<string, "AUTO" | "UPLOAD"> = {
    "Automática": "AUTO",
    "Upload de imagem": "UPLOAD",
};

export const CLOTHING_PART: Record<string, "FULL_LOOK" | "TOP" | "BOTTOM"> = {
    "Look completo": "FULL_LOOK",
    "Parte de cima": "TOP",
    "Parte de baixo": "BOTTOM",
};

export const CLOTHING_PART_AVATAR: Record<string, "FULL_LOOK" | "TOP" | "BOTTOM"> = {
    "Look completo": "FULL_LOOK",
    "Parte de cima": "TOP",
    "Parte de baixo": "BOTTOM",
};