package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.DashboardMetricDTO;
import com.venyx.tiktokshop.dtos.DashboardSeriesPointDTO;
import com.venyx.tiktokshop.dtos.DashboardSummaryDTO;
import com.venyx.tiktokshop.entities.DashboardMetric;
import com.venyx.tiktokshop.entities.enums.DashboardPeriodType;
import com.venyx.tiktokshop.repositories.DashboardMetricRepository;
import com.venyx.tiktokshop.repositories.LiveSaleEventRepository;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * Métrica base é cadastrada manualmente pelo admin por período (DashboardMetric);
 * na leitura, somamos as vendas ao vivo (LiveSaleEvent) da janela correspondente,
 * assim os totais sobem em tempo real sem nunca sobrescrever o valor manual.
 */
@Service
public class DashboardService {

    private static final DateTimeFormatter DAY_LABEL = DateTimeFormatter.ofPattern("dd/MM").withZone(ZoneOffset.UTC);

    private final DashboardMetricRepository metricRepository;
    private final LiveSaleEventRepository liveSaleEventRepository;

    public DashboardService(DashboardMetricRepository metricRepository, LiveSaleEventRepository liveSaleEventRepository) {
        this.metricRepository = metricRepository;
        this.liveSaleEventRepository = liveSaleEventRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDTO getSummary(String period) {
        String normalizedPeriod = (period == null || period.isBlank()) ? "7d" : period;
        int days = switch (normalizedPeriod) {
            case "today" -> 1;
            case "30d" -> 30;
            default -> 7;
        };
        DashboardPeriodType periodType = "today".equals(normalizedPeriod) ? DashboardPeriodType.DAY : DashboardPeriodType.RANGE;

        Instant now = Instant.now();
        Instant windowStart = now.minus(days, ChronoUnit.DAYS);

        DashboardMetric base = metricRepository.findByPeriodTypeAndPeriodRef(periodType, normalizedPeriod).orElse(null);
        BigDecimal baseRevenue = base != null && base.getRevenue() != null ? base.getRevenue() : BigDecimal.ZERO;
        int baseOrders = base != null && base.getOrders() != null ? base.getOrders() : 0;
        BigDecimal baseCommission = base != null && base.getCommission() != null ? base.getCommission() : BigDecimal.ZERO;

        BigDecimal liveRevenue = liveSaleEventRepository.sumAmountBetween(windowStart, now);
        BigDecimal liveCommission = liveSaleEventRepository.sumCommissionBetween(windowStart, now);
        long liveOrders = liveSaleEventRepository.countBetween(windowStart, now);

        BigDecimal revenue = baseRevenue.add(liveRevenue);
        int orders = baseOrders + (int) liveOrders;
        BigDecimal commission = baseCommission.add(liveCommission);
        BigDecimal avgTicket = orders > 0
                ? revenue.divide(BigDecimal.valueOf(orders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new DashboardSummaryDTO(revenue, orders, commission, avgTicket, buildSeries(windowStart, days));
    }

    private List<DashboardSeriesPointDTO> buildSeries(Instant windowStart, int days) {
        List<DashboardSeriesPointDTO> points = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            Instant dayStart = windowStart.plus(i, ChronoUnit.DAYS);
            Instant dayEnd = dayStart.plus(1, ChronoUnit.DAYS);
            BigDecimal dayRevenue = liveSaleEventRepository.sumAmountBetween(dayStart, dayEnd);
            long dayOrders = liveSaleEventRepository.countBetween(dayStart, dayEnd);
            points.add(new DashboardSeriesPointDTO(DAY_LABEL.format(dayStart), dayRevenue, (int) dayOrders));
        }
        return points;
    }

    @Transactional(readOnly = true)
    public List<DashboardMetricDTO> listMetrics(String periodType) {
        List<DashboardMetric> metrics = (periodType == null || periodType.isBlank())
                ? metricRepository.findAll()
                : metricRepository.findByPeriodTypeOrderByPeriodRefAsc(DashboardPeriodType.valueOf(periodType.toUpperCase()));
        return metrics.stream().map(DashboardMetricDTO::new).toList();
    }

    @Transactional
    public DashboardMetricDTO upsertMetric(DashboardMetricDTO dto) {
        DashboardMetric entity = metricRepository.findByPeriodTypeAndPeriodRef(dto.periodType(), dto.periodRef())
                .orElseGet(DashboardMetric::new);
        entity.setPeriodType(dto.periodType());
        entity.setPeriodRef(dto.periodRef());
        entity.setRevenue(dto.revenue());
        entity.setOrders(dto.orders());
        entity.setCommission(dto.commission());
        entity.setAvgTicket(dto.avgTicket());
        entity = metricRepository.save(entity);
        return new DashboardMetricDTO(entity);
    }

    @Transactional
    public void deleteMetric(Long id) {
        if (!metricRepository.existsById(id)) {
            throw new ResourceNotFoundException("Métrica não encontrada: " + id);
        }
        metricRepository.deleteById(id);
    }
}
