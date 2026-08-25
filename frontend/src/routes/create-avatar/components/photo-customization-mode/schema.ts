import { z } from "zod";

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const photoFile = z
  .instanceof(File, { message: "Envie sua foto de rosto." })
  .refine((file) => ACCEPTED_TYPES.includes(file.type), "Formato inválido. Envie JPG, PNG ou WEBP.")
  .refine((file) => file.size <= MAX_FILE_BYTES, "A foto deve ter no máximo 15 MB.");

export const avatarPhotoSchema = z.object({
  nome: z.string().min(1, "O nome do influencer é obrigatório."),
  fotoPrincipal: photoFile,
  modoRoupa: z.enum(["Automática", "Upload de imagem"]),
  tipoPeca: z.enum(["Look completo", "Parte de cima", "Parte de baixo"]).optional(),
  fotoRoupa: photoFile.optional(),
  instrucoesRoupa: z.string().optional(),
  opcoesAdicionais: z.string().optional(),
  customPrompt: z.string().max(5000, "Máximo 5000 caracteres.").optional(),
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