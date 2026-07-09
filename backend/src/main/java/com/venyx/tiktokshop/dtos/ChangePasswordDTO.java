package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.services.validation.Password;
import jakarta.validation.constraints.NotBlank;

/**
 * Troca de senha pelo próprio usuário autenticado ({@code PUT /users/me/password}).
 * Exige a senha atual (prova de posse) e aplica as regras de força de {@link Password}
 * na nova senha.
 */
public record ChangePasswordDTO(

        @NotBlank(message = "A senha atual é obrigatória")
        String currentPassword,

        @Password(message = "A senha deve ter no mínimo 8 caracteres e não pode conter espaços")
        String newPassword

) {}
