import { z } from "zod";

export const avatarSchema = z.object({
    nome: z.string().min(1, "O nome do avatar é obrigatório."),
    genero: z.enum(["Feminino", "Masculino", "Andrógino", "Não-binário"], {
        required_error: "Selecione o gênero.",
    }),
    idade: z.number().min(18).max(65),
    etnia: z.enum(
        ["Latino/Latina", "Caucasiana", "Negra", "Asiática", "Árabe", "Indígena", "Mestiça"],
        { required_error: "Selecione a etnia." },
    ),
    tomPele: z.enum(
        ["Tom 01", "Tom 02", "Tom 03", "Tom 04", "Tom 05", "Tom 06", "Tom 07", "Tom 08", "Tom 09", "Tom 10"],
        { required_error: "Selecione o tom de pele." },
    ),
    tipoFisico: z.enum(["Magro(a)", "Atlético(a)", "Curvy", "Plus Size"], {
        required_error: "Selecione o tipo físico.",
    }),
    altura: z.number().min(150).max(200),
    formatoRosto: z.enum(["Oval", "Redondo", "Quadrado", "Coração", "Alongado"], {
        required_error: "Selecione o formato do rosto.",
    }),
    corOlhos: z.enum(["Castanho", "Preto", "Azul", "Verde", "Mel", "Cinza"], {
        required_error: "Selecione a cor dos olhos.",
    }),
    expressao: z.enum(["Neutra", "Sorrindo", "Séria", "Confiante", "Sensual"], {
        required_error: "Selecione a expressão.",
    }),
    pelosFaciais: z.enum(
        ["Nenhum", "Barba curta", "Barba cheia", "Bigode", "Cavanhaque"],
        { required_error: "Selecione a opção de pelos." },
    ),
    boca: z.enum(
        ["Lábios finos", "Lábios médios", "Lábios carnudos", "Arco do cupido", "Boca larga", "Boca pequena"],
        { required_error: "Selecione a boca." },
    ),
    sobrancelha: z.enum(
        ["Reta", "Arqueada", "Angulosa", "Grossa / cheia", "Fina", "Curvada suave"],
        { required_error: "Selecione a sobrancelha." },
    ),
    nariz: z.enum(
        ["Reto", "Aquilino", "Arrebitado", "Largo", "Afilado", "Botão"],
        { required_error: "Selecione o nariz." },
    ),
    estiloCabelo: z.enum(
        ["Careca", "Militar", "Curto", "Pixie", "Undercut", "Topete", "Médio", "Longo", "Franja", "Cacheado", "Afro", "Dreads", "Tranças", "Rabo de cavalo", "Coque", "Man bun"],
        { required_error: "Selecione o estilo de cabelo." },
    ),
    corCabelo: z.enum(
        ["Preto", "Castanho", "Castanho claro", "Mel", "Loiro claro", "Ruivo", "Prateado", "Amarelo", "Azul"],
        { required_error: "Selecione a cor de cabelo." },
    ),
    roupa: z.enum(
        ["Casual", "Luxo", "Streetwear", "Fitness", "Corporativo", "Geração Automática", "Enviar Imagem"],
        { required_error: "Selecione a roupa." },
    ),
    detalhesRoupa: z.string().max(120, "Máximo 120 caracteres.").optional(),
    detalhesExtras: z.string().max(150, "Máximo 150 caracteres.").optional(),
    clothingImageUrl: z.string().optional(),
    clothingPart: z
        .enum(["Look completo", "Parte de cima", "Parte de baixo"])
        .optional(),
});

export type AvatarFormValues = z.infer<typeof avatarSchema>;