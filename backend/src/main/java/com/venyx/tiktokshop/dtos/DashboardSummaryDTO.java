package com.venyx.tiktokshop.dtos;

import java.math.BigDecimal;
import java.util.List;

public record DashboardSummaryDTO(
    BigDecimal revenue,
    Integer orders,
    BigDecimal commission,
    BigDecimal avgTicket,
    List<DashboardSeriesPointDTO> series
) {
}
