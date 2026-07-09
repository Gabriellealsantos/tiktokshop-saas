package com.venyx.tiktokshop.services.generation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;


@Component
@ConditionalOnProperty(name = "venyx.image-provider", havingValue = "fake", matchIfMissing = true)
public class FakeImageProvider implements ImageProvider {

    private static final Logger logger = LoggerFactory.getLogger(FakeImageProvider.class);

    @Override
    public ImageProviderResult generate(ImageProviderRequest request) {
        logger.info("[FAKE] Prompt gerado: {}", request.prompt());

        if (request.prompt().contains("Ruivo")) {
            throw new RuntimeException("Falha simulada do provider");
        }

        return new ImageProviderResult("https://placehold.co/1024x1024/png?text=Avatar+IA");
    }
}