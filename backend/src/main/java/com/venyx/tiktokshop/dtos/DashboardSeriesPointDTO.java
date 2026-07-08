package com.venyx.tiktokshop.dtos;

import java.math.BigDecimal;

public record DashboardSeriesPointDTO(
    String label,
    BigDecimal revenue,
    Integer orders
) {
}
