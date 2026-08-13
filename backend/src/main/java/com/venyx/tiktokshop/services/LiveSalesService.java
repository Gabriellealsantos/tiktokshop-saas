package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.LiveSaleEventDTO;
import com.venyx.tiktokshop.dtos.LiveSalesConfigDTO;
import com.venyx.tiktokshop.dtos.LiveSalesFeedDTO;
import com.venyx.tiktokshop.entities.LiveSaleEvent;
import com.venyx.tiktokshop.entities.LiveSalesConfig;
import com.venyx.tiktokshop.entities.Product;
import com.venyx.tiktokshop.repositories.LiveSaleEventRepository;
import com.venyx.tiktokshop.repositories.LiveSalesConfigRepository;
import com.venyx.tiktokshop.repositories.ProductRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import com.venyx.tiktokshop.entities.enums.LiveSalesSource;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.Favorite;
import com.venyx.tiktokshop.repositories.FavoriteRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Motor de "Vendas ao Vivo": estoura eventos a partir de produtos realmente
 * cadastrados (manual via {@link #fireSale} ou automático via {@link LiveSalesScheduler}),
 * loga em {@link LiveSaleEvent} e publica no tópico STOMP para o feed em tempo real.
 */
@Service
public class LiveSalesService {

    private final LiveSalesConfigRepository configRepository;
    private final LiveSaleEventRepository eventRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;
    private final LiveMetricsCounter liveMetricsCounter;
    private final FavoriteRepository favoriteRepository;

    public LiveSalesService(LiveSalesConfigRepository configRepository,
                             LiveSaleEventRepository eventRepository,
                             ProductRepository productRepository,
                             ProductService productService,
                             SimpMessagingTemplate messagingTemplate,
                             NotificationService notificationService,
                             LiveMetricsCounter liveMetricsCounter,
                             FavoriteRepository favoriteRepository) {
        this.configRepository = configRepository;
        this.eventRepository = eventRepository;
        this.productRepository = productRepository;
        this.productService = productService;
        this.messagingTemplate = messagingTemplate;
        this.notificationService = notificationService;
        this.liveMetricsCounter = liveMetricsCounter;
        this.favoriteRepository = favoriteRepository;
    }

    @Transactional(readOnly = true)
    public LiveSalesConfigDTO getConfig() {
        return new LiveSalesConfigDTO(currentConfig());
    }

    @Transactional
    public LiveSalesConfigDTO updateConfig(LiveSalesConfigDTO dto) {
        LiveSalesConfig config = currentConfig();
        if (dto.mode() != null) {
            config.setMode(dto.mode());
        }
        if (dto.intervalSeconds() != null) {
            config.setIntervalSeconds(dto.intervalSeconds());
        }
        if (dto.randomInterval() != null) {
            config.setRandomInterval(dto.randomInterval());
        }
        if (dto.intervalMinSeconds() != null) {
            config.setIntervalMinSeconds(dto.intervalMinSeconds());
        }
        if (dto.intervalMaxSeconds() != null) {
            config.setIntervalMaxSeconds(dto.intervalMaxSeconds());
        }
        if (dto.sourceType() != null) {
            config.setSourceType(dto.sourceType());
        }
        config.setCategoryId(dto.categoryId());
        if (dto.adminProductIds() != null) {
            List<Product> products = productRepository.findAllById(dto.adminProductIds());
            config.setAdminProducts(products);
        }
        config = configRepository.save(config);
        return new LiveSalesConfigDTO(config);
    }

    @Transactional(readOnly = true)
    public LiveSalesFeedDTO getFeed() {
        Instant now = Instant.now();
        Instant startOfDay = now.truncatedTo(ChronoUnit.DAYS);
        BigDecimal totalToday = eventRepository.sumAmountBetween(startOfDay, now);
        long countToday = eventRepository.countBetween(startOfDay, now);
        List<LiveSaleEventDTO> recent = eventRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(LiveSaleEventDTO::new)
                .toList();
        return new LiveSalesFeedDTO(totalToday, countToday, recent);
    }

    @Transactional
    public LiveSaleEventDTO fireSale(Long productId) {
        if (productId != null) {
            // Disparo manual forçado de um produto específico, emite o evento global
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + productId));
            return createEventAndBroadcast(product, true);
        } else {
            // Tick automático: emite PING para os clientes buscarem individualmente
            messagingTemplate.convertAndSend("/topic/live-sales", (Object) Map.of("action", "PING"));
            return null; // O job ignora o retorno
        }
    }

    @Transactional
    public LiveSaleEventDTO generateSaleForUser(User user) {
        LiveSalesConfig config = currentConfig();
        Product product = null;

        if (config.getSourceType() == LiveSalesSource.USER_FAVORITES) {
            List<Favorite> favorites = favoriteRepository.findByUser_UuidAndProduct_ActiveTrueOrderByCreatedAtDesc(user.getUuid());
            if (!favorites.isEmpty()) {
                product = favorites.get(ThreadLocalRandom.current().nextInt(favorites.size())).getProduct();
            }
        } else if (config.getSourceType() == LiveSalesSource.ADMIN_LIST) {
            List<Product> list = config.getAdminProducts();
            if (list != null && !list.isEmpty()) {
                product = list.get(ThreadLocalRandom.current().nextInt(list.size()));
            }
        } else if (config.getSourceType() == LiveSalesSource.CATEGORY) {
            // Simplificado para usar a lista geral se a query customizada falhar, ideal seria usar ProductRepository
            List<Product> all = productRepository.findAll();
            List<Product> filtered = all.stream().filter(p -> p.isActive() && p.getCategory() != null && p.getCategory().getId().equals(config.getCategoryId())).toList();
            if (!filtered.isEmpty()) {
                product = filtered.get(ThreadLocalRandom.current().nextInt(filtered.size()));
            }
        }

        if (product == null) {
            product = productService.pickRandom()
                    .orElseThrow(() -> new BusinessException("Nenhum produto cadastrado para disparar uma venda."));
        }

        return createEventAndBroadcast(product, false);
    }

    private LiveSaleEventDTO createEventAndBroadcast(Product product, boolean broadcastGlobal) {
        BigDecimal amount = product.getPrice() != null ? product.getPrice() : BigDecimal.ZERO;
        BigDecimal commissionPct = product.getCommissionPct() != null ? product.getCommissionPct() : BigDecimal.ZERO;
        BigDecimal commission = amount.multiply(commissionPct)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        LiveSaleEvent event = new LiveSaleEvent(product, product.getName(), product.getImageUrl(), amount, commission);
        event = eventRepository.save(event);

        liveMetricsCounter.bumpOnSale();

        LiveSaleEventDTO dto = new LiveSaleEventDTO(event);
        if (broadcastGlobal) {
            messagingTemplate.convertAndSend("/topic/live-sales", dto);
            notificationService.broadcastSaleToast(dto);
        }
        return dto;
    }

    private LiveSalesConfig currentConfig() {
        return configRepository.findTopByOrderByIdAsc()
                .orElseGet(() -> configRepository.save(new LiveSalesConfig()));
    }
}
