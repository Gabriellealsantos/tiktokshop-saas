import { z } from "zod";

export const avatarPhotoSchema = z.object({
  nome: z.string().min(1, "O nome do influencer é obrigatório."),
  fotoPrincipal: z.any().refine((file) => file !== null && file !== undefined, "Envie sua foto de rosto."),
  modoRoupa: z.enum(["Automática", "Upload de imagem"]),
  tipoPeca: z.enum(["Look completo", "Parte de cima", "Parte de baixo"]).optional(),
  fotoRoupa: z.any().optional(),
  instrucoesRoupa: z.string().optional(),
  opcoesAdicionais: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.modoRoupa === "Upload de imagem" && !data.fotoRoupa) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Envie a imagem da roupa ou selecione a roupa automática.",
      path: ["fotoRoupa"]
    });
  }
});

export type AvatarPhotoFormValues = z.infer<typeof avatarPhotoSchema>;
