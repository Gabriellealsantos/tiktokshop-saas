package com.venyx.tiktokshop.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record DashboardMetricResetRequest(
    @NotEmpty(message = "Selecione ao menos um período para resetar")
    List<@NotBlank String> periodRefs,
    boolean clearLiveSales
) {}
