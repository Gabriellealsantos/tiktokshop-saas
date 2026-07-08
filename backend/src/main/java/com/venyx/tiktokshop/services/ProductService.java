package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.MiningStatusDTO;
import com.venyx.tiktokshop.dtos.ProductDTO;
import com.venyx.tiktokshop.entities.Product;
import com.venyx.tiktokshop.entities.enums.ProductCategory;
import com.venyx.tiktokshop.repositories.ProductRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class ProductService {

    /**
     * Cadência fixa da mineração. Enquanto não existe mineração real do TikTok, o refresh é
     * simulado por boundaries determinísticos ancorados no epoch (a cada 6h). Quando a mineração
     * real existir, ela passa a alimentar newProductsCount/detectedRevenue e a definir o boundary.
     */
    private static final Duration MINING_REFRESH_INTERVAL = Duration.ofHours(6);

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public MiningStatusDTO miningStatus() {
        Instant now = Instant.now();
        long stepSec = MINING_REFRESH_INTERVAL.getSeconds();
        long nowEpoch = now.getEpochSecond();
        // Boundary anterior/próximo ancorados no epoch: independem de estado em memória, então o
        // countdown é idêntico em reloads e sobrevive a reinícios do servidor.
        long lastBoundary = nowEpoch - (nowEpoch % stepSec);
        long nextBoundary = lastBoundary + stepSec;

        long newCount = repository.countByCreatedAtAfter(Instant.ofEpochSecond(lastBoundary));
        BigDecimal detected = repository.sumEstimatedRevenue();
        return new MiningStatusDTO(newCount, detected, nextBoundary - nowEpoch, true);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> findAll(String category) {
        List<Product> products = (category == null || category.isBlank())
                ? repository.findAll()
                : repository.findByCategoryOrderByRankPositionAsc(ProductCategory.valueOf(category.toUpperCase()));
        return products.stream().map(ProductDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> search(String search, String category, String miningWindow, String sort, int page, int size) {
        ProductCategory categoryEnum = (category == null || category.isBlank())
                ? null
                : ProductCategory.valueOf(category.toUpperCase());
        Pageable pageable = PageRequest.of(page, size, resolveSort(sort));
        return repository.search(likePattern(search), categoryEnum, blankToNull(miningWindow), pageable)
                .map(ProductDTO::new);
    }

    private String likePattern(String search) {
        String value = blankToNull(search);
        return value == null ? null : "%" + value.toLowerCase() + "%";
    }

    private Sort resolveSort(String sort) {
        if (sort == null) {
            return Sort.by(Sort.Direction.ASC, "rankPosition");
        }
        return switch (sort.toLowerCase()) {
            case "top" -> Sort.by(Sort.Direction.DESC, "salesPerDay");
            case "recent" -> Sort.by(Sort.Direction.DESC, "createdAt");
            default -> Sort.by(Sort.Direction.ASC, "rankPosition");
        };
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }

    @Transactional(readOnly = true)
    public Optional<Product> pickRandom() {
        long count = repository.count();
        if (count == 0) {
            return Optional.empty();
        }
        int index = ThreadLocalRandom.current().nextInt((int) count);
        Page<Product> page = repository.findAll(PageRequest.of(index, 1));
        return page.hasContent() ? Optional.of(page.getContent().get(0)) : Optional.empty();
    }

    @Transactional(readOnly = true)
    public ProductDTO findById(Long id) {
        Product product = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + id));
        return new ProductDTO(product);
    }

    @Transactional
    public ProductDTO insert(ProductDTO dto) {
        Product entity = new Product();
        copyDtoToEntity(dto, entity);
        entity = repository.save(entity);
        return new ProductDTO(entity);
    }

    @Transactional
    public ProductDTO update(Long id, ProductDTO dto) {
        try {
            Product entity = repository.getReferenceById(id);
            copyDtoToEntity(dto, entity);
            entity = repository.save(entity);
            return new ProductDTO(entity);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Produto não encontrado: " + id);
        }
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Produto não encontrado: " + id);
        }
        repository.deleteById(id);
    }

    private void copyDtoToEntity(ProductDTO dto, Product entity) {
        if (dto.name() == null || dto.name().isBlank()) {
            throw new BusinessException("Nome do produto é obrigatório.");
        }
        if (dto.price() != null && dto.price().signum() < 0) {
            throw new BusinessException("Preço inválido.");
        }
        if (dto.commissionPct() != null && dto.commissionPct().signum() < 0) {
            throw new BusinessException("Percentual de comissão inválido.");
        }
        entity.setName(dto.name().trim());
        entity.setDescription(dto.description());
        entity.setImageUrl(dto.imageUrl());
        entity.setCategory(dto.category());
        entity.setSales(dto.sales() != null ? dto.sales() : 0);
        entity.setViews(dto.views() != null ? dto.views() : 0);
        entity.setAffiliateLink(dto.affiliateLink());
        entity.setPrice(dto.price());
        entity.setCommissionPct(dto.commissionPct());
        entity.setEstimatedRevenue(dto.estimatedRevenue());
        entity.setConversionRate(dto.conversionRate());
        entity.setSalesPerDay(dto.salesPerDay());
        entity.setDelta7d(dto.delta7d());
        entity.setHistory7d(dto.history7d());
        entity.setMiningWindow(dto.miningWindow());
        entity.setTrendLabel(dto.trendLabel());
        entity.setRankPosition(dto.rankPosition());
        entity.setImages(dto.images());
        entity.setCreatedByAdmin(dto.createdByAdmin());
    }
}
