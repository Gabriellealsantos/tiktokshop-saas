package com.venyx.tiktokshop.dtos;

import java.math.BigDecimal;

/**
 * Estado dos cards do topo de "Produtos Virais", derivado de dados reais do catálogo:
 * - newProductsCount: produtos criados desde o último boundary de refresh;
 * - detectedRevenue: SUM(estimatedRevenue) do catálogo (oportunidade de mercado, ≠ faturamento da plataforma);
 * - secondsUntilNextRefresh: countdown determinístico até o próximo tick de cadência fixa;
 * - online: badge "minerando".
 */
public record MiningStatusDTO(
    long newProductsCount,
    BigDecimal detectedRevenue,
    long secondsUntilNextRefresh,
    boolean online
) {
}
