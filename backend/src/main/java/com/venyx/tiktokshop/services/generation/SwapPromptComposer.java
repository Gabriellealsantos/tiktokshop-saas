package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.entities.enums.ClothSwapMode;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class SwapPromptComposer {

    private final PromptSanitizer sanitizer;

    /** image 1 = frame do vídeo (cena/pose base); image 2 = avatar (pessoa a inserir). */
    public static final String PERSON = """
            Replace the person in image 1 with the person shown in image 2.

            KEEP from image 1 (the original scene):
            — pose, body position, framing, camera angle, background, and lighting
            — clothing / outfit worn in the scene

            COPY from image 2 (the avatar reference) onto the result:
            — face, facial features, and skin tone
            — hair style and hair color (ALWAYS match the avatar's hair exactly)
            — apparent age (if image 2 shows an elderly person, the ENTIRE result MUST look elderly; if young, young)
            — body type, build, and proportions (match the avatar's physique — slim, heavy, muscular, etc.)
            — height and overall physical frame

            CRITICAL FULL-BODY SKIN RULE:
            The skin on the ENTIRE body (hands, arms, neck, chest, legs — every visible area, NOT just the face)
            MUST match image 2's skin exactly. This includes:
            — Exact skin tone and color from image 2
            — Age-appropriate skin texture: if image 2 shows an elderly person, the hands, arms, neck, and
              all exposed skin MUST show wrinkles, age spots, visible veins, thin skin, and natural sagging
              consistent with that age — do NOT leave young smooth skin on the body
            — If image 2 shows a young person, the body skin must also look young and match that skin tone
            — Visible pores, natural skin grain, and subtle imperfections matching image 2
            The body and the face MUST look like they belong to the SAME person from image 2.
            Do NOT swap only the face while keeping a different body skin.

            TATTOOS & SKIN MARKINGS RULE:
            — FIRST: Remove ALL tattoos, scars, birthmarks, and skin markings from the person in image 1. Start with completely clean skin.
            — THEN: If image 2 (the avatar) has any tattoos or skin markings, reproduce ONLY those exact tattoos with their exact designs and in the exact same body locations as shown on the avatar.
            — The result must show ONLY the avatar's tattoos. Never keep any tattoo from image 1.

            Preserve photorealism, natural anatomy, unretouched raw skin texture.
            Avoid: deformed or extra fingers and hands, warped faces, on-screen text, captions,
            watermarks, logos, distorted anatomy, plastic AI look, smooth airbrushed skin,
            beauty filter, over-smoothed skin, waxy skin, CGI look.
            """;

    // Use a default label if no product name is provided.
    private static final String DEFAULT_PRODUCT = "the product";

    // Text block parametrized with %s for the product name
    private static final String CLOTHES_COMPLETO = """
            Dress the person in image 1 with the '%s' shown in image 2.
            The original outfit must be completely replaced by the '%s'.
            Keep the person, pose, framing, background and lighting exactly the same.
            """;

    private static final String CLOTHES_SUBSTITUIR = """
            Replace only the matching garment worn by the person in image 1 with the '%s' shown in image 2,
            keeping the rest of the outfit, person, pose, framing, background and lighting.
            """;

    private static final String CLOTHES_ADICIONAR = """
            Add the '%s' shown in image 2 to the current outfit of the person in image 1,
            layering it naturally. Keep the person, pose, framing, background and lighting.
            """;

    private static final String HOLD_OBJECT = """
            REMOVE the object currently held by the person in image 1 and REPLACE it completely with the '%s' shown in image 2.
            The original object from image 1 MUST NOT appear in the final image. Do NOT let the person hold two objects.
            Place the new product EXACTLY in the hand that was holding the original object.
            CRITICAL ERGONOMICS RULE: DO NOT just place the center of the new object where the old object was.
            You MUST shift the new object vertically (up or down) so that the person's hand grasps its logical handle, base, or grip area.
            For tall objects (like a hair brush, wand, or bottle), shift the object UPWARDS so the hand holds the BOTTOM handle, NOT the middle or top bristles.
            CRITICAL POSE RULE: You MUST keep the person's arms, hands, and fingers in their EXACT original positions from image 1.
            Do NOT move, redraw, or alter the position of the arms or hands.
            If the product has a power cord, wire, or cable, it MUST extend naturally downwards
            and out of the frame. Do NOT let cords, wires, or any part of the object fade out
            into nothing, float in mid-air, or merge unnaturally into the person's body.
            Do NOT change the person's clothing under any circumstances. Keep the person's outfit,
            pose, framing, background and lighting exactly the same.
            """;

    // The legacy contract for 2 images
    private static final String CLOTHES_CONTRACT = """
            CRITICAL IDENTITY RULE: Keep the person's face, facial features, skin tone, hair, and identity
            from image 1 EXACTLY UNCHANGED. Do NOT alter, morph, beautify, restyle, age or swap the face.
            The face in the result MUST be 100% identical to the person in image 1.
            Preserve the person's exact body proportions and head-to-body ratio, and their size,
            scale and position within the frame, plus the camera framing and distance from
            image 1 — do NOT resize the head, zoom, crop or re-frame.
            CRITICAL PRODUCT RULE: Take from image 2 ONLY the product's design (shape, EXACT color, print, details).
            You MUST preserve the EXACT color, branding, and texture of the product from image 2. Do NOT change its color under any circumstances.
            IGNORE image 2's scale, cropping, or any human body parts visible in image 2.
            The product's shape, color, and details must match image 2 faithfully.
            Preserve photorealism and natural physics.
            Avoid: deformed or extra fingers and hands, warped faces, changed facial identity,
            a different-looking person, oversized or enlarged head, wrong body proportions,
            on-screen text, captions, watermarks, logos, distorted anatomy, plastic AI look.
            """;

    // The new absolute identity lock when image 3 is available
    private static final String IDENTITY_LOCK = """
            CRITICAL IDENTITY RULE: Image 3 is the ABSOLUTE facial identity reference.
            You MUST copy exactly the hair, nose, eyebrows, face shape, and skin tone from Image 3 onto the person,
            guaranteeing near-100% likeness. Fix any noise or distortion in Image 1's face using Image 3.
            Do NOT alter, morph, beautify, restyle, age or swap the face to look like a different person.
            Preserve the person's exact body proportions and head-to-body ratio, and their size,
            scale and position within the frame, plus the camera framing and distance from
            image 1 — do NOT resize the head, zoom, crop or re-frame.
            CRITICAL PRODUCT RULE: Take from image 2 ONLY the product's design (shape, EXACT color, print, details).
            You MUST preserve the EXACT color, branding, and texture of the product from image 2. Do NOT change its color under any circumstances.
            IGNORE image 2's scale, cropping, or any human body parts visible in image 2.
            The product's shape, color, and details must match image 2 faithfully.
            Preserve photorealism and natural physics.
            Avoid: deformed or extra fingers and hands, warped faces, changed facial identity,
            a different-looking person, oversized or enlarged head, wrong body proportions,
            on-screen text, captions, watermarks, logos, distorted anatomy, plastic AI look.
            """;

    public SwapPromptComposer(PromptSanitizer sanitizer) {
        this.sanitizer = sanitizer;
    }

    public String buildClothesPrompt(ClothSwapMode mode, String rawProductName, String rawProductDescription, boolean hasAvatarReference) {
        String name = sanitizer.clean(rawProductName);
        if (!StringUtils.hasText(name)) {
            name = DEFAULT_PRODUCT;
            if (mode == ClothSwapMode.SEGURAR_OBJETO) {
                throw new IllegalArgumentException("O nome do produto é obrigatório para o modo SEGURAR_OBJETO.");
            }
        }
        
        String desc = sanitizer.clean(rawProductDescription);
        String productContext = name;
        if (StringUtils.hasText(desc)) {
            productContext += " (" + desc + ")";
        }

        String body;
        if (mode == ClothSwapMode.COMPLETO) {
            body = String.format(CLOTHES_COMPLETO, productContext, productContext);
        } else if (mode == ClothSwapMode.SUBSTITUIR) {
            body = String.format(CLOTHES_SUBSTITUIR, productContext);
        } else if (mode == ClothSwapMode.ADICIONAR) {
            body = String.format(CLOTHES_ADICIONAR, productContext);
        } else if (mode == ClothSwapMode.SEGURAR_OBJETO) {
            body = String.format(HOLD_OBJECT, productContext);
        } else {
            throw new IllegalArgumentException("Modo desconhecido: " + mode);
        }

        String contract = hasAvatarReference ? IDENTITY_LOCK : CLOTHES_CONTRACT;
        
        return body + contract;
    }
}
