package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.StudioProductSource;
import com.venyx.tiktokshop.entities.Product;
import com.venyx.tiktokshop.entities.UserProduct;
import com.venyx.tiktokshop.repositories.ProductRepository;
import com.venyx.tiktokshop.repositories.UserProductRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Resolve o produto das requisições de texto do estúdio (sugestão de pose, roteiro).
 * Centraliza a precedência produto próprio → vitrine → nome livre para que as etapas
 * do fluxo "Criar do zero" nunca divirjam sobre qual produto está em uso.
 */
@Service
public class StudioProductResolver {

    private final ProductRepository productRepository;
    private final UserProductRepository userProductRepository;

    public StudioProductResolver(ProductRepository productRepository,
                                 UserProductRepository userProductRepository) {
        this.productRepository = productRepository;
        this.userProductRepository = userProductRepository;
    }

    @Transactional(readOnly = true)
    public StudioProduct resolve(StudioProductSource source, UUID ownerId) {
        if (source.userProductId() != null) {
            UserProduct owned = findOwned(source.userProductId(), ownerId);
            return new StudioProduct(owned.getName(), owned.getDescription());
        }
        if (source.productId() != null) {
            Product product = productRepository.findById(source.productId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Produto não encontrado: " + source.productId()));
            return new StudioProduct(product.getName(), product.getDescription());
        }
        if (hasText(source.customProductName())) {
            return new StudioProduct(source.customProductName().trim(), source.customProductDescription());
        }
        throw new BusinessException("Informe o produto do catálogo ou envie o seu próprio produto.");
    }

    /** Produto próprio é sempre buscado pelo dono (proteção contra IDOR). */
    @Transactional(readOnly = true)
    public UserProduct findOwned(Long userProductId, UUID ownerId) {
        return userProductRepository.findByIdAndUser_Uuid(userProductId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Produto não encontrado: " + userProductId));
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
