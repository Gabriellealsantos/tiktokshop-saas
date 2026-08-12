package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.VideoPromptRequestDTO;
import com.venyx.tiktokshop.dtos.VideoPromptResponseDTO;
import com.venyx.tiktokshop.entities.Product;
import com.venyx.tiktokshop.entities.VideoTemplate;
import com.venyx.tiktokshop.repositories.ProductRepository;
import com.venyx.tiktokshop.services.VideoTemplateCatalogService;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Fase 5: gera o prompt Veo3 (texto) a partir do template de vídeo + produto, via prompt-engine.
 *
 * <p>Não consome cota (o recurso caro — imagens — é gasto nos swaps do
 * {@link VideoTemplateImageService}). O script de movimento (coluna {@code motion_instruction})
 * é curadoria manual do admin: o time escreve/cadastra o script timestamped por template. Se o
 * template não tiver script, o {@link VideoPromptComposer#resolveMotion} cai no motion default
 * genérico. Não há mais análise automática de vídeo — o texto vem 100% do que o admin cadastrou.
 */
@Service
public class VideoTemplatePromptService {

    private final VideoTemplateCatalogService catalog;
    private final ProductRepository productRepository;
    private final VideoPromptComposer composer;
    private final TextProvider textProvider;

    public VideoTemplatePromptService(VideoTemplateCatalogService catalog,
                                      ProductRepository productRepository,
                                      VideoPromptComposer composer,
                                      TextProvider textProvider) {
        this.catalog = catalog;
        this.productRepository = productRepository;
        this.composer = composer;
        this.textProvider = textProvider;
    }

    public VideoPromptResponseDTO generate(VideoPromptRequestDTO req) {
        VideoTemplate template = catalog.requireVisible(req.templateSlug());
        Product product = productRepository.findByIdWithCategory(req.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + req.productId()));

        String instruction = composer.compose(template, product);
        TextProviderResult result = textProvider.generate(new TextProviderRequest(instruction, false));

        String prompt = appendMotionScript(result.text().trim(), composer.resolveMotion(template));
        return new VideoPromptResponseDTO(withFaceLock(prompt));
    }

    /**
     * Anexa o SCRIPT DE MOVIMENTO exato (timestamped) direto na saída, SEM passar pelo LLM.
     * O LLM foi instruído a não descrever movimento justamente porque, ao receber o script, ele
     * resume e parafraseia — perdendo os timestamps (visto na prática). Determinístico como o
     * {@link #withFaceLock}: garante que o prompt final carregue a coreografia beat-by-beat
     * verbatim, exatamente como o analyzer extraiu do vídeo com o MD de análise.
     */
    private String appendMotionScript(String prompt, String motion) {
        return prompt
                + "\n\n## MOTION SCRIPT — the avatar performs EXACTLY this movement, beat by beat, "
                + "with these exact timings; do not deviate from, add to, or skip any beat:\n"
                + motion;
    }

    /**
     * Garantia determinística de preservação de rosto no PROMPT FINAL (o texto que o usuário
     * cola no Veo). O composer já INSTRUI o LLM a incluir isso, mas a instrução depende do
     * modelo obedecer — se ele resumir e cortar a linha, o prompt sairia sem a trava. Como
     * preservar o rosto da avatar é requisito crítico, anexamos aqui a trava SEMPRE, direto na
     * saída, para que nunca falte no prompt entregue. Redundância barata por uma restrição forte.
     */
    private String withFaceLock(String prompt) {
        return prompt + "\n\nFace lock: the avatar's face and identity come strictly from the "
                + "avatar reference image and must stay identical and unchanged for the entire "
                + "video — never alter, morph, beautify or swap the face.";
    }
}
