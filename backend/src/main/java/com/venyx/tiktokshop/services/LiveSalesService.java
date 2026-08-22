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
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Motor de "Vendas ao Vivo" (Multi-tenant): estoura eventos a partir de produtos realmente
 * cadastrados para um usuário específico (manual via {@link #fireSale} ou automático via {@link LiveSalesScheduler}),
 * loga em {@link LiveSaleEvent} vinculado ao usuário e publica na queue STOMP individual.
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

    @Transactional
    public LiveSalesConfigDTO getConfig(User user) {
        return new LiveSalesConfigDTO(currentConfig(user));
    }

    @Transactional
    public LiveSalesConfigDTO updateConfig(User user, LiveSalesConfigDTO dto) {
        LiveSalesConfig config = currentConfig(user);
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
    public LiveSalesFeedDTO getFeed(User user) {
        Instant now = Instant.now();
        Instant startOfDay = now.truncatedTo(ChronoUnit.DAYS);
        BigDecimal totalToday = eventRepository.sumAmountBetween(user.getUuid(), startOfDay, now);
        long countToday = eventRepository.countBetween(user.getUuid(), startOfDay, now);
        List<LiveSaleEventDTO> recent = eventRepository.findTop10ByUserIdOrderByCreatedAtDesc(user.getUuid()).stream()
                .map(LiveSaleEventDTO::new)
                .toList();
        return new LiveSalesFeedDTO(totalToday, countToday, recent);
    }

    @Transactional
    public LiveSaleEventDTO fireSale(User user, Long productId) {
        if (productId != null) {
            // Disparo manual forçado de um produto específico
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + productId));
            return createEventAndBroadcast(user, product, true);
        } else {
            // Disparo manual sem produto - escolhe um aleatório
            return generateSaleForUser(user);
        }
    }

    public void fireSaleForUser(UUID userId, Long productId) {
        messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/live-sales", Map.of("action", "PING"));
    }

    @Transactional
    public LiveSaleEventDTO generateSaleForUser(User user) {
        LiveSalesConfig config = currentConfig(user);
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
        } else if (config.getSourceType() == LiveSalesSource.CATEGORY && config.getCategoryId() != null) {
            product = productRepository.pickRandomByCategory(config.getCategoryId()).orElse(null);
        }

        if (product == null) {
            product = productService.pickRandom()
                    .orElseThrow(() -> new BusinessException("Nenhum produto cadastrado para disparar uma venda."));
        }

        return createEventAndBroadcast(user, product, true); // true para broadcasting para ele mesmo
    }

    private LiveSaleEventDTO createEventAndBroadcast(User user, Product product, boolean broadcastGlobal) {
        BigDecimal amount = product.getPrice() != null ? product.getPrice() : BigDecimal.ZERO;
        BigDecimal commissionPct = product.getCommissionPct() != null ? product.getCommissionPct() : BigDecimal.ZERO;
        BigDecimal commission = amount.multiply(commissionPct)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        LiveSaleEvent event = new LiveSaleEvent(product, product.getName(), product.getImageUrl(), amount, commission);
        event.setUser(user);
        event = eventRepository.save(event);

        liveMetricsCounter.bumpOnSale(user.getUuid());

        LiveSaleEventDTO dto = new LiveSaleEventDTO(event);
        if (broadcastGlobal) {
            messagingTemplate.convertAndSendToUser(user.getUuid().toString(), "/queue/live-sales", dto);
            // Optional: se NotificationService precisar de mudança (toast de venda ao vivo)
            // notificationService.broadcastSaleToastToUser(user, dto); // Depende da implementação atual de toast
        }
        return dto;
    }

    private LiveSalesConfig currentConfig(User user) {
        return configRepository.findTopByUserIdOrderByIdAsc(user.getUuid())
                .orElseGet(() -> {
                    LiveSalesConfig config = new LiveSalesConfig();
                    config.setUser(user);
                    return configRepository.save(config);
                });
    }
}
