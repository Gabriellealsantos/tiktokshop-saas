import * as z from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
});
export type ProfileForm = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Mínimo de 6 caracteres"),
    newPassword: z.string().min(6, "Mínimo de 6 caracteres"),
    confirmPassword: z.string().min(6, "Mínimo de 6 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });
export type PasswordForm = z.infer<typeof passwordSchema>;
