import * as z from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "O nome deve ter no mínimo 2 caracteres")
    .max(80, "O nome deve ter no máximo 80 caracteres"),
});
export type ProfileForm = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Mínimo de 6 caracteres"),
    // Alinhado ao backend (@Password): mínimo de 8 caracteres e sem espaços.
    newPassword: z
      .string()
      .min(8, "Mínimo de 8 caracteres")
      .regex(/^\S+$/, "A senha não pode conter espaços"),
    confirmPassword: z.string().min(8, "Mínimo de 8 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });
export type PasswordForm = z.infer<typeof passwordSchema>;
