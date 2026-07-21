package com.venyx.tiktokshop.services.generation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Provider de texto de desenvolvimento — devolve conteúdo canônico sem chamar
 * nenhuma API. Permite exercitar o fluxo viral inteiro localmente sem chave,
 * espelhando o papel do {@link FakeImageProvider}.
 */
@Component
@ConditionalOnProperty(name = "venyx.text-provider", havingValue = "fake", matchIfMissing = true)
public class FakeTextProvider implements TextProvider {

    private static final Logger logger = LoggerFactory.getLogger(FakeTextProvider.class);

    private static final String FAKE_SCRIPTS_JSON = """
            [
              {"id":"script-1","title":"O IPVA Tá Pago",
               "description":"O personagem simula acelerar como uma moto potente e encara a câmera com confiança.",
               "quote":"Pode avisar que o motorista de elite da vila acabou de passar!"},
              {"id":"script-2","title":"Fofoca na Janela",
               "description":"O personagem se debruça e comenta a vizinhança com malícia.",
               "quote":"Essa rua não precisa de câmera de segurança, tem a mim!"},
              {"id":"script-3","title":"Conselho de Ouro",
               "description":"O personagem para tudo e solta uma lição de vida direto na câmera.",
               "quote":"Pressa não enche barriga, meu filho."}
            ]
            """;

    private static final String FAKE_PROMPT = """
            [Scene: vintage setup, cinematic warm lighting, close-up shot]
            Character: An energetic character performing the chosen action with exaggerated, confident body language.
            Action: The character looks directly into the camera with a mischievous, confident smile.
            Dialogue: "Pode avisar que o motorista de elite da vila acabou de passar!"
            Style: cinematic, 4k, hyper-detailed, tiktok viral short, vibrant colors.
            """;

    @Override
    public TextProviderResult generate(TextProviderRequest request) {
        logger.info("[FAKE-TEXT] instrução ({} chars), jsonOutput={}",
                request.instruction().length(), request.jsonOutput());
        return new TextProviderResult(request.jsonOutput() ? FAKE_SCRIPTS_JSON : FAKE_PROMPT);
    }
}
