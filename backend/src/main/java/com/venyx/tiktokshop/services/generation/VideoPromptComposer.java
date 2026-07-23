package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.entities.Product;
import com.venyx.tiktokshop.entities.VideoTemplate;
import com.venyx.tiktokshop.entities.enums.VideoAudioMode;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Comparator;

/**
 * Compõe a instrução final do prompt Veo3 a partir do prompt-engine (resources/prompts/veo):
 * base de conhecimento (01..14) + master-prompt.md com placeholders preenchidos com os dados
 * do produto e do template de vídeo, mais a direção de movimento curada.
 *
 * <p>A base de conhecimento e o master são carregados uma vez (classpath) e cacheados.
 * Templates privados (upload manual) não têm {@code motionInstruction} → usa direção default.
 */
@Component
public class VideoPromptComposer {

    private static final String MASTER_PATH = "classpath:prompts/veo/master-prompt.md";
    private static final String KNOWLEDGE_GLOB = "classpath:prompts/veo/knowledge/*.md";

    private static final String DEFAULT_MOTION = """
            Natural, realistic human motion consistent with a short vertical social video:
            subtle body sway, hand gestures presenting the product, and smooth micro-movements.
            The camera follows the action with gentle, professional movement.
            """;

    private final PromptSanitizer sanitizer;

    // Carregados sob demanda e cacheados (imutáveis após init).
    private volatile String knowledgeBase;
    private volatile String masterTemplate;

    public VideoPromptComposer(PromptSanitizer sanitizer) {
        this.sanitizer = sanitizer;
    }

    /** Instrução completa enviada ao TextProvider para gerar UM prompt Veo3. */
    public String compose(VideoTemplate template, Product product) {
        String filledMaster = fillMaster(loadMaster(), template, product);

        return loadKnowledge()
                + "\n\n---\n\n" + filledMaster
                + MOTION_HANDOFF
                + IDENTITY_DIRECTIVE
                + resolveAudioDirective(template.getAudioMode());
    }

    /**
     * Diretriz de áudio dependente do modo curado pelo admin (fora do LLM, no fim do prompt,
     * alta saliência). NARRACAO mantém o comportamento comercial falado; MUSICA e SILENCIO
     * DESLIGAM a fala — precisam sobrepor explicitamente o default da base de conhecimento,
     * que sempre pede diálogo/voiceover/CTA falado. null → NARRACAO (retrocompatível).
     */
    private String resolveAudioDirective(VideoAudioMode mode) {
        VideoAudioMode resolved = mode == null ? VideoAudioMode.NARRACAO : mode;
        return switch (resolved) {
            case NARRACAO -> AUDIO_NARRACAO;
            case MUSICA -> AUDIO_MUSICA;
            case SILENCIO -> AUDIO_SILENCIO;
        };
    }

    /**
     * Script de movimento a anexar VERBATIM no prompt final (fora do LLM): o texto extraído do
     * vídeo pelo analyzer (timestamped), ou o {@link #DEFAULT_MOTION} para templates sem vídeo.
     */
    public String resolveMotion(VideoTemplate template) {
        return firstNonBlank(template.getMotionInstruction(), DEFAULT_MOTION).trim();
    }

    /**
     * Handoff de movimento: o LLM que escreve o prompt final NÃO pode descrever/parafrasear a
     * coreografia — na prática ele resume e perde os timestamps do script. O script exato é
     * anexado depois, direto na saída ({@code VideoTemplatePromptService.appendMotionScript}).
     * Aqui só instruímos o LLM a montar cena/roupa/identidade/luz/câmera/áudio/CTA e delegar
     * o movimento ao script anexado.
     */
    private static final String MOTION_HANDOFF =
            "\n---\n## BODY MOVEMENT (do NOT write it here)\n"
                    + "Do NOT describe, invent, summarize or paraphrase the subject's body movement, "
                    + "dance steps, gestures or choreography. A precise, timestamped MOTION SCRIPT is "
                    + "authoritative and will be appended verbatim AFTER your output. Your prompt must set "
                    + "up scene, wardrobe, product, avatar identity, lighting, camera framing, spoken audio "
                    + "and CTA, and simply state that the avatar performs the movement exactly as written in "
                    + "the MOTION SCRIPT that follows. Leave all choreography to that appended script.\n";

    /**
     * Preservação de identidade (crítico): a avatar é a imagem de referência e o rosto/identidade
     * dela NÃO pode mudar. O MOTION SCRIPT descreve só o MOVIMENTO do vídeo de referência —
     * nunca a aparência da pessoa desse vídeo — então o modelo aplica o movimento mantendo o rosto
     * da avatar. Anexado no fim (alta saliência) para o LLM não deixar isso implícito no prompt final.
     */
    private static final String IDENTITY_DIRECTIVE =
            "\n---\n## AVATAR IDENTITY (must be preserved)\n"
                    + "The avatar's face, facial features, skin tone, hair and overall identity come "
                    + "ONLY from the avatar reference image and MUST be preserved exactly and consistently "
                    + "across the whole video. Do NOT alter, morph, beautify, age, or swap the face, and do "
                    + "NOT copy the face or appearance of any person from the reference/performance video — "
                    + "that reference contributes ONLY action and energy, never identity. State this face-"
                    + "preservation requirement explicitly in the final prompt.\n";

    /**
     * Modo NARRACAO (padrão comercial): o texto do prompt fica em inglês, mas a FALA dentro
     * do vídeo tem que ser pt-BR. Sem isso o Veo3 fala inglês por padrão. Reforça a regra da
     * base de conhecimento (12-output-rules.md) num ponto de alta atenção.
     */
    private static final String AUDIO_NARRACAO =
            "\n---\n## AUDIO / SPOKEN LANGUAGE\n"
                    + "The prompt text stays in English, but ALL spoken audio in the video "
                    + "(dialogue, voiceover, narration) must be in Brazilian Portuguese (pt-BR). "
                    + "The on-screen character never speaks English. Make this explicit in the final prompt.\n";

    /**
     * Modo MUSICA: vídeo SEM fala (ex.: dancinha mostrando o produto). Precisa sobrepor
     * explicitamente o default falado da base de conhecimento — por isso manda ignorar
     * qualquer regra acima que peça diálogo/CTA falado. Áudio = música/trilha em alta.
     */
    private static final String AUDIO_MUSICA =
            "\n---\n## AUDIO (music, NO speech)\n"
                    + "This video has NO spoken dialogue, voiceover or narration — the on-screen "
                    + "character does NOT speak at all. Override and IGNORE any rule above that asks "
                    + "for spoken dialogue, voiceover or a spoken call-to-action. The audio is upbeat, "
                    + "trending background music that fits a short vertical social clip. Any call-to-"
                    + "action is VISUAL only (on-screen text or a natural gesture toward the product), "
                    + "never spoken. Make this explicit in the final prompt.\n";

    /**
     * Modo SILENCIO: também SEM fala, mas sem impor trilha — deixa o Veo escolher o som
     * ambiente natural. Mesmo override do modo música quanto a não falar.
     */
    private static final String AUDIO_SILENCIO =
            "\n---\n## AUDIO (natural ambient, NO speech)\n"
                    + "This video has NO spoken dialogue, voiceover or narration — the on-screen "
                    + "character does NOT speak at all. Override and IGNORE any rule above that asks "
                    + "for spoken dialogue, voiceover or a spoken call-to-action. Use natural, subtle "
                    + "ambient sound only (no forced music); let the scene's own audio carry it. Any "
                    + "call-to-action is VISUAL only (on-screen text or a natural gesture toward the "
                    + "product), never spoken. Make this explicit in the final prompt.\n";

    private String fillMaster(String body, VideoTemplate template, Product product) {
        String category = product.getCategory() != null ? product.getCategory().getName() : null;
        return body
                // Produto (campos disponíveis; ausentes ficam vazios — o master tolera)
                .replace("{{PRODUCT_NAME}}", nvl(sanitizer.clean(product.getName())))
                .replace("{{CATEGORY}}", nvl(sanitizer.clean(category)))
                .replace("{{DESCRIPTION}}", nvl(sanitizer.clean(product.getDescription())))
                .replace("{{BRAND}}", "")
                .replace("{{MAIN_BENEFIT}}", "")
                .replace("{{SECONDARY_BENEFITS}}", "")
                .replace("{{PROBLEM}}", "")
                .replace("{{USP}}", "")
                .replace("{{TARGET_AUDIENCE}}", "")
                // Avatar: é imagem de referência (sem atributos estruturados aqui)
                .replace("{{AVATAR_GENDER}}", "")
                .replace("{{AVATAR_AGE}}", "")
                .replace("{{AVATAR_STYLE}}", "")
                .replace("{{PERSONALITY}}", "")
                // Ambiente: não modelado no fluxo — deixa o modelo inferir da cena base
                .replace("{{ENVIRONMENT}}", "")
                .replace("{{LIGHTING}}", "")
                .replace("{{MOOD}}", "")
                // Vídeo: direção curada do template
                .replace("{{VIDEO_STYLE}}", nvl(template.getVideoStyle()))
                .replace("{{OBJECTIVE}}", nvl(template.getObjective()))
                .replace("{{DURATION}}", nvl(template.getDuration()))
                .replace("{{TONE}}", nvl(template.getTone()))
                .replace("{{ENERGY}}", nvl(template.getEnergy()));
    }

    private String loadMaster() {
        String cached = masterTemplate;
        if (cached == null) {
            cached = readResource(MASTER_PATH);
            masterTemplate = cached;
        }
        return cached;
    }

    private String loadKnowledge() {
        String cached = knowledgeBase;
        if (cached == null) {
            cached = readKnowledge();
            knowledgeBase = cached;
        }
        return cached;
    }

    private String readKnowledge() {
        try {
            Resource[] resources = new PathMatchingResourcePatternResolver().getResources(KNOWLEDGE_GLOB);
            return Arrays.stream(resources)
                    .sorted(Comparator.comparing(r -> nvl(r.getFilename())))
                    .map(this::readResource)
                    .reduce((a, b) -> a + "\n\n" + b)
                    .orElse("");
        } catch (IOException e) {
            throw new UncheckedIOException("Falha ao carregar a base de conhecimento do prompt-engine", e);
        }
    }

    private String readResource(String location) {
        return readResource(new PathMatchingResourcePatternResolver().getResource(location));
    }

    private String readResource(Resource resource) {
        try {
            return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new UncheckedIOException("Falha ao ler recurso do prompt-engine: " + resource, e);
        }
    }

    private String firstNonBlank(String primary, String fallback) {
        return (primary == null || primary.isBlank()) ? fallback : primary;
    }

    private String nvl(String value) {
        return value == null ? "" : value;
    }
}
