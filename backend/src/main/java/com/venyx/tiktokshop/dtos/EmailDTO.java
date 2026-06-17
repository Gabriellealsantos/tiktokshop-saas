package com.venyx.tiktokshop.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EmailDTO(
    @NotBlank(message = "Campo requerido")
    @Email(message = "Email inválido")
    String email
) {}
