package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.entities.enums.ClothSwapMode;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class SwapPromptComposer {

    private final PromptSanitizer sanitizer;

    private static final String VISUAL_CONSISTENCY = """
            VISUAL CONSISTENCY RULE:
            The final image must look like a single, unedited photograph.
            The product, person, background, and lighting must all appear to have been
            captured by the same camera in the same moment. Do NOT add any glow, halo,
            blur boundary, or artificial separation between the product and the scene.
            The product's reflections must show the scene (person's hand, room) — NOT
            a studio environment.
            """;

    private static final String AVOID_RULES = """
            Avoid: deformed or extra fingers and hands, warped faces, changed facial identity,
            a different-looking person, oversized or enlarged head, wrong body proportions,
            on-screen text, captions, watermarks, logos, distorted anatomy, plastic AI look.
            """;

    private static final String PERSON_INTEGRATION = """
            ENVIRONMENTAL INTEGRATION RULE:
            The inserted person MUST be perfectly integrated into the scene's lighting and environment.
            Match the scene's lighting direction, intensity, and color temperature exactly.
            The person must cast realistic shadows onto the floor, walls, or surrounding objects consistent with the scene's light sources.
            Add natural ambient occlusion (contact shadows) where the person touches the ground or other surfaces.
            If the scene has warm/golden lighting, the person's skin, hair, and clothing highlights must also be warm.
            Do NOT leave a bright, flat studio-lighting look on the person. Erode any harsh cut-out edges;
            the boundary between the person and the background must blend naturally with the camera focus.
            
            IMAGE QUALITY RULE:
            Preserve the EXACT resolution, sharpness, grain, and noise pattern from image 1.
            Do NOT sharpen, smooth, denoise, or enhance the overall image quality.
            The final result must have the same photographic characteristics as image 1 (ISO grain, depth of field).
            Do NOT add any new visual elements not present in image 1 (borders, overlays, watermarks).
            """;

    /** image 1 = frame do vídeo (cena/pose base); image 2 = avatar (pessoa a inserir). */
    public static final String PERSON = """
            Replace the person in image 1 with the person shown in image 2.

            KEEP from image 1 (the original scene):
            — pose, body position, framing, camera angle, background, and lighting.
            — facial expression (The avatar's face is used for IDENTITY ONLY — the emotional expression MUST match the mood, context, and exact muscle movements of the scene in image 1).

            CRITICAL CLOTHING RULE:
            You MUST KEEP the exact clothing and outfit worn by the person in image 1.
            Preserve the EXACT color, style, fabric, shape, and texture of the original outfit from image 1.
            Do NOT change the clothing color. Do NOT copy any clothing from image 2.
            
            COPY from image 2 (the avatar reference) onto the result:
            — face, facial features, and skin tone
            — hair style and hair color (ALWAYS match the avatar's hair exactly. Include hair volume, texture, natural movement, and flyaway strands consistent with image 2. Match the hairline shape exactly)
            — apparent age (if image 2 shows an elderly person, the ENTIRE result MUST look elderly; if young, young)
            — body type and build (Match the general body type from image 2, but adapt the scale and proportions so the head size fits perfectly and naturally with the pose and framing of image 1. Do NOT make the head oversized or disproportionate to the environment)
            
            FACIAL IDENTITY LOCK:
            The face from image 2 MUST be reproduced with near-100% photographic likeness.
            Copy EXACTLY: eye shape and color, eyebrow shape and thickness, nose shape and size,
            lip shape, jawline, chin, forehead proportions, ear shape (if visible),
            facial bone structure, and any unique facial features (beauty marks, dimples, etc.).
            Even if the avatar looks similar to the original person, you MUST forcefully apply all specific facial features from image 2 to ensure a complete identity swap.
            Do NOT average, blend, or approximate the facial features — reproduce them exactly.
            
            CRITICAL FULL-BODY SKIN RULE:
            The skin on the ENTIRE body (hands, arms, neck, chest, legs — every visible area, NOT just the face)
            MUST match image 2's skin exactly. This includes:
            — Exact skin tone and color from image 2
            — Age-appropriate skin texture
            — Visible pores, natural skin grain, and subtle imperfections matching image 2
            The body and the face MUST look like they belong to the SAME person from image 2.
            
            TATTOOS & SKIN MARKINGS RULE:
            Look VERY closely at image 2 (the avatar reference).
            — If image 2 CLEARLY shows tattoos: Reproduce ONLY the avatar's exact tattoos.
            — If image 2 does NOT show tattoos: The final result MUST have ZERO tattoos. Completely erase and paint over any tattoo, scar, or mark that was on the person in image 1.
            — NEVER invent, add, or hallucinate tattoos that are not clearly present in image 2.
            
            """ + PERSON_INTEGRATION + "\n" + VISUAL_CONSISTENCY + "\n" + AVOID_RULES;

    // Use a default label if no product name is provided.
    private static final String DEFAULT_PRODUCT = "the product";

    // Text block parametrized with %s for the product name
    private static final String CLOTHES_COMPLETO = """
            Dress the person in image 1 with the '%s' shown in image 2.
            The original outfit must be completely replaced by the '%s'.
            CRITICAL ANATOMY RULE: You MUST preserve the person's original hands, fingers, arms, and legs.
            Do NOT cover the hands with the dress or sleeves unless image 2 has long sleeves.
            Even if the dress has a long skirt, the person's hands and arms MUST remain visible and anatomically correct.
            CRITICAL PROPORTION RULE: The clothing must fit the person's existing body type and proportions.
            Do NOT enlarge the person's head or change the body shape to match the mannequin in image 2.
            Keep the person's face, hair, pose, framing, background and lighting exactly the same.
            """;

    private static final String CLOTHES_SUBSTITUIR = """
            Replace only the matching garment worn by the person in image 1 with the '%s' shown in image 2,
            keeping the rest of the outfit, person, pose, framing, background and lighting.
            CRITICAL ANATOMY RULE: Preserve the person's original hands, fingers, and body proportions.
            Do NOT enlarge the head or alter the body shape. The garment must fit the person's existing silhouette.
            """;

    private static final String CLOTHES_ADICIONAR = """
            Add the '%s' shown in image 2 to the current outfit of the person in image 1,
            layering it naturally. Keep the person, pose, framing, background and lighting.
            CRITICAL ANATOMY RULE: Preserve the person's original hands, fingers, and body proportions.
            """;

    private static final String HOLD_OBJECT = """
            Look at image 1: identify the item the person is HOLDING or DISPLAYING in their hands.
            This held item must be COMPLETELY REMOVED and REPLACED with the '%s' shown in image 2.

            CRITICAL DISTINCTION — "HELD item" vs "WORN clothing":
            — The "held item" is whatever the person's fingers are gripping, presenting, or displaying.
              It could be a garment held up for display, a product, a phone, or any other object.
            — The "worn clothing" is the outfit ON the person's body (shirt, pants, shoes, etc.).
            — You MUST replace ONLY the held item. The worn clothing MUST stay 100%% unchanged.

            REPLACEMENT RULES:
            — The held item from image 1 MUST completely disappear. No traces of it should remain.
            — Place the new product (from image 2) in the EXACT same position and hand grip as the original held item.
            — The person must NOT hold two items. Only the new product should be visible in their hands.
            — Adjust the new product's size so it looks natural when held by this person.

            CRITICAL POSE RULE:
            — Keep the person's arms, hands, and overall pose from image 1.
            — Redraw the fingers to naturally wrap around the new product's shape, thickness, and grip area.
            — If the person was holding the original item with both hands, the new product should also be held with both hands in a natural way.

            ABSOLUTE PRESERVATION RULES — Do NOT change ANY of the following:
            — The person's face, hair, skin tone, and identity
            — The clothing the person is WEARING on their body
            — The person's body proportions and position in the frame
            — The background, environment, and camera framing
            — The lighting, color grading, and overall image quality
            ONLY the held/displayed item changes — EVERYTHING else stays exactly as in image 1.
            """;


    private static final String HAND_RECONSTRUCTION = """
            HAND RECONSTRUCTION RULE:
            You MUST completely redraw the hand to match the new object's shape.
            The fingers, palm, and thumb MUST physically wrap around the new object's
            actual handle with correct anatomy:
            — Thumb on one side, fingers wrapping from the other side
            — Fingertips must be visible pressing against the object surface
            — Palm must conform to the object's shape
            — Wrist angle must be natural for the object's weight and orientation
            The hand MUST look like a real person holding this specific object —
            not like an object was pasted on top of existing fingers.
            """;

    private static final String GRIP_INTEGRATION = """
            GRIP INTEGRATION:
            The fingers must wrap around the product's actual handle/grip with natural skin
            compression where fingertips press against the surface. Add subtle color bleed
            between the skin and the product where they touch. The wrist angle must be
            ergonomically natural for holding the specific product shape and weight.
            """;

    private static final String CLOTHING_INTEGRATION = """
            CLOTHING INTEGRATION & FABRIC PHYSICS RULE:
            The garment MUST NOT look like a flat 2D sticker. It MUST wrap realistically around the person's body in 3D space.
            Generate natural folds, creases, tension lines, and wrinkles that respond to the person's specific pose, body curves, and gravity.
            The fabric texture must be visibly photorealistic and interact with light naturally.
            The clothing MUST adopt the exact same ambient lighting, directional shadows, and color temperature of the room/environment from image 1.
            Add soft contact shadows (ambient occlusion) where the clothing rests on the body or skin.
            Blend the edges of the clothing seamlessly with the background and the person's skin to remove any "cut-out" or pasted look.
            """;

    private static final String HAND_PROTECTION_RULE = """
            CRITICAL HAND & FINGER PRESERVATION RULE:
            You MUST perfectly preserve the person's original hands, fingers, wrists, and arms from image 1.
            The new clothing MUST NOT bleed into, distort, or cover any part of the hands or fingers.
            If a hand is resting on the body or hips, the new fabric MUST flow UNDER the hand, leaving the original fingers 100% intact and clearly visible ON TOP of the fabric.
            Do NOT merge skin pixels with fabric pixels. Ensure absolute anatomical correctness for all 10 fingers.
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
            """;

    private static final String HOLD_OBJECT_IDENTITY_LOCK = """
            CRITICAL IDENTITY RULE: Keep the person's face, facial features, skin tone, hair,
            and identity from image 1 EXACTLY UNCHANGED. Do NOT alter, morph, beautify,
            restyle, age, or swap the face. The face in the result MUST be 100% identical
            to the person in image 1.
            Preserve the person's exact body proportions and head-to-body ratio, and their
            size, scale and position within the frame, plus the camera framing and distance
            from image 1 — do NOT resize the head, zoom, crop or re-frame.
            ONLY the held object changes — the person, face, body, clothing, background,
            lighting, and framing MUST remain EXACTLY as in image 1.
            """;

    private static final String ANTI_DEGRADATION = """
            IMAGE QUALITY RULE:
            Preserve the EXACT resolution, sharpness, grain, and noise pattern from image 1.
            Do NOT sharpen, smooth, denoise, or enhance the image quality.
            The final result must have the same photographic characteristics as image 1 —
            same ISO grain, same depth of field, same color grading.
            Do NOT add any new visual elements not present in image 1 (borders, frames,
            vignettes, watermarks, overlays, decorative elements).
            Do NOT alter colors, saturation, or hue of any element that was already correct
            in image 1. If the person's skin tone, hair color, or clothing color was accurate
            in image 1, preserve it exactly — do NOT shift it warmer, cooler, lighter, or darker.
            """;

    private static final String PRODUCT_COLOR_RULE = """
            PRODUCT COLOR RULE:
            The product's color in the result MUST be EXACTLY the same as in image 2.
            Do NOT shift, warm, cool, saturate, desaturate, or tint the product's color.
            If image 2 shows a RED product, the result MUST show the SAME RED — not pink,
            not orange, not any other shade. The product's color must be preserved pixel-accurately.
            """;

    private static final String PRODUCT_EXTRACTION = """
            PRODUCT EXTRACTION RULE:
            The product image (image 2) is a catalog/commercial photo.
            You MUST extract ONLY the physical product object itself using precise masking.
            IGNORE and REMOVE completely: ALL backgrounds (white, black, colored, gradient,
            studio backdrop, any pattern), text overlays, watermarks, logos, price tags,
            packaging, shadows cast by the product on its original background, reflections
            of the original studio environment, any other person's hands, and any other
            objects in the image.
            CRITICAL: Do NOT import any part of image 2's background into the final result.
            The product must appear as if it was physically placed in image 1's scene,
            with ZERO traces of image 2's original environment.
            """;

    private static final String LIGHTING_INTEGRATION = """
            LIGHTING INTEGRATION RULE:
            Match the product's lighting to the scene's lighting direction and color temperature.
            The product MUST cast a soft, natural shadow on the person's hand and arm consistent
            with the scene's light source. If the scene has warm/golden lighting, the product's
            highlights and reflections must also be warm — NOT cool/white studio lighting.
            Add subtle contact shadows where the hand touches or grips the product.
            The product MUST have the same level of photographic grain/noise as the rest of the scene.
            """;

    private static final String SCALE_RULE = """
            SCALE RULE:
            The product's size MUST be proportional to the person's hand and body.
            Use the person's hand as a scale reference: the product must fit naturally
            as if held by a real person of the proportions shown in image 1.
            Do NOT enlarge or shrink the product beyond what is physically realistic.
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

        StringBuilder promptBuilder = new StringBuilder();

        if (mode == ClothSwapMode.COMPLETO) {
            promptBuilder.append(String.format(CLOTHES_COMPLETO, productContext, productContext));
            promptBuilder.append(CLOTHING_INTEGRATION);
            promptBuilder.append(HAND_PROTECTION_RULE);
        } else if (mode == ClothSwapMode.SUBSTITUIR) {
            promptBuilder.append(String.format(CLOTHES_SUBSTITUIR, productContext));
            promptBuilder.append(CLOTHING_INTEGRATION);
            promptBuilder.append(HAND_PROTECTION_RULE);
        } else if (mode == ClothSwapMode.ADICIONAR) {
            promptBuilder.append(String.format(CLOTHES_ADICIONAR, productContext));
            promptBuilder.append(CLOTHING_INTEGRATION);
            promptBuilder.append(HAND_PROTECTION_RULE);
        } else if (mode == ClothSwapMode.SEGURAR_OBJETO) {
            promptBuilder.append(String.format(HOLD_OBJECT, productContext));
            promptBuilder.append("\nThis is a hand-held object. It must be grasped firmly with a natural grip.\n");
            promptBuilder.append("The product's weight must be visible in the wrist tension and hand posture.\n");
            promptBuilder.append(HAND_RECONSTRUCTION);
            promptBuilder.append(GRIP_INTEGRATION);
        } else {
            throw new IllegalArgumentException("Modo desconhecido: " + mode);
        }

        String contract;
        if (mode == ClothSwapMode.SEGURAR_OBJETO) {
            contract = HOLD_OBJECT_IDENTITY_LOCK;
        } else {
            contract = hasAvatarReference ? IDENTITY_LOCK : CLOTHES_CONTRACT;
        }
        promptBuilder.append(contract);
        promptBuilder.append(PRODUCT_EXTRACTION);
        promptBuilder.append(PRODUCT_COLOR_RULE);
        promptBuilder.append(LIGHTING_INTEGRATION);
        promptBuilder.append(SCALE_RULE);
        promptBuilder.append(ANTI_DEGRADATION);
        promptBuilder.append(VISUAL_CONSISTENCY);
        promptBuilder.append(AVOID_RULES);
        
        return promptBuilder.toString();
    }
}
