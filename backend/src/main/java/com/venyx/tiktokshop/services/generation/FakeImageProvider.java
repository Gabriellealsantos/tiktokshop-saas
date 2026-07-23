package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.services.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;

import static java.util.Base64.getDecoder;


@Component
@ConditionalOnProperty(name = "venyx.image-provider", havingValue = "fake", matchIfMissing = true)
public class FakeImageProvider implements ImageProvider {

    private static final Logger logger = LoggerFactory.getLogger(FakeImageProvider.class);

    /** PNG 1x1 transparente — fallback quando não há referência para ecoar. */
    private static final String PIXEL_PNG_BASE64 =
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk"
                    + "YPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

    private final StorageService storageService;

    public FakeImageProvider(StorageService storageService) {
        this.storageService = storageService;
    }

    @Override
    public ImageProviderResult generate(ImageProviderRequest request) {
        logger.info("[FAKE] Prompt gerado: {}", request.prompt());

        // Em dev não há modelo de verdade: em vez de um pixel transparente (invisível no
        // PRINT e nos swaps), devolvemos a 1ª imagem de referência — o frame capturado no
        // swap-person, a base no swap-clothes. Assim o pipeline inteiro (captura → upload →
        // swap → storage → render) fica visualmente verificável sem gastar API do provider.
        List<String> refs = request.referenceImageUrls();
        if (!refs.isEmpty()) {
            try {
                StorageService.DownloadedFile ref = storageService.download(refs.get(0));
                logger.info("[FAKE] Ecoando 1ª referência ({} bytes, {})", ref.content().length, ref.contentType());
                return new ImageProviderResult(ref.content(), ref.contentType());
            } catch (Exception e) {
                logger.warn("[FAKE] Não consegui ecoar a referência, caindo no pixel: {}", e.getMessage());
            }
        }

        return new ImageProviderResult(getDecoder().decode(PIXEL_PNG_BASE64), "image/png");
    }
}