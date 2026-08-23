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
            If the scene has warm/golden lighting, the person's hair and clothing highlights must also be warm.
            Do NOT leave a bright, flat studio-lighting look on the person. Erode any harsh cut-out edges;
            the boundary between the person and the background must blend naturally with the camera focus.
            SKIN IS THE ONE EXCEPTION TO THIS RULE: do not warm, darken, cool or re-tint the skin's
            actual hue to "match" the scene lighting. This lighting adaptation is about brightness,
            highlights and shadow direction ONLY, applied EQUALLY to the face and to the rest of the
            body — never about changing the underlying skin color. The face and the legs/arms/hands
            must keep the EXACT same underlying skin hue as each other; only their brightness may
            differ with pose and shadow, never their color. The skin tone match to image 2/image 3
            always overrides this rule if the two ever seem to disagree.

            IMAGE QUALITY RULE:
            Match the depth of field, lighting quality and camera perspective of image 1 so the
            person belongs naturally to the scene.
            Render the face, skin and hair with real photographic texture — visible pores and
            natural micro-imperfections, never a retouched or beauty-filtered surface.
            Distinguish two different things: image 1 is a compressed video frame, so do NOT copy
            its COMPRESSION artifacts (blockiness, banding, macroblocking) into the person; but DO
            match its PHOTOGRAPHIC characteristics — grain level, sharpness, focus and depth of
            field — so the face never looks cleaner or sharper than the scene around it.
            Do NOT add any new visual elements not present in image 1 (borders, overlays, watermarks).
            """;

    /** Nota de enquadramento da image 2, comum às duas variantes (com ou sem image 3). */
    private static final String PERSON_IMAGE2_NOTE = """
            Replace the person in image 1 with the person shown in image 2.

            IMAGE 2 FRAMING NOTE:
            Image 2 is a close-up crop showing only the head and upper torso of the avatar.
            It is an IDENTITY reference, NOT a body or framing reference. Read the face, hair,
            skin tone and apparent age from it. The body build, height, stance and proportions
            come from image 1 — do not try to infer them from image 2.
            Never crop, zoom or re-frame the result toward image 2's close-up framing:
            the result MUST keep image 1's full framing and camera distance.
            """;

    /**
     * Nota da image 3, anexada só quando o front manda o avatar original (corpo inteiro,
     * sem crop) junto — usada exclusivamente como referência de tom de pele/corpo, nunca
     * como uma segunda identidade nem como fonte de pose/roupa/fundo.
     */
    private static final String PERSON_IMAGE3_NOTE = """

            IMAGE 3 FRAMING NOTE:
            Image 3, when present, is the SAME avatar as image 2 but uncropped, showing the
            full body. It is a SKIN-TONE AND BODY-BUILD reference ONLY — completely ignore
            its own pose, clothing, background and camera framing; those still come
            EXCLUSIVELY from image 1. Use image 3 only to see how the face/skin tone already
            read from image 2 looks on whatever parts of the body it actually leaves bare.
            How much bare skin image 3 shows depends entirely on its outfit: it may show the
            arms and legs, or it may cover them completely with long sleeves and long trousers.
            """;

    /** image 1 = frame do vídeo (cena/pose base); image 2 = avatar (pessoa a inserir). */
    private static final String PERSON_BODY = """

            KEEP from image 1 (the original scene):
            — pose, body position, framing, camera angle, background, and lighting.
              This means the GEOMETRY of the body ONLY — where the limbs are, how they are
              posed, how large they are. It does NOT include the original person's skin: that
              is replaced entirely (see CRITICAL FULL-BODY SKIN RULE below).
            — facial expression (The avatar's face is used for IDENTITY ONLY — the emotional expression MUST match the mood, context, and exact muscle movements of the scene in image 1).

            CRITICAL CLOTHING RULE:
            You MUST KEEP the exact clothing and outfit worn by the person in image 1.
            Preserve the EXACT color, style, fabric, shape, and texture of the original outfit from image 1.
            Do NOT change the clothing color. Do NOT copy any clothing from image 2.
            
            COPY from image 2 (the avatar reference) onto the result:
            — face, facial features, and skin tone
            — hair style and hair color (ALWAYS match the avatar's hair exactly. Include hair volume, texture, natural movement, and flyaway strands consistent with image 2. Match the hairline shape exactly)
            — apparent age (if image 2 shows an elderly person, the ENTIRE result MUST look elderly; if young, young)
            — build ONLY as far as the crop actually shows it (neck thickness, shoulder width). The body's height, weight, proportions and stance stay exactly as in image 1. Adapt the head scale so it sits naturally in image 1's pose and framing — do NOT make the head oversized or disproportionate to the environment
            
            FACIAL IDENTITY LOCK:
            The face from image 2 MUST be reproduced with near-100% photographic likeness.
            Copy EXACTLY: eye shape and color, eyebrow shape and thickness, nose shape and size,
            lip shape, jawline, chin, forehead proportions, ear shape (if visible),
            facial bone structure, and any unique facial features (beauty marks, dimples, etc.).
            Even if the avatar looks similar to the original person, you MUST forcefully apply all specific facial features from image 2 to ensure a complete identity swap.
            Do NOT average, blend, or approximate the facial features — reproduce them exactly.
            """;

    /** Regra de pele quando só temos a image 2 (crop de rosto) — extrapola por texto. */
    private static final String SKIN_RULE_FACE_ONLY = """

            CRITICAL FULL-BODY SKIN RULE:
            Image 2 only shows the skin of the face, neck and upper chest. Take the exact skin
            tone from that visible area and EXTEND it consistently to every visible part of the
            body in the result — hands, arms, shoulders, legs, feet — even though those parts do
            not appear in image 2. This includes:
            — Exact skin tone and color sampled from image 2
            — Age-appropriate skin texture
            — Visible pores, natural skin grain, and subtle imperfections matching image 2
            There must be NO tone break between the face and the rest of the body: the head and
            the body MUST read as the SAME person, lit by image 1's light.
            """;

    /**
     * Regra de pele quando a image 3 (avatar sem crop, corpo inteiro) também está presente —
     * amostra o tom diretamente do corpo em vez de extrapolar só por texto a partir do rosto.
     */
    private static final String SKIN_RULE_WITH_BODY_REF = """

            CRITICAL FULL-BODY SKIN RULE:
            THE FACE IS THE ANCHOR. The face, neck and hands are always visible in image 2 and
            image 3, so they are the authoritative source of this person's skin tone. Read that
            exact tone and reproduce the SAME tone on every visible part of the body in the
            result — hands, arms, shoulders, legs, feet.
            Image 3 may ALSO expose the arms and legs, depending on its outfit. If it does, use
            that visible skin to confirm the tone. If image 3 covers the arms or legs with long
            sleeves or long trousers, then it gives you NO information about them: in that case
            do NOT guess, do NOT invent a different tone, and do NOT derive anything from the
            clothing — simply extend the exact face/neck/hand tone to those limbs.
            This includes:
            — Exact skin tone and color, identical to the tone of the face
            — Age-appropriate skin texture
            — Visible pores, natural skin grain, and subtle imperfections consistent with image 2
            There must be NO tone break between the face and the rest of the body: the head and
            the body MUST read as the SAME person, lit by image 1's light.
            """;

    /**
     * O modelo lê "KEEP the body from image 1" como "mantenha o corpo inteiro, pele inclusa",
     * e troca só o rosto — o que quebra o tom quando a pessoa original é mais clara/escura que
     * o avatar. Esta regra manda repintar explicitamente, na mesma linguagem que já funciona
     * na regra de tatuagem ("erase and paint over").
     */
    private static final String SKIN_REPAINT_RULE = """

            THE ORIGINAL PERSON'S SKIN IS NOT PRESERVED — REPAINT IT:
            The person in image 1 is a DIFFERENT person and may have a completely different
            skin tone from the avatar: darker, lighter, or a different undertone. That original
            tone is WRONG for this result and MUST be entirely erased and repainted.
            Replacing the person means replacing ALL of their exposed skin, not just the face.
            Every square centimetre of visible skin in the result — face, neck, ears, arms,
            elbows, hands, fingers, knees, legs, ankles and feet — must be REPAINTED to the
            avatar's skin tone. Do NOT leave a single patch of the original person's skin tone
            anywhere in the image.
            SELF-CHECK BEFORE FINISHING: compare the face with the arms and the legs in your
            result. If they do not read as the same skin tone on the same person, the edit has
            FAILED and you must repaint the limbs to match the face.
            """;

    private static final String PERSON_TAIL = """

            TATTOOS & SKIN MARKINGS RULE:
            Look VERY closely at image 2 (the avatar reference).
            — If image 2 CLEARLY shows tattoos: Reproduce ONLY the avatar's exact tattoos.
            — If image 2 does NOT show tattoos: The final result MUST have ZERO tattoos. Completely erase and paint over any tattoo, scar, or mark that was on the person in image 1.
            — NEVER invent, add, or hallucinate tattoos that are not clearly present in image 2.

            """ + PERSON_INTEGRATION + "\n" + VISUAL_CONSISTENCY + "\n" + AVOID_RULES;

    /**
     * image 1 = frame do vídeo (cena/pose base); image 2 = avatar (pessoa a inserir);
     * image 3 (opcional) = mesmo avatar sem crop, só para tom de pele/corpo.
     *
     * Monta o prompt de swap de pessoa. Quando {@code hasBodyReference} é true, o front já
     * enviou a 3ª imagem (avatar original, corpo inteiro) e a regra de pele passa a amostrar
     * o tom direto do corpo em vez de extrapolar só a partir do recorte de rosto.
     */
    public static String buildPersonPrompt(boolean hasBodyReference) {
        String intro = PERSON_IMAGE2_NOTE + (hasBodyReference ? PERSON_IMAGE3_NOTE : "");
        String skinRule = hasBodyReference ? SKIN_RULE_WITH_BODY_REF : SKIN_RULE_FACE_ONLY;
        return intro + PERSON_BODY + skinRule + SKIN_REPAINT_RULE + PERSON_TAIL;
    }

    // ───────────────────────── contexto de cena do template ─────────────────────
    // O texto de cena entra DEPOIS das regras acima e por isso precisa de um cabeçalho que
    // deixe explícito o seu papel. Sem isso o modelo lê a descrição como "gere esta pessoa"
    // e devolve alguém que não é o avatar escolhido.

    /** Cabeçalho do bloco de cena no swap de PESSOA quando o template tem scenePrompt limpo. */
    private static final String SCENE_HEADER_PERSON = """
            SCENE REFERENCE (a text description of image 1 — supporting context only):
            The text below describes ONLY the camera framing, the body pose, the facial
            expression and gaze, the clothing, and the environment that are ALREADY visible
            in image 1. Use it to keep that scene stable while you replace the person.
            It contains NO information about WHO the person is.
            Image 1 is always the authority: if the text and image 1 disagree about anything,
            follow image 1 and ignore the text.
            Expression and gaze in this text are SCENE information (they belong to image 1),
            NOT identity information.
            The identity of the resulting person — face, facial features, skin tone, hair,
            apparent age and body type — comes EXCLUSIVELY from image 2, exactly as stated in
            the FACIAL IDENTITY LOCK and CRITICAL FULL-BODY SKIN RULE above. Nothing written
            below may weaken, blend with, or override those rules.
            """;

    /** Cabeçalho do bloco de cena no swap de PESSOA quando só existe o imagePrompt legado. */
    private static final String SCENE_HEADER_PERSON_LEGACY = """
            LEGACY TEMPLATE DESCRIPTION (partially invalid — read this warning first):
            The text below was originally written to describe the STOCK PERSON of this template.
            It MAY contain descriptions of a face, facial features, skin tone, hair, gender,
            apparent age or body type. EVERY such description is INVALID for this edit and MUST
            be ignored completely — treat those words as if they were not there.
            Extract from it ONLY: camera framing, body pose, facial expression and gaze,
            clothing, and environment. Discard anything else.
            Image 1 is the authority for the scene: where the text and image 1 disagree, follow image 1.
            The identity of the resulting person — face, facial features, skin tone, hair,
            apparent age and body type — comes EXCLUSIVELY from image 2, exactly as stated in
            the FACIAL IDENTITY LOCK and CRITICAL FULL-BODY SKIN RULE above. The text below is
            NEVER a source of identity.
            """;

    /**
     * Reforço final anexado DEPOIS de todos os blocos opcionais do swap de pessoa.
     * O texto do template e o customPrompt do avatar são os últimos tokens do prompt e
     * modelos costumam dar peso extra ao final — esta trava fecha a brecha.
     */
    public static final String PERSON_FINAL_LOCK = """
            FINAL IDENTITY CHECK (highest priority, overrides every text block above):
            The face, facial features, skin tone, hair and apparent age in the result MUST come
            from image 2, from image 3, and from the AVATAR IDENTITY DESCRIPTION block — and
            from nowhere else. Every OTHER physical description of a person in the text above
            (scene text, template text) is background context only — never a source of identity.
            The result must NOT show a third, invented person: it must be the person from
            image 2, placed in the scene of image 1.
            This applies to the WHOLE BODY, not just the head. The person in image 1 is being
            replaced, so none of their skin survives: the arms, hands and legs in the result
            must be repainted to image 2's skin tone, exactly like the face. A result whose
            face and limbs do not match in skin tone is a FAILED edit.

            FINAL PHOTOGRAPHIC CHECK (equally mandatory — identity without this is a failure):
            Copying the identity does NOT mean pasting image 2 into image 1. The result must read
            as ONE photograph taken by ONE camera in ONE moment, never as a head composited onto
            a body. Specifically:
            — HEAD SCALE: the head must be anatomically proportional to the body and to the room.
              A head that reads even slightly too large is a failure. Size it from image 1's body,
              never from image 2's close-up crop.
            — HAIR EDGE: hair must blend into the background with soft, natural strands and
              believable depth of field. No hard cut-out silhouette, no halo, no clean outline.
            — NECK AND SHOULDERS: the jaw, neck and shoulders must connect with continuous
              anatomy, consistent shading and a natural contact shadow under the chin.
            — GRAIN AND FOCUS: the face must carry the SAME grain, noise, sharpness and depth of
              field as the rest of image 1. Do NOT render the face cleaner, smoother, sharper or
              more retouched than the body and the background around it.
            — LIGHT: the face must be lit by image 1's light sources, matching their direction,
              softness and intensity. This applies to brightness and shadow only — never re-tint
              the skin's underlying hue (see the skin exception in the integration rule above).
            — SKIN: real skin texture with pores and micro-imperfections. No beauty filter, no
              airbrushed or plastic surface.
            If the face looks retouched, filtered, or sharper than its surroundings, the result
            is WRONG even when the identity is perfect.
            """;

    /**
     * Última instrução do prompt de roupa. Os tokens finais pesam mais, e sem esta trava
     * o modelo trata a cena como sugestão e reconstrói o ambiente.
     */
    public static final String CLOTHES_FINAL_LOCK = """
            FINAL SCENE CHECK (highest priority, overrides every text block above):
            Image 1 is the ONLY source for the background, the environment, the room, the walls,
            the floor, the decorations, the lighting and the camera framing. Reproduce them
            pixel-for-pixel — do NOT reconstruct, redecorate, re-imagine or replace any part of
            the scene, and do NOT invent objects, furniture, baseboards or wall items that are
            not visible in image 1.
            The person in image 1 — face, hair, skin tone, body and pose — stays exactly as is.
            The ONLY thing that changes in the entire image is the item taken from image 2 —
            either the garment worn by the person or the object held in their hands, according
            to the instruction at the top of this prompt.
            """;

    /** Troca do look inteiro: a roupa descrita no texto está OBSOLETA. */
    private static final String SCENE_HEADER_CLOTHES_REPLACE_ALL = """
            SCENE REFERENCE (a text description of image 1 — environment and framing only):
            Use the text below ONLY for the camera framing, the body pose, the lighting and the
            environment/background. Keep those exactly as described and as seen in image 1.
            CRITICAL — THE CLOTHING IN THIS TEXT IS OBSOLETE: the outfit is being completely
            replaced in this edit. Ignore the "OUTFIT" line and every other mention of garment
            type, color, fabric, print, pattern, sleeve or length in the text. The ONLY valid
            clothing reference is image 2. If the text and image 2 disagree about clothing,
            image 2 always wins. Never re-introduce the original garment, its shape or its color.
            """;

    /** Troca de UMA peça: a peça equivalente está obsoleta, o resto do look é preservado. */
    private static final String SCENE_HEADER_CLOTHES_REPLACE_ONE = """
            SCENE REFERENCE (a text description of image 1 — environment and framing first):
            Use the text below for the camera framing, the body pose, the lighting and the
            environment/background. Keep those exactly as described and as seen in image 1.
            CRITICAL — PARTIAL CLOTHING RULE: only ONE garment is being replaced in this edit.
            For the garment type that matches the product in image 2, the text is OBSOLETE:
            ignore its color, fabric, print and length, and take the replacement garment ONLY
            from image 2 — image 2 always wins over the text.
            All the OTHER pieces of the outfit mentioned in the text must be preserved exactly
            as they appear in image 1. Do not restyle, recolor or remove them.
            """;

    /** Sobreposição: TUDO no texto, inclusive a roupa, deve ser preservado. */
    private static final String SCENE_HEADER_CLOTHES_LAYER = """
            SCENE REFERENCE (a text description of image 1 — preserve everything it describes):
            The text below describes the camera framing, the body pose, the lighting, the
            environment/background AND the outfit the person is ALREADY wearing in image 1.
            ALL of it must be PRESERVED: the item from image 2 is layered ON TOP of the existing
            outfit — it does NOT replace it. The garments described in the text must remain
            visible and unchanged wherever the new item does not cover them.
            Image 1 is the authority: where the text and image 1 disagree, follow image 1.
            """;

    /** Objeto na mão: a cena inteira é preservada; só o item segurado muda. */
    private static final String SCENE_HEADER_HOLD_OBJECT = """
            SCENE REFERENCE (a text description of image 1 — preserve this scene EXACTLY):
            The text below describes the camera framing, the body pose, the lighting, the
            environment/background and the outfit worn in image 1. ALL of it must be reproduced
            without a single change.
            The ONLY element that changes is the item held in the person's hands, which is
            replaced by the product from image 2. The held item is NOT described in this text —
            do not use the text to reconstruct, keep or re-imagine it.
            """;

    /** Sufixo dos blocos de roupa quando o texto veio do scenePrompt limpo. */
    private static final String CLOTHES_SCENE_IDENTITY_NOTE = """
            This text says NOTHING about who the person is: the face, facial features, skin tone,
            hair and body already present in image 1 must stay 100% unchanged.
            """;

    /** Sufixo dos blocos de roupa quando o texto veio do imagePrompt legado. */
    private static final String LEGACY_PERSON_WARNING = """
            WARNING — this is a legacy description: it may also describe the ORIGINAL stock person
            of the template (face, skin tone, hair, gender, apparent age, body type). Every physical
            description of a person in it is INVALID and MUST be ignored. The person already present
            in image 1 must stay 100% unchanged — do not morph them toward the text.
            """;

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
        if (mode == ClothSwapMode.SEGURAR_OBJETO) {
            promptBuilder.append(LIGHTING_INTEGRATION);
            promptBuilder.append(SCALE_RULE);
        }
        promptBuilder.append(ANTI_DEGRADATION);
        promptBuilder.append(VISUAL_CONSISTENCY);
        promptBuilder.append(AVOID_RULES);

        return promptBuilder.toString();
    }

    /**
     * Bloco de cena do swap de PESSOA. Prefere o {@code scenePrompt} limpo; cai no
     * {@code imagePrompt} legado com aviso; devolve vazio quando não há nenhum dos dois
     * (caso dos templates privados enviados pelo usuário — a image 1 já carrega a cena).
     */
    public String personSceneBlock(String scenePrompt, String legacyImagePrompt) {
        if (StringUtils.hasText(scenePrompt)) {
            return "\n\n" + SCENE_HEADER_PERSON + "TEXT:\n" + scenePrompt.trim() + "\n";
        }
        if (StringUtils.hasText(legacyImagePrompt)) {
            return "\n\n" + SCENE_HEADER_PERSON_LEGACY + "TEXT:\n" + legacyImagePrompt.trim() + "\n";
        }
        return "";
    }

    /**
     * Bloco de cena dos swaps de ROUPA/OBJETO. O cabeçalho muda por modo porque a roupa
     * descrita no texto é obsoleta no COMPLETO, parcialmente obsoleta no SUBSTITUIR e
     * precisa ser preservada no ADICIONAR e no SEGURAR_OBJETO.
     */
    public String clothesSceneBlock(ClothSwapMode mode, String scenePrompt, String legacyImagePrompt) {
        boolean clean = StringUtils.hasText(scenePrompt);
        String text = clean ? scenePrompt : legacyImagePrompt;
        if (!StringUtils.hasText(text) || mode == null) {
            return "";
        }
        String header = switch (mode) {
            case COMPLETO -> SCENE_HEADER_CLOTHES_REPLACE_ALL;
            case SUBSTITUIR -> SCENE_HEADER_CLOTHES_REPLACE_ONE;
            case ADICIONAR -> SCENE_HEADER_CLOTHES_LAYER;
            case SEGURAR_OBJETO -> SCENE_HEADER_HOLD_OBJECT;
        };
        return "\n\n" + header
                + (clean ? CLOTHES_SCENE_IDENTITY_NOTE : LEGACY_PERSON_WARNING)
                + "TEXT:\n" + text.trim() + "\n";
    }

    /**
     * Descrição do avatar escolhido. Diferente do texto de cena (que descreve a pessoa
     * ORIGINAL do template e por isso é bloqueado como fonte de identidade), este texto
     * descreve a pessoa que ENTRA — então precisa de um cabeçalho que o marque como fonte
     * válida, senão a trava final o anula junto com o resto.
     * <p>
     * É o único canal capaz de informar o tom de braços e pernas quando a foto do avatar
     * os cobre (moletom, manga e calça compridas) — nesses casos a imagem não tem o dado.
     * </p>
     */
    public String avatarCustomBlock(String customPrompt) {
        return avatarCustomBlock(customPrompt, "image 2 and image 3");
    }

    /**
     * Mesma descrição, mas informando quais imagens carregam a pessoa — a ordem das
     * referências muda por fluxo: no swap de PESSOA o avatar é image 2 (+ image 3);
     * no swap de ROUPA a image 2 é o PRODUTO e o avatar é a image 3.
     */
    public String avatarCustomBlock(String customPrompt, String personImages) {
        if (!StringUtils.hasText(customPrompt)) {
            return "";
        }
        return """

                AVATAR IDENTITY DESCRIPTION (a written description of the person shown in \
                %s — this IS an authoritative identity source):
                The text below describes that SAME person. Unlike the scene text, it is a valid \
                source of identity: use it to resolve anything the images do not show clearly — \
                above all the skin tone of the arms, hands and legs.
                The images still come first: where this text and the images disagree, follow the \
                images. But where the images are SILENT — for example when the avatar's own outfit \
                covers the arms and legs with long sleeves or long trousers — this text decides, \
                and you must apply the skin tone it states to those limbs.
                TEXT:
                """.formatted(personImages) + customPrompt.trim() + "\n";
    }
}
