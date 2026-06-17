package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.services.validation.Password;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Dados de auto-cadastro público de um novo usuário.
 */
public record RegisterDTO(

        @NotBlank(message = "Nome é obrigatório")
        @Size(min = 2, max = 120, message = "Nome deve ter entre 2 e 120 caracteres")
        String name,

        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "E-mail inválido")
        @Size(max = 150, message = "E-mail deve ter no máximo 150 caracteres")
        String email,

        @Size(max = 20, message = "Telefone deve ter no máximo 20 caracteres")
        String phone,

        @Size(max = 14, message = "CPF deve ter no máximo 14 caracteres")
        String cpf,

        @NotBlank(message = "Senha é obrigatória")
        @Password(message = "A senha deve ter no mínimo 8 caracteres e não pode conter espaços")
        String password

) {}
