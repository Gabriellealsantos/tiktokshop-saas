package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.entities.Product;
import com.venyx.tiktokshop.entities.UserProduct;

/**
 * Visão mínima do produto que o prompt-engine consome (nome, categoria, descrição).
 * <p>
 * Existe porque duas entidades diferentes alimentam o mesmo prompt: o produto da vitrine
 * ({@link Product}, com categoria e métricas) e o produto próprio do usuário
 * ({@link UserProduct}, só nome/imagem/descrição). O composer não precisa saber de qual
 * delas veio. {@link #EMPTY} cobre o caso "manter look atual", em que o vídeo é gerado
 * sem nenhum produto.
 */
public record ProductBrief(String name, String category, String description) {

    /** Sem produto — fluxo "manter look atual". */
    public static final ProductBrief EMPTY = new ProductBrief(null, null, null);

    public static ProductBrief of(Product product) {
        return new ProductBrief(
                product.getName(),
                product.getCategory() != null ? product.getCategory().getName() : null,
                product.getDescription());
    }

    /** UserProduct não tem categoria — o master-prompt tolera o placeholder vazio. */
    public static ProductBrief of(UserProduct product) {
        return new ProductBrief(product.getName(), null, product.getDescription());
    }

    public boolean isEmpty() {
        return name == null || name.isBlank();
    }
}
