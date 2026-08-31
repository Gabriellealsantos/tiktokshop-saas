package com.venyx.tiktokshop.dtos;

/**
 * Resultado do reset de métricas. As três contagens existem porque o reset mexe em três
 * lugares distintos — base cadastrada, eventos de venda ao vivo e o motor automático —
 * e o painel precisa dizer ao admin o que de fato aconteceu.
 *
 * @param deleted          linhas de dashboard_metrics removidas
 * @param liveSalesDeleted eventos de venda ao vivo removidos
 * @param liveSalesPaused  true se a geração automática estava ligada e foi desligada
 */
public record DashboardResetResultDTO(
        int deleted,
        int liveSalesDeleted,
        boolean liveSalesPaused
) {
}
