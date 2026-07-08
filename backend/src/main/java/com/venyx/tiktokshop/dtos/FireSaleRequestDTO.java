package com.venyx.tiktokshop.dtos;

/**
 * Corpo opcional do disparo manual de venda. Sem productId, um produto ativo
 * é sorteado aleatoriamente (mesmo comportamento do modo automático).
 */
public record FireSaleRequestDTO(Long productId) {
}
