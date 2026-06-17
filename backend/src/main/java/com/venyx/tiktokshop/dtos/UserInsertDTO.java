package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.enums.UserStatus;
import com.venyx.tiktokshop.interfaces.UserData;
import com.venyx.tiktokshop.services.validation.Password;
import com.venyx.tiktokshop.services.validation.UserInsertValid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@UserInsertValid
public record UserInsertDTO(

        UUID id,

        @NotBlank(message = "Nome é obrigatório")
        @Size(min = 2, max = 120, message = "Nome deve ter entre 2 e 120 caracteres")
        @Pattern(
                regexp = "^[^<>\"\\p{Cntrl}]+$",
                message = "Nome contém caracteres inválidos"
        )
        String name,

        @Size(max = 20, message = "Telefone deve ter no máximo 20 caracteres")
        @Pattern(
                regexp = "^[\\d()\\s-]*$",
                message = "Telefone contém caracteres inválidos"
        )
        String phoneNumber,

        @Size(max = 14, message = "CPF deve ter no máximo 14 caracteres")
        String cpf,

        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "E-mail inválido")
        @Size(max = 150, message = "E-mail deve ter no máximo 150 caracteres")
        String email,

        Instant birthDate,

        UserStatus userStatus,

        Set<RoleDTO> roles,

        @NotBlank(message = "Senha é obrigatória")
        @Password(message = "A senha deve ter no mínimo 8 caracteres e não pode conter espaços")
        String password

) implements UserData {}