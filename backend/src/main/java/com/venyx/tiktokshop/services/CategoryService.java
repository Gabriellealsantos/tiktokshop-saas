package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.CategoryDTO;
import com.venyx.tiktokshop.entities.Category;
import com.venyx.tiktokshop.repositories.CategoryRepository;
import com.venyx.tiktokshop.repositories.ProductRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Service
public class CategoryService {

    private final CategoryRepository repository;
    private final ProductRepository productRepository;

    public CategoryService(CategoryRepository repository, ProductRepository productRepository) {
        this.repository = repository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryDTO> findAll() {
        return repository.findAllByOrderBySortOrderAscNameAsc()
                .stream().map(CategoryDTO::new).toList();
    }

    @Transactional
    public CategoryDTO insert(CategoryDTO dto) {
        Category entity = new Category();
        entity.setName(dto.name().trim());
        entity.setSlug(uniqueSlug(slugify(dto.name()), null));
        entity.setSortOrder(nextSortOrder());
        entity.setSystem(false);
        return new CategoryDTO(repository.save(entity));
    }

    @Transactional
    public CategoryDTO update(Long id, CategoryDTO dto) {
        Category entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada: " + id));
        entity.setName(dto.name().trim());
        entity.setSlug(uniqueSlug(slugify(dto.name()), id));
        if (dto.sortOrder() != null) {
            entity.setSortOrder(dto.sortOrder());
        }
        return new CategoryDTO(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        Category entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada: " + id));
        if (entity.isSystem()) {
            throw new BusinessException("Categorias padrão não podem ser excluídas.");
        }
        if (productRepository.existsByCategoryId(id)) {
            throw new BusinessException("Não é possível excluir: há produtos usando esta categoria.");
        }
        repository.deleteById(id);
    }

    private int nextSortOrder() {
        return repository.findAllByOrderBySortOrderAscNameAsc().stream()
                .mapToInt(c -> c.getSortOrder() == null ? 0 : c.getSortOrder())
                .max().orElse(0) + 1;
    }

    /** Gera slug a partir do nome: minúsculo, sem acentos, hifenizado. */
    private String slugify(String name) {
        String normalized = Normalizer.normalize(name.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        String slug = normalized.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return slug.isBlank() ? "categoria" : slug;
    }

    /** Garante slug único; se colidir, sufixa -2, -3... (ignora o próprio id no update). */
    private String uniqueSlug(String base, Long selfId) {
        String candidate = base;
        int suffix = 2;
        while (true) {
            var existing = repository.findBySlug(candidate);
            if (existing.isEmpty() || existing.get().getId().equals(selfId)) {
                return candidate;
            }
            candidate = base + "-" + suffix++;
        }
    }
}
