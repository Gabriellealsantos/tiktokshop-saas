package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.ProductDTO;
import com.venyx.tiktokshop.entities.Product;
import com.venyx.tiktokshop.entities.enums.ProductCategory;
import com.venyx.tiktokshop.repositories.ProductRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> findAll(String category) {
        List<Product> products = (category == null || category.isBlank())
                ? repository.findAll()
                : repository.findByCategoryOrderByRankPositionAsc(ProductCategory.valueOf(category.toUpperCase()));
        return products.stream().map(ProductDTO::new).toList();
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
