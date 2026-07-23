package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.entities.enums.ClothSwapMode;

/**
 * Instruções (em inglês) enviadas ao modelo de imagem nos swaps do fluxo /templates.
 * Isoladas aqui para manter o service focado em orquestração (SRP) e facilitar ajuste
 * de prompt sem tocar na lógica.
 */
final class SwapPromptTemplates {

    private SwapPromptTemplates() {
    }

    /** image 1 = frame do vídeo (cena/pose base); image 2 = avatar (pessoa a inserir). */
    static final String PERSON = """
            Replace the person in image 1 with the person shown in image 2.
            Keep EXACTLY the same pose, body position, framing, camera angle, background,
            clothing and lighting from image 1 — only the identity, face and skin of the person
            must match image 2. Preserve photorealism and natural anatomy.
            Avoid: deformed or extra fingers and hands, warped faces, on-screen text, captions,
            watermarks, logos, distorted anatomy, plastic AI look.
            """;

    private static final String CLOTHES_COMPLETO = """
            Dress the person in image 1 with the product shown in image 2, replacing their entire
            outfit with this product. Keep the same person, pose, framing, background and lighting.
            """;

    private static final String CLOTHES_SUBSTITUIR = """
            Replace only the matching garment worn by the person in image 1 with the product shown in
            image 2, keeping the rest of the outfit, person, pose, framing, background and lighting.
            """;

    private static final String CLOTHES_ADICIONAR = """
            Add the product shown in image 2 to the current outfit of the person in image 1,
            layering it naturally. Keep the person, pose, framing, background and lighting.
            """;

    private static final String CLOTHES_CONTRACT = """
            The product's shape, color, print and details must match image 2 faithfully.
            Preserve photorealism and natural fabric behavior.
            Avoid: deformed or extra fingers and hands, warped faces, on-screen text, captions,
            watermarks, logos, distorted anatomy, plastic AI look.
            """;

    static String clothes(ClothSwapMode mode) {
        String body = switch (mode) {
            case COMPLETO -> CLOTHES_COMPLETO;
            case SUBSTITUIR -> CLOTHES_SUBSTITUIR;
            case ADICIONAR -> CLOTHES_ADICIONAR;
        };
        return body + CLOTHES_CONTRACT;
    }
}
