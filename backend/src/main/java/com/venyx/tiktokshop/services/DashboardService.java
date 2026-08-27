package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.DashboardMetricDTO;
import com.venyx.tiktokshop.dtos.DashboardSeriesPointDTO;
import com.venyx.tiktokshop.dtos.DashboardSummaryDTO;
import com.venyx.tiktokshop.entities.DashboardMetric;
import com.venyx.tiktokshop.entities.enums.DashboardPeriodType;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.repositories.DashboardMetricRepository;
import com.venyx.tiktokshop.repositories.LiveSaleEventRepository;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static java.util.function.Function.identity;
import static java.util.stream.Collectors.toMap;

/**
 * Métrica base é cadastrada manualmente pelo usuário por período (DashboardMetric);
 * na leitura, somamos as vendas ao vivo (LiveSaleEvent) do usuário da janela correspondente,
 * assim os totais sobem em tempo real sem nunca sobrescrever o valor manual.
 */
@Service
public class DashboardService {

    /**
     * Teto do intervalo personalizado. Sem ele, um range de anos vira uma query por dia
     * dentro da mesma transacao — e o pool de conexoes fica preso por minutos.
     */
    private static final int MAX_CUSTOM_DAYS = 90;

    private static final DateTimeFormatter DAY_LABEL = DateTimeFormatter.ofPattern("dd/MM").withZone(ZoneOffset.UTC);

    private final DashboardMetricRepository metricRepository;
    private final LiveSaleEventRepository liveSaleEventRepository;
    private final LiveMetricsCounter liveMetricsCounter;

    public DashboardService(DashboardMetricRepository metricRepository,
                            LiveSaleEventRepository liveSaleEventRepository,
                            LiveMetricsCounter liveMetricsCounter) {
        this.metricRepository = metricRepository;
        this.liveSaleEventRepository = liveSaleEventRepository;
        this.liveMetricsCounter = liveMetricsCounter;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDTO getSummary(User user, String period, String from, String to) {
        ResolvedWindow window = resolveWindow(period, from, to);

        DashboardMetric base = metricRepository.findByUserIdAndPeriodTypeAndPeriodRef(user.getUuid(), window.type(), window.ref()).orElse(null);
        BigDecimal baseRevenue = base != null && base.getRevenue() != null ? base.getRevenue() : BigDecimal.ZERO;
        int baseOrders = base != null && base.getOrders() != null ? base.getOrders() : 0;
        BigDecimal baseCommission = base != null && base.getCommission() != null ? base.getCommission() : BigDecimal.ZERO;
        int baseItemsSold = base != null && base.getItemsSold() != null ? base.getItemsSold() : 0;
        BigDecimal baseCommissionBase = base != null && base.getCommissionBase() != null ? base.getCommissionBase() : BigDecimal.ZERO;
        long baseViews = base != null && base.getProductViews() != null ? base.getProductViews() : 0L;
        long baseClicks = base != null && base.getProductClicks() != null ? base.getProductClicks() : 0L;

        BigDecimal liveRevenue = liveSaleEventRepository.sumAmountBetween(user.getUuid(), window.start(), window.end());
        BigDecimal liveCommission = liveSaleEventRepository.sumCommissionBetween(user.getUuid(), window.start(), window.end());
        long liveOrders = liveSaleEventRepository.countBetween(user.getUuid(), window.start(), window.end());

        BigDecimal revenue = baseRevenue.add(liveRevenue);
        int orders = baseOrders + (int) liveOrders;
        BigDecimal commission = baseCommission.add(liveCommission);
        BigDecimal avgTicket = orders > 0
                ? revenue.divide(BigDecimal.valueOf(orders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // KPIs extras: itens/base de comissão crescem com as vendas; views/cliques
        // via contador em tempo real (LiveMetricsCounter, movido a cada venda ao vivo).
        int itemsSold = baseItemsSold + (int) liveOrders;
        BigDecimal commissionBase = baseCommissionBase.add(liveRevenue);
        long productViews = baseViews + liveMetricsCounter.getViews(user.getUuid());
        long productClicks = baseClicks + liveMetricsCounter.getClicks(user.getUuid());

        return new DashboardSummaryDTO(
                revenue, orders, commission, avgTicket,
                itemsSold, commissionBase, productViews, productClicks,
                buildSeries(user.getUuid(), window.start(), window.seriesDays(), baseRevenue, baseOrders));
    }

    private record ResolvedWindow(Instant start, Instant end, int seriesDays, DashboardPeriodType type, String ref) {}

    private ResolvedWindow resolveWindow(String period, String from, String to) {
        String p = (period == null || period.isBlank()) ? "7d" : period.trim();
        Instant now = Instant.now();
        LocalDate today = now.atZone(ZoneOffset.UTC).toLocalDate();

        return switch (p) {
            case "today" -> new ResolvedWindow(
                    today.atStartOfDay(ZoneOffset.UTC).toInstant(), now, 1, DashboardPeriodType.DAY, p);
            case "7d" -> rolling(now, 7, p);
            case "15d" -> rolling(now, 15, p);
            case "30d" -> rolling(now, 30, p);
            case "week" -> {
                LocalDate monday = today.with(DayOfWeek.MONDAY);
                int days = (int) (ChronoUnit.DAYS.between(monday, today) + 1);
                yield new ResolvedWindow(
                        monday.atStartOfDay(ZoneOffset.UTC).toInstant(), now, days, DashboardPeriodType.RANGE, p);
            }
            case "month" -> {
                LocalDate first = today.withDayOfMonth(1);
                yield new ResolvedWindow(
                        first.atStartOfDay(ZoneOffset.UTC).toInstant(), now, today.getDayOfMonth(), DashboardPeriodType.RANGE, p);
            }
            case "custom" -> resolveCustom(from, to);
            default -> throw new IllegalArgumentException("Período inválido: " + period);
        };
    }

    private ResolvedWindow rolling(Instant now, int days, String ref) {
        return new ResolvedWindow(now.minus(days, ChronoUnit.DAYS), now, days, DashboardPeriodType.RANGE, ref);
    }

    private ResolvedWindow resolveCustom(String from, String to) {
        if (from == null || from.isBlank() || to == null || to.isBlank()) {
            throw new IllegalArgumentException("Período 'custom' exige os parâmetros 'from' e 'to' (formato ISO yyyy-MM-dd)");
        }
        LocalDate fromDate;
        LocalDate toDate;
        try {
            fromDate = LocalDate.parse(from.trim());
            toDate = LocalDate.parse(to.trim());
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Datas inválidas em 'from'/'to' (use o formato ISO yyyy-MM-dd)");
        }
        if (toDate.isBefore(fromDate)) {
            throw new IllegalArgumentException("'from' não pode ser posterior a 'to'");
        }
        Instant start = fromDate.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant end = toDate.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        int days = (int) (ChronoUnit.DAYS.between(fromDate, toDate) + 1);

        if (days > MAX_CUSTOM_DAYS) {
            throw new IllegalArgumentException(
                    "O período personalizado é de no máximo %d dias.".formatted(MAX_CUSTOM_DAYS));
        }
        return new ResolvedWindow(start, end, days, DashboardPeriodType.RANGE, "custom:" + fromDate + ":" + toDate);
    }

    private List<DashboardSeriesPointDTO> buildSeries(UUID userId, Instant windowStart, int days,
                                                      BigDecimal baseRevenue, int baseOrders) {
        BigDecimal perDayBaseRevenue = days > 0
                ? baseRevenue.divide(BigDecimal.valueOf(days), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        int perDayBaseOrders = days > 0 ? baseOrders / days : 0;

        Instant windowEnd = windowStart.plus(days, ChronoUnit.DAYS);
        Map<Integer, LiveSaleEventRepository.DailyBucket> porDia = liveSaleEventRepository
                .sumDailyBuckets(userId, windowStart, windowEnd).stream()
                .collect(toMap(LiveSaleEventRepository.DailyBucket::getBucket, identity()));

        List<DashboardSeriesPointDTO> points = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            LiveSaleEventRepository.DailyBucket dia = porDia.get(i);
            BigDecimal dayRevenue = perDayBaseRevenue.add(dia != null ? dia.getReceita() : BigDecimal.ZERO);
            long dayOrders = perDayBaseOrders + (dia != null ? dia.getPedidos() : 0L);
            points.add(new DashboardSeriesPointDTO(
                    DAY_LABEL.format(windowStart.plus(i, ChronoUnit.DAYS)), dayRevenue, (int) dayOrders));
        }
        return points;
    }

    @Transactional(readOnly = true)
    public List<DashboardMetricDTO> listMetrics(User user, String periodType) {
        List<DashboardMetric> metrics = (periodType == null || periodType.isBlank())
                ? metricRepository.findByUserId(user.getUuid())
                : metricRepository.findByUserIdAndPeriodTypeOrderByPeriodRefAsc(user.getUuid(), DashboardPeriodType.valueOf(periodType.toUpperCase()));
        return metrics.stream().map(DashboardMetricDTO::new).toList();
    }

    @Transactional
    public DashboardMetricDTO upsertMetric(User user, DashboardMetricDTO dto) {
        DashboardMetric entity = metricRepository.findByUserIdAndPeriodTypeAndPeriodRef(user.getUuid(), dto.periodType(), dto.periodRef())
                .orElseGet(() -> {
                    DashboardMetric m = new DashboardMetric();
                    m.setUser(user);
                    return m;
                });
        entity.setPeriodType(dto.periodType());
        entity.setPeriodRef(dto.periodRef());
        entity.setRevenue(dto.revenue());
        entity.setOrders(dto.orders());
        entity.setCommission(dto.commission());
        entity.setAvgTicket(dto.avgTicket());
        entity.setItemsSold(dto.itemsSold());
        entity.setCommissionBase(dto.commissionBase());
        entity.setProductViews(dto.productViews());
        entity.setProductClicks(dto.productClicks());
        entity = metricRepository.save(entity);
        return new DashboardMetricDTO(entity);
    }

    @Transactional
    public void deleteMetric(User user, Long id) {
        DashboardMetric entity = metricRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Métrica não encontrada: " + id));
        if (!entity.getUser().getUuid().equals(user.getUuid())) {
            throw new ResourceNotFoundException("Métrica não encontrada: " + id);
        }
        metricRepository.deleteById(id);
    }

    @Transactional
    public int resetMetrics(User user, List<String> periodRefs, boolean clearLiveSales) {
        int deleted = metricRepository.deleteByUserIdAndPeriodRefIn(user.getUuid(), periodRefs);
        if (clearLiveSales) {
            liveSaleEventRepository.deleteByUserId(user.getUuid());
            liveMetricsCounter.reset(user.getUuid());
        }
        return deleted;
    }
}
