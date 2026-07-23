package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.VideoTemplateAdminDTO;
import com.venyx.tiktokshop.dtos.VideoTemplateFormDTO;
import com.venyx.tiktokshop.dtos.VideoTemplateSummaryDTO;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.VideoTemplate;
import com.venyx.tiktokshop.repositories.VideoTemplateRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * Catálogo de templates de vídeo (fluxo de extração de movimento).
 *
 * <p>Leitura: o usuário vê os públicos (curados pelo admin) + os privados dele próprio
 * (upload manual). CRUD administrativo opera apenas nos públicos (sem dono).
 */
@Service
public class VideoTemplateCatalogService {

    private static final String MANUAL_UPLOAD_FOLDER = "video-templates";

    private final VideoTemplateRepository repository;
    private final StorageService storageService;
    private final AuthService authService;

    public VideoTemplateCatalogService(VideoTemplateRepository repository,
                                       StorageService storageService,
                                       AuthService authService) {
        this.repository = repository;
        this.storageService = storageService;
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

    // -------------------------------------------------- upload manual (privado)

    /** Upload manual do usuário: sobe o vídeo e persiste um template PRIVADO (dono = usuário). */
    @Transactional
    public VideoTemplateSummaryDTO uploadManual(MultipartFile file) {
        User user = authService.authenticated();
        String url = storageService.uploadVideo(file, MANUAL_UPLOAD_FOLDER + "/" + user.getUuid());

        VideoTemplate template = new VideoTemplate();
        template.setOwner(user);
        template.setSlug("u-" + UUID.randomUUID().toString().substring(0, 8));
        template.setTitle(resolveTitle(file));
        template.setVideoUrl(url);
        template.setActive(true);
        return new VideoTemplateSummaryDTO(repository.save(template));
    }

    private String resolveTitle(MultipartFile file) {
        String name = file.getOriginalFilename();
        if (name == null || name.isBlank()) {
            return "Meu vídeo";
        }
        int dot = name.lastIndexOf('.');
        String base = (dot > 0 ? name.substring(0, dot) : name).trim();
        return base.isBlank() ? "Meu vídeo" : base;
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
        template.setSortOrder(form.sortOrder() == null ? 0 : form.sortOrder());
        template.setActive(form.active() == null || form.active());
    }
}