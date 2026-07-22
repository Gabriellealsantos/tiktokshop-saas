package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.ViralScriptDTO;
import com.venyx.tiktokshop.entities.ViralCharacter;
import com.venyx.tiktokshop.entities.ViralFlowTemplate;
import com.venyx.tiktokshop.entities.ViralTone;
import org.springframework.stereotype.Component;

/**
 * Monta a instrução final enviada ao LLM a partir do corpo ".md" do template
 * (com placeholders preenchidos) + um contrato de saída fixo. Análogo ao
 * {@code AvatarPromptBuilder}, mas para geração de texto em dois passos.
 *
 * <p>Placeholders suportados no corpo do template:
 * <ul>
 *   <li>{@code {{templateTitle}} {{characterName}} {{characterDescription}} {{toneLabel}} {{toneDescription}}}</li>
 *   <li>somente no prompt final: {@code {{scriptTitle}} {{scriptDescription}} {{scriptQuote}}}</li>
 * </ul>
 * O contrato de saída (JSON dos roteiros / formato do bloco em inglês) é anexado
 * aqui em código, para que os ".md" cuidem apenas da direção criativa.
 */
@Component
public class ViralPromptComposer {

    private final PromptSanitizer sanitizer;

    public ViralPromptComposer(PromptSanitizer sanitizer) {
        this.sanitizer = sanitizer;
    }

    private static final String SCRIPTS_CONTRACT = """

            ---
            Responda SOMENTE com um array JSON válido, sem markdown, com EXATAMENTE 3 objetos no formato:
            [{"id":"script-1","title":"...","description":"...","quote":"..."}]
            - "title": nome curto e chamativo do roteiro (pt-BR).
            - "description": direção de cena resumida (pt-BR).
            - "quote": a fala do personagem (pt-BR), curta e de efeito.
            """;

    private static final String PROMPT_CONTRACT = """

            ---
            Responda SOMENTE com o prompt de vídeo final, em INGLÊS, sem markdown e sem
            explicações fora do prompt. Preencha cada bloco com direção concreta e visual:
            [Scene: environment, time of day, mood]
            Character: physical appearance, wardrobe, expression — consistent with the description
            Action: what happens in ~8 seconds, beat by beat
            Camera: shot size and movement (e.g. medium close-up, slow push-in, handheld) + lens feel
            Lighting: quality, direction and color (e.g. soft warm key light, moody rim light)
            Dialogue: "<mantenha a fala EXATAMENTE em português do Brasil, sem traduzir>"
            Style: cinematic, 4k, hyper-detailed, vertical 9:16, tiktok viral short, natural realistic motion
            Avoid: deformed or extra fingers and hands, warped faces, on-screen text, captions,
            subtitles, watermarks, logos, distorted anatomy, flickering, plastic AI look, unnatural motion.
            """;

    /** Passo 1 — instrução para gerar os 3 roteiros. */
    public String composeScripts(ViralFlowTemplate template, ViralCharacter character, ViralTone tone) {
        return fillCommon(template.getScriptInstruction(), template, character, tone) + SCRIPTS_CONTRACT;
    }

    /** Passo 2 — instrução para gerar o prompt final a partir do roteiro escolhido. */
    public String composeFinalPrompt(ViralFlowTemplate template, ViralCharacter character,
                                     ViralTone tone, ViralScriptDTO script) {
        String body = fillCommon(template.getPromptInstruction(), template, character, tone)
                .replace("{{scriptTitle}}", nvl(sanitizer.clean(script.title())))
                .replace("{{scriptDescription}}", nvl(sanitizer.clean(script.description())))
                .replace("{{scriptQuote}}", nvl(sanitizer.clean(script.quote())));
        return body + PROMPT_CONTRACT;
    }

    private String fillCommon(String body, ViralFlowTemplate template,
                              ViralCharacter character, ViralTone tone) {
        return body
                .replace("{{templateTitle}}", nvl(template.getTitle()))
                .replace("{{characterName}}", nvl(character.getName()))
                .replace("{{characterDescription}}", nvl(character.getDescription()))
                .replace("{{toneLabel}}", nvl(tone.getLabel()))
                .replace("{{toneDescription}}", nvl(tone.getDescription()));
    }

    private String nvl(String value) {
        return value == null ? "" : value;
    }
}
