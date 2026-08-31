package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.DashboardMetricDTO;
import com.venyx.tiktokshop.dtos.DashboardResetResultDTO;
import com.venyx.tiktokshop.dtos.DashboardSeriesPointDTO;
import com.venyx.tiktokshop.dtos.DashboardSummaryDTO;
import com.venyx.tiktokshop.entities.DashboardMetric;
import com.venyx.tiktokshop.entities.enums.DashboardPeriodType;
import com.venyx.tiktokshop.entities.enums.LiveSalesMode;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.repositories.DashboardMetricRepository;
import com.venyx.tiktokshop.repositories.LiveSaleEventRepository;
import com.venyx.tiktokshop.repositories.LiveSalesConfigRepository;
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

    /** Rotulo do modo horario. UTC como todo o resto do dashboard — ver resolveWindow. */
    private static final DateTimeFormatter HOUR_LABEL = DateTimeFormatter.ofPattern("HH'h'").withZone(ZoneOffset.UTC);

    private final DashboardMetricRepository metricRepository;
    private final LiveSaleEventRepository liveSaleEventRepository;
    private final LiveMetricsCounter liveMetricsCounter;
    // Repositorio, e nao LiveSalesService: o reset so precisa desligar o modo automatico,
    // e injetar o servico acoplaria os dois lados sem necessidade.
    private final LiveSalesConfigRepository liveSalesConfigRepository;

    public DashboardService(DashboardMetricRepository metricRepository,
                            LiveSaleEventRepository liveSaleEventRepository,
                            LiveMetricsCounter liveMetricsCounter,
                            LiveSalesConfigRepository liveSalesConfigRepository) {
        this.metricRepository = metricRepository;
        this.liveSaleEventRepository = liveSaleEventRepository;
        this.liveMetricsCounter = liveMetricsCounter;
        this.liveSalesConfigRepository = liveSalesConfigRepository;
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
        // O avgTicket cadastrado e um PISO, nao um valor fixo: max() em vez de substituicao.
        // Sem isso o ticket comeca em zero enquanto nao ha pedidos e, pior, despenca para o
        // valor de uma unica venda barata assim que a primeira venda ao vivo entra.
        BigDecimal seedTicket = base != null && base.getAvgTicket() != null ? base.getAvgTicket() : BigDecimal.ZERO;
        BigDecimal computedTicket = orders > 0
                ? revenue.divide(BigDecimal.valueOf(orders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal avgTicket = computedTicket.max(seedTicket);

        // KPIs extras: itens/base de comissão crescem com as vendas; views/cliques
        // via contador em tempo real (LiveMetricsCounter, movido a cada venda ao vivo).
        int itemsSold = baseItemsSold + (int) liveOrders;
        BigDecimal commissionBase = baseCommissionBase.add(liveRevenue);
        long productViews = baseViews + liveMetricsCounter.getViews(user.getUuid());
        long productClicks = baseClicks + liveMetricsCounter.getClicks(user.getUuid());

        return new DashboardSummaryDTO(
                revenue, orders, commission, avgTicket,
                itemsSold, commissionBase, productViews, productClicks,
                buildSeries(user.getUuid(), window, baseRevenue, baseOrders));
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

    /**
     * Serie do grafico. Uma janela de 1 dia ("Hoje", e "Esta semana" quando hoje e segunda)
     * renderiza por HORA: com um ponto so a area nao desenha linha nenhuma e o grafico parece
     * vazio. Acima disso o ponto continua sendo o dia, como antes.
     */
    private List<DashboardSeriesPointDTO> buildSeries(UUID userId, ResolvedWindow window,
                                                      BigDecimal baseRevenue, int baseOrders) {
        boolean hourly = window.seriesDays() <= 1;
        ChronoUnit unit = hourly ? ChronoUnit.HOURS : ChronoUnit.DAYS;
        long bucketSeconds = hourly ? 3600L : 86400L;
        DateTimeFormatter label = hourly ? HOUR_LABEL : DAY_LABEL;

        // No modo horario so plotamos ate a hora corrente — projetar o resto do dia como
        // zero faria a curva despencar para o rodape do grafico.
        int buckets = hourly
                ? (int) Math.max(1, ChronoUnit.HOURS.between(window.start(), window.end()) + 1)
                : window.seriesDays();

        BigDecimal perBucketBaseRevenue = buckets > 0
                ? baseRevenue.divide(BigDecimal.valueOf(buckets), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        int perBucketBaseOrders = buckets > 0 ? baseOrders / buckets : 0;

        Instant seriesEnd = window.start().plus(buckets, unit);
        Map<Integer, LiveSaleEventRepository.DailyBucket> porBucket = liveSaleEventRepository
                .sumBuckets(userId, window.start(), seriesEnd, bucketSeconds).stream()
                .collect(toMap(LiveSaleEventRepository.DailyBucket::getBucket, identity()));

        List<DashboardSeriesPointDTO> points = new ArrayList<>();
        for (int i = 0; i < buckets; i++) {
            LiveSaleEventRepository.DailyBucket bucket = porBucket.get(i);
            BigDecimal bucketRevenue = perBucketBaseRevenue.add(bucket != null ? bucket.getReceita() : BigDecimal.ZERO);
            long bucketOrders = perBucketBaseOrders + (bucket != null ? bucket.getPedidos() : 0L);
            points.add(new DashboardSeriesPointDTO(
                    label.format(window.start().plus(i, unit)), bucketRevenue, (int) bucketOrders));
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

    /**
     * Zera de verdade o painel dos periodos escolhidos. Apagar so a base nao muda nada nas
     * janelas longas (15d/mes/30d), porque o getSummary soma base + vendas ao vivo: os eventos
     * antigos continuam dentro da janela. Por isso apagamos tambem os LiveSaleEvent do recorte,
     * e pausamos a geracao automatica — senao o scheduler repoe os numeros em segundos.
     */
    @Transactional
    public DashboardResetResultDTO resetMetrics(User user, List<String> periodRefs, boolean clearLiveSales) {
        int deleted = metricRepository.deleteByUserIdAndPeriodRefIn(user.getUuid(), periodRefs);

        int liveSalesDeleted;
        if (clearLiveSales) {
            liveSalesDeleted = liveSaleEventRepository.deleteByUserId(user.getUuid());
        } else {
            // Todas as janelas terminam em "agora", entao a uniao dos periodos marcados
            // e simplesmente [menor inicio, agora].
            Instant now = Instant.now();
            Instant earliestStart = null;
            for (String ref : periodRefs) {
                Instant start = windowStartOrNull(ref);
                if (start != null && (earliestStart == null || start.isBefore(earliestStart))) {
                    earliestStart = start;
                }
            }
            liveSalesDeleted = earliestStart == null
                    ? 0
                    : liveSaleEventRepository.deleteByUserIdAndCreatedAtBetween(user.getUuid(), earliestStart, now);
        }

        // Views/cliques sao contadores volateis em memoria, sem recorte por periodo:
        // preserva-los num reset so deixaria o painel "sujo" sem jeito de limpar.
        liveMetricsCounter.reset(user.getUuid());

        boolean liveSalesPaused = pauseAutomaticLiveSales(user);

        return new DashboardResetResultDTO(deleted, liveSalesDeleted, liveSalesPaused);
    }

    /** Inicio da janela do periodo, ou null se o ref nao for um dos slots conhecidos. */
    private Instant windowStartOrNull(String ref) {
        try {
            return resolveWindow(ref, null, null).start();
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    /** @return true se havia geracao automatica ligada e ela foi desligada. */
    private boolean pauseAutomaticLiveSales(User user) {
        return liveSalesConfigRepository.findTopByUserIdOrderByIdAsc(user.getUuid())
                .filter(config -> config.getMode() == LiveSalesMode.AUTOMATIC)
                .map(config -> {
                    config.setMode(LiveSalesMode.DISABLED);
                    liveSalesConfigRepository.save(config);
                    return true;
                })
                .orElse(false);
    }
}
