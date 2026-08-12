package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.ProductDTO;
import com.venyx.tiktokshop.entities.Favorite;
import com.venyx.tiktokshop.entities.Product;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.repositories.FavoriteRepository;
import com.venyx.tiktokshop.repositories.ProductRepository;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Favoritos da vitrine de produtos ("Favoritos" na aba de mineração).
 * Ownership resolvido via AuthService.authenticated(), mesmo padrão do
 * UserProductService.
 */
@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;

    public FavoriteService(FavoriteRepository favoriteRepository, ProductRepository productRepository) {
        this.favoriteRepository = favoriteRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public void add(User user, Long productId) {
        if (favoriteRepository.existsByUser_UuidAndProduct_Id(user.getUuid(), productId)) {
            return;
        }
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Produto não encontrado: " + productId);
        }
        Product product = productRepository.getReferenceById(productId);
        favoriteRepository.save(new Favorite(user, product));
    }

    @Transactional
    public void remove(User user, Long productId) {
        favoriteRepository.deleteByUser_UuidAndProduct_Id(user.getUuid(), productId);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> listMine(User user) {
        return favoriteRepository.findByUser_UuidAndProduct_ActiveTrueOrderByCreatedAtDesc(user.getUuid()).stream()
                .map(favorite -> new ProductDTO(favorite.getProduct()))
                .toList();
    }
}
