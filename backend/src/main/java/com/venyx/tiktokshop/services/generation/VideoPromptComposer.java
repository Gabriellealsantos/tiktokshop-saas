package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.entities.Product;
import com.venyx.tiktokshop.entities.VideoTemplate;
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
        String motion = firstNonBlank(template.getMotionInstruction(), DEFAULT_MOTION);

        return loadKnowledge()
                + "\n\n---\n\n" + filledMaster
                + "\n\n---\n## MOTION REFERENCE (replicate this movement)\n" + motion.trim() + "\n";
    }

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
