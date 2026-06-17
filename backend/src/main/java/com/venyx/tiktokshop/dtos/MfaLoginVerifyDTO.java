package com.venyx.tiktokshop.dtos;

import jakarta.validation.constraints.NotBlank;

public record MfaLoginVerifyDTO(
        @NotBlank String preAuthToken,
        @NotBlank String code
) {}
