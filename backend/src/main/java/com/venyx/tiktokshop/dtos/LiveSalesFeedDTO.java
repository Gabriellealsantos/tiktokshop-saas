package com.venyx.tiktokshop.dtos;

import java.math.BigDecimal;
import java.util.List;

public record LiveSalesFeedDTO(
    BigDecimal totalToday,
    long countToday,
    List<LiveSaleEventDTO> recent
) {
}
