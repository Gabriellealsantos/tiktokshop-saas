package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.VideoTemplateAdminDTO;
import com.venyx.tiktokshop.dtos.VideoTemplateFormDTO;
import com.venyx.tiktokshop.dtos.VideoTemplateSummaryDTO;
import com.venyx.tiktokshop.entities.VideoTemplate;
import com.venyx.tiktokshop.entities.enums.VideoAudioMode;
import com.venyx.tiktokshop.repositories.VideoTemplateRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Catálogo de templates de vídeo (fluxo de extração de movimento).
 *
 * <p>Leitura: o usuário vê os públicos (curados pelo admin) + os privados dele próprio.
 * CRUD administrativo opera apenas nos públicos (sem dono). O script de movimento é
 * cadastrado à mão pelo admin no {@code motionInstruction} do formulário — não há mais
 * análise automática de vídeo.
 */
@Service
public class VideoTemplateCatalogService {

    private final VideoTemplateRepository repository;
    private final AuthService authService;

    public VideoTemplateCatalogService(VideoTemplateRepository repository,
                                       AuthService authService) {
        this.repository = repository;
        this.authService = authService;
    }

    // ---------------------------------------------------------------- leitura

    /** Galeria do usuário logado: públicos + privados dele. Categoria opcional (null = todas). */
    @Transactional(readOnly = true)
    public List<VideoTemplateSummaryDTO> listGallery(String category) {
        UUID uuid = authService.authenticated().getUuid();
        String filter = (category == null || category.isBlank()) ? null : category;
        return repository.findGallery(uuid, filter).stream()
                .map(VideoTemplateSummaryDTO::new)
                .toList();
    }

    /** Versão paginada da galeria — usada pelo endpoint público com infinite scroll. */
    @Transactional(readOnly = true)
    public Page<VideoTemplateSummaryDTO> listGalleryPaged(String category, int page, int size) {
        UUID uuid = authService.authenticated().getUuid();
        String filter = (category == null || category.isBlank()) ? null : category;
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "sortOrder").and(Sort.by(Sort.Direction.ASC, "id")));
        return repository.findGalleryPaged(uuid, filter, pageable)
                .map(VideoTemplateSummaryDTO::new);
    }

    @Transactional(readOnly = true)
    public VideoTemplateSummaryDTO getSummary(String slug) {
        return new VideoTemplateSummaryDTO(requireVisible(slug));
    }

    // ----------------------------------------------------- loader (geração)

    /**
     * Carrega o template garantindo que o usuário logado pode usá-lo (público ou próprio).
     * Usado pelo motor de prompt (Workstream E).
     */
    @Transactional(readOnly = true)
    public VideoTemplate requireVisible(String slug) {
        UUID uuid = authService.authenticated().getUuid();
        VideoTemplate template = repository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Template de vídeo não encontrado: " + slug));
        boolean visible = template.isPublicTemplate()
                || (template.getOwner() != null && uuid.equals(template.getOwner().getUuid()));
        if (!visible) {
            throw new ResourceNotFoundException("Template de vídeo não encontrado: " + slug);
        }
        return template;
    }

    // -------------------------------------------------------- admin (públicos)

    @Transactional(readOnly = true)
    public List<VideoTemplateAdminDTO> listAdmin() {
        return repository.findAllByOwnerIsNullOrderBySortOrderAscIdAsc().stream()
                .map(VideoTemplateAdminDTO::new)
                .toList();
    }

    @Transactional
    public VideoTemplateAdminDTO create(VideoTemplateFormDTO form) {
        if (repository.existsBySlug(form.slug())) {
            throw new BusinessException("Já existe um template com o slug: " + form.slug());
        }
        VideoTemplate template = new VideoTemplate();
        applyForm(template, form);
        return new VideoTemplateAdminDTO(repository.save(template));
    }

    @Transactional
    public VideoTemplateAdminDTO update(Long id, VideoTemplateFormDTO form) {
        VideoTemplate template = loadPublicOrThrow(id);
        repository.findBySlugAndActiveTrue(form.slug())
                .filter(other -> !other.getId().equals(id))
                .ifPresent(other -> { throw new BusinessException("Slug já usado por outro template: " + form.slug()); });
        applyForm(template, form);
        return new VideoTemplateAdminDTO(repository.save(template));
    }

    @Transactional
    public void delete(Long id) {
        loadPublicOrThrow(id);
        repository.deleteById(id);
    }

    private VideoTemplate loadPublicOrThrow(Long id) {
        VideoTemplate template = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template de vídeo não encontrado: " + id));
        if (!template.isPublicTemplate()) {
            throw new BusinessException("Template privado não pode ser editado pelo admin.");
        }
        return template;
    }

    /** Aplica o form mantendo o template PÚBLICO (owner permanece nulo). */
    private void applyForm(VideoTemplate template, VideoTemplateFormDTO form) {
        template.setSlug(form.slug());
        template.setTitle(form.title());
        template.setCategory(form.category());
        template.setThumbnailUrl(form.thumbnailUrl());
        template.setVideoUrl(form.videoUrl());
        template.setVideoStyle(form.videoStyle());
        template.setObjective(form.objective());
        template.setTone(form.tone());
        template.setEnergy(form.energy());
        template.setDuration(form.duration());
        template.setMotionInstruction(form.motionInstruction());
        template.setImagePrompt(form.imagePrompt());
        template.setScenePrompt(form.scenePrompt());
        template.setAudioMode(VideoAudioMode.fromValue(form.audioMode()));
        template.setSortOrder(form.sortOrder() == null ? 0 : form.sortOrder());
        template.setActive(form.active() == null || form.active());
    }
}