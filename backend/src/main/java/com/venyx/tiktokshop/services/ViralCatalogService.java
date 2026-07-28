package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.*;
import com.venyx.tiktokshop.entities.ViralCharacter;
import com.venyx.tiktokshop.entities.ViralFlowTemplate;
import com.venyx.tiktokshop.entities.ViralTone;
import com.venyx.tiktokshop.repositories.ViralCharacterRepository;
import com.venyx.tiktokshop.repositories.ViralFlowTemplateRepository;
import com.venyx.tiktokshop.repositories.ViralToneRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Catálogo do fluxo viral: leitura (templates/personagens/tons) para o usuário
 * final e CRUD administrativo para cadastro dinâmico (sem redeploy).
 */
@Service
public class ViralCatalogService {

    private final ViralFlowTemplateRepository templateRepository;
    private final ViralCharacterRepository characterRepository;
    private final ViralToneRepository toneRepository;

    public ViralCatalogService(ViralFlowTemplateRepository templateRepository,
                               ViralCharacterRepository characterRepository,
                               ViralToneRepository toneRepository) {
        this.templateRepository = templateRepository;
        this.characterRepository = characterRepository;
        this.toneRepository = toneRepository;
    }

    // ---------------------------------------------------------------- leitura

    @Transactional(readOnly = true)
    public List<ViralTemplateSummaryDTO> listTemplates() {
        return templateRepository.findAllByActiveTrueOrderByIdAsc().stream()
                .map(ViralTemplateSummaryDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public ViralTemplateDetailDTO getTemplateDetail(String slug) {
        ViralFlowTemplate template = requireTemplate(slug);

        List<ViralCharacterDTO> characters =
                characterRepository.findByTemplate_IdAndActiveTrueOrderBySortOrderAsc(template.getId()).stream()
                        .map(ViralCharacterDTO::new)
                        .toList();

        List<ViralToneDTO> tones = toneRepository.findAllByActiveTrueOrderBySortOrderAsc().stream()
                .map(ViralToneDTO::new)
                .toList();

        return new ViralTemplateDetailDTO(
                template.getSlug(), template.getTitle(), template.getSubtitle(),
                template.getDescription(), template.getThumbnailUrl(), template.getPreviewVideoUrl(),
                characters, tones);
    }

    // ----------------------------------------------------- loaders (geração)

    @Transactional(readOnly = true)
    public ViralFlowTemplate requireTemplate(String slug) {
        return templateRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Template viral não encontrado: " + slug));
    }

    @Transactional(readOnly = true)
    public ViralCharacter requireCharacter(Long templateId, String slug) {
        return characterRepository.findByTemplate_IdAndSlugAndActiveTrue(templateId, slug)
                .orElseThrow(() -> new ResourceNotFoundException("Personagem não encontrado: " + slug));
    }

    @Transactional(readOnly = true)
    public ViralTone requireTone(String slug) {
        return toneRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Tom não encontrado: " + slug));
    }

    // -------------------------------------------------------- admin: templates

    /** Admin: lista todos os templates (inclusive inativos), com id e instruções. */
    @Transactional(readOnly = true)
    public List<ViralTemplateAdminDTO> listTemplatesAdmin() {
        return templateRepository.findAllByOrderByIdAsc().stream()
                .map(ViralTemplateAdminDTO::new)
                .toList();
    }

    @Transactional
    public ViralTemplateAdminDTO createTemplate(ViralTemplateFormDTO form) {
        if (templateRepository.existsBySlug(form.slug())) {
            throw new BusinessException("Já existe um template com o slug: " + form.slug());
        }
        ViralFlowTemplate template = new ViralFlowTemplate();
        applyForm(template, form);
        return new ViralTemplateAdminDTO(templateRepository.save(template));
    }

    @Transactional
    public ViralTemplateAdminDTO updateTemplate(Long id, ViralTemplateFormDTO form) {
        ViralFlowTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template viral não encontrado: " + id));
        templateRepository.findBySlug(form.slug())
                .filter(other -> !other.getId().equals(id))
                .ifPresent(other -> { throw new BusinessException("Slug já usado por outro template: " + form.slug()); });
        applyForm(template, form);
        return new ViralTemplateAdminDTO(templateRepository.save(template));
    }

    @Transactional
    public void deleteTemplate(Long id) {
        if (!templateRepository.existsById(id)) {
            throw new ResourceNotFoundException("Template viral não encontrado: " + id);
        }
        templateRepository.deleteById(id);
    }

    private void applyForm(ViralFlowTemplate template, ViralTemplateFormDTO form) {
        template.setSlug(form.slug());
        template.setTitle(form.title());
        template.setSubtitle(form.subtitle());
        template.setDescription(form.description());
        template.setThumbnailUrl(form.thumbnailUrl());
        template.setPreviewVideoUrl(form.previewVideoUrl());
        template.setScriptInstruction(form.scriptInstruction());
        template.setPromptInstruction(form.promptInstruction());
        template.setCategory(form.category());
        template.setActive(form.active() == null || form.active());
    }

    // ------------------------------------------------------- admin: characters

    /** Admin: lista todos os personagens de um template (inclusive inativos), com id. */
    @Transactional(readOnly = true)
    public List<ViralCharacterAdminDTO> listCharactersAdmin(Long templateId) {
        if (!templateRepository.existsById(templateId)) {
            throw new ResourceNotFoundException("Template viral não encontrado: " + templateId);
        }
        return characterRepository.findByTemplate_IdOrderBySortOrderAsc(templateId).stream()
                .map(ViralCharacterAdminDTO::new)
                .toList();
    }

    @Transactional
    public ViralCharacterAdminDTO addCharacter(Long templateId, ViralCharacterFormDTO form) {
        ViralFlowTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Template viral não encontrado: " + templateId));
        ViralCharacter character = new ViralCharacter();
        character.setTemplate(template);
        applyForm(character, form);
        return new ViralCharacterAdminDTO(characterRepository.save(character));
    }

    @Transactional
    public ViralCharacterAdminDTO updateCharacter(Long id, ViralCharacterFormDTO form) {
        ViralCharacter character = characterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Personagem não encontrado: " + id));
        applyForm(character, form);
        return new ViralCharacterAdminDTO(characterRepository.save(character));
    }

    @Transactional
    public void deleteCharacter(Long id) {
        if (!characterRepository.existsById(id)) {
            throw new ResourceNotFoundException("Personagem não encontrado: " + id);
        }
        characterRepository.deleteById(id);
    }

    private void applyForm(ViralCharacter character, ViralCharacterFormDTO form) {
        character.setSlug(form.slug());
        character.setName(form.name());
        character.setDescription(form.description());
        character.setImageUrl(form.imageUrl());
        character.setSubcategory(form.subcategory());
        character.setSortOrder(form.sortOrder() == null ? 0 : form.sortOrder());
        character.setActive(form.active() == null || form.active());
    }

    // ------------------------------------------------------------ admin: tones

    /** Admin: lista todos os tons (inclusive inativos), com id. */
    @Transactional(readOnly = true)
    public List<ViralToneAdminDTO> listTonesAdmin() {
        return toneRepository.findAllByOrderBySortOrderAsc().stream()
                .map(ViralToneAdminDTO::new)
                .toList();
    }

    @Transactional
    public ViralToneAdminDTO createTone(ViralToneFormDTO form) {
        if (toneRepository.findBySlug(form.slug()).isPresent()) {
            throw new BusinessException("Já existe um tom com o slug: " + form.slug());
        }
        ViralTone tone = new ViralTone();
        applyForm(tone, form);
        return new ViralToneAdminDTO(toneRepository.save(tone));
    }

    @Transactional
    public ViralToneAdminDTO updateTone(Long id, ViralToneFormDTO form) {
        ViralTone tone = toneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tom não encontrado: " + id));
        applyForm(tone, form);
        return new ViralToneAdminDTO(toneRepository.save(tone));
    }

    private void applyForm(ViralTone tone, ViralToneFormDTO form) {
        tone.setSlug(form.slug());
        tone.setLabel(form.label());
        tone.setDescription(form.description());
        tone.setSortOrder(form.sortOrder() == null ? 0 : form.sortOrder());
        tone.setActive(form.active() == null || form.active());
    }
}
