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
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

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

    public LiveSalesService(LiveSalesConfigRepository configRepository,
                             LiveSaleEventRepository eventRepository,
                             ProductRepository productRepository,
                             ProductService productService,
                             SimpMessagingTemplate messagingTemplate,
                             NotificationService notificationService) {
        this.configRepository = configRepository;
        this.eventRepository = eventRepository;
        this.productRepository = productRepository;
        this.productService = productService;
        this.messagingTemplate = messagingTemplate;
        this.notificationService = notificationService;
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
        Product product = (productId != null)
                ? productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + productId))
                : productService.pickRandom()
                    .orElseThrow(() -> new BusinessException("Nenhum produto cadastrado para disparar uma venda."));

        BigDecimal amount = product.getPrice() != null ? product.getPrice() : BigDecimal.ZERO;
        BigDecimal commissionPct = product.getCommissionPct() != null ? product.getCommissionPct() : BigDecimal.ZERO;
        BigDecimal commission = amount.multiply(commissionPct)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        LiveSaleEvent event = new LiveSaleEvent(product, product.getName(), product.getImageUrl(), amount, commission);
        event = eventRepository.save(event);

        LiveSaleEventDTO dto = new LiveSaleEventDTO(event);
        messagingTemplate.convertAndSend("/topic/live-sales", dto);
        // Prova social: espelha a venda como toast efêmero no sino (STOMP, não persiste).
        notificationService.broadcastSaleToast(dto);
        return dto;
    }

    private LiveSalesConfig currentConfig() {
        return configRepository.findTopByOrderByIdAsc()
                .orElseGet(() -> configRepository.save(new LiveSalesConfig()));
    }
}
