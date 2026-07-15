package com.venyx.tiktokshop.services.generation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import static java.util.Base64.getDecoder;


@Component
@ConditionalOnProperty(name = "venyx.image-provider", havingValue = "fake", matchIfMissing = true)
public class FakeImageProvider implements ImageProvider {

    private static final Logger logger = LoggerFactory.getLogger(FakeImageProvider.class);

    /** PNG 1x1 transparente — suficiente para validar magic bytes e o fluxo de upload. */
    private static final String PIXEL_PNG_BASE64 =
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk"
                    + "YPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

    @Override
    public ImageProviderResult generate(ImageProviderRequest request) {
        logger.info("[FAKE] Prompt gerado: {}", request.prompt());
        return new ImageProviderResult(getDecoder().decode(PIXEL_PNG_BASE64), "image/png");
    }
}