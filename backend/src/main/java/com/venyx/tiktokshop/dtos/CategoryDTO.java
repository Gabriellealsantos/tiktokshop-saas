package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.Category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Categoria da vitrine. `slug` e `system` são derivados/somente-leitura:
 * o slug é gerado a partir do nome no service, e `system` nunca vem do cliente.
 */
public record CategoryDTO(
    Long id,

    @NotBlank(message = "Nome da categoria é obrigatório")
    @Size(min = 2, max = 80, message = "Nome deve ter entre 2 e 80 caracteres")
    String name,

    String slug,
    Integer sortOrder,
    boolean system
) {
    public CategoryDTO(Category entity) {
        this(
            entity.getId(),
            entity.getName(),
            entity.getSlug(),
            entity.getSortOrder(),
            entity.isSystem()
        );
    }
}
