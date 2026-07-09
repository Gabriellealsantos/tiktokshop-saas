package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.interfaces.UserData;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Dados que o próprio usuário autenticado pode editar no seu perfil.
 *
 * <p>Deliberadamente enxuto: NÃO expõe {@code userStatus}, {@code roles} nem {@code password}
 * (evita escalonamento de privilégio / mass-assignment na rota self {@code PUT /users/me}).
 * O e-mail também fica de fora — é o identificador de login e só o admin o altera.
 * O {@code email()} do contrato {@link UserData} retorna {@code null} de propósito, para que
 * {@code UserService.copyDtoToEntity} ignore o campo.
 */
public record ProfileUpdateDTO(

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
        String cpf

) implements UserData {

    /** Perfil self-service não altera e-mail; sempre {@code null} para o copiador ignorar. */
    @Override
    public String email() {
        return null;
    }
}
