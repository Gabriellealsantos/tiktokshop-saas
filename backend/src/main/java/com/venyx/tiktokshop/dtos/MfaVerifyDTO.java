package com.venyx.tiktokshop.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record MfaVerifyDTO(
    @NotBlank(message = "O código é obrigatório.")
    @Size(min = 6, max = 6, message = "O código deve ter exatamente 6 dígitos.")
    @Pattern(regexp = "\\d{6}", message = "O código deve conter apenas números.")
    String code
) {}