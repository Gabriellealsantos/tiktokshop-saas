package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.entities.enums.ClothSwapMode;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class SwapPromptComposer {

    private final PromptSanitizer sanitizer;

    /** Exclusivo do fluxo de ROUPA: fala do produto, que nao existe no swap de pessoa. */
    private static final String VISUAL_CONSISTENCY = """
            VISUAL CONSISTENCY RULE:
            The final image must look like a single, unedited photograph.
            The product, person, background, and lighting must all appear to have been
            captured by the same camera in the same moment. Do NOT add any glow, halo,
            blur boundary, or artificial separation between the product and the scene.
            The product's reflections must show the scene (person's hand, room) — NOT
            a studio environment.
            """;

    /** Exclusivo do fluxo de ROUPA: fala em preservar identidade, o oposto do swap de pessoa. */
    private static final String AVOID_CLOTHES = """
            Avoid: deformed or extra fingers and hands, warped faces, changed facial identity,
            a different-looking person, oversized or enlarged head, wrong body proportions,
            on-screen text, captions, watermarks, logos, distorted anatomy, plastic AI look.
            """;

    /**
     * Integração fotográfica do swap de pessoa. Substitui a antiga ENVIRONMENTAL INTEGRATION
     * RULE, que autorizava explicitamente repintar o fundo ("cast shadows onto the floor,
     * walls" e "erode any harsh cut-out edges") — as duas coisas que o objetivo proíbe. Aqui a
     * sombra fica restrita a onde image 1 já tem sombra, e a silhueta à área que a pessoa
     * original já ocupava. Também absorve o ANTI_DEGRADATION, que só era aplicado no fluxo de
     * roupa, com o escopo declarado por região: preserva grão e cor na cena, limpa artefato de
     * compressão só na pessoa.
     */
    private static final String PHOTOGRAPHIC_INTEGRATION = """

            PHOTOGRAPHIC INTEGRATION — ONE PHOTOGRAPH, ONE CAMERA:
            The result reads as a single frame from image 1's camera, not as a head placed on
            a body.
            — HEAD SCALE: the head is anatomically proportional to the body and to the room,
              sized from image 1's body rather than from image 2's close-up crop. It occupies
              the same fraction of the frame that image 1's head occupies.
            — JAW, NECK AND SHOULDERS: continuous anatomy, consistent shading, and a natural
              contact shadow under the chin.
            — HAIR EDGE: hair meets the background in soft individual strands at image 1's
              depth of field, the way hair photographs.
            — LIGHT WRAP: the room's light wraps onto the edges of the hair, the jaw and the
              shoulders exactly as it wraps onto every other object in image 1. A subject with
              no light wrap reads as pasted on, however good the face is.
            — GRAIN AND FOCUS: the person carries image 1's grain level, noise, sharpness and
              depth of field, so the face is exactly as clean as the scene around it and no
              cleaner. Image 1 is a compressed video frame: its blockiness, banding and
              macroblocking stay out of the person, while its photographic character stays in.
            — SKIN SURFACE: real skin with visible pores and micro-imperfections, at the same
              resolution as the rest of the frame — an untouched photograph, not a retouched one.
            — SILHOUETTE: the person occupies the same area of the frame that image 1's person
              occupied. Every pixel outside that area is a copy of image 1.
            — SHADOWS: shadows fall exactly where image 1 already has them, with image 1's
              direction, hardness and length. Surfaces that are clean in image 1 stay clean.
            The scene keeps image 1's resolution, sharpness, grain, colour, saturation and hue.
            """;

    /**
     * Frase de tarefa. A orientacao oficial de edicao (diferente de geracao) manda abrir
     * declarando o que muda e o que permanece — antes de qualquer regra.
     */
    private static final String PERSON_TASK = """
            EDIT TASK — SINGLE PERSON REPLACEMENT.
            Image 1 is a photograph. Exactly one thing about it changes: the person's identity
            becomes the person from image 2. Everything else in image 1 — the room, the walls,
            the floor, the furniture, the lighting, the camera framing, the body pose, the
            facial performance and the clothing — is reproduced exactly as it already is.
            """;

    /** Rotulagem explicita das referencias: o vinculo posicional sozinho e fragil. */
    private static final String PERSON_ROSTER = """

            IMAGE ROSTER:
            — IMAGE 1 — THE SCENE. A frame from a video. It is the authority for everything
              except who the person is. It is reproduced, never reinterpreted.
            — IMAGE 2 — THE AVATAR, a close crop of the head and upper torso. It is the
              authority for identity only: face, hair, skin tone, apparent age. Its own
              framing, pose, clothing and background are irrelevant to this edit.
            """;

    /** Linha extra do roster quando o front tambem manda o avatar de corpo inteiro. */
    private static final String PERSON_ROSTER_IMAGE3 = """
            — IMAGE 3 — THE SAME AVATAR, uncropped, full body. It is consulted for one thing
              only: how that person's skin tone reads on the limbs. Its pose, clothing,
              background and framing are irrelevant to this edit.
            """;

    /**
     * A trava de cena que nao existia no swap de pessoa — so o fluxo de roupa tinha uma.
     * As superficies sao enumeradas uma a uma porque o modelo preserva melhor o que e
     * nomeado, e o texto e afirmativo em vez de negativo.
     */
    private static final String SCENE_PIXEL_LOCK = """

            SCENE PIXEL LOCK — THE HIGHEST-PRIORITY RULE OF THIS EDIT:
            Image 1 is the only source of the scene, and the scene is copied, not redrawn.
            Reproduce pixel-for-pixel, unchanged in shape, position, colour, texture and
            brightness:
            — the walls, with their panelling, seams, joins, texture and any marks on them
            — the floor, its material, its grain, and any rug or mat on it
            — the skirting boards, door frames, sockets, switches and wall fittings
            — every piece of furniture, in its exact position, shape and upholstery
            — every decorative object, plant, curtain, mirror and reflection
            — the light sources, their direction, colour temperature, intensity and falloff
            — the camera framing, crop, distance, angle, lens perspective and image borders
            Every pixel that is not part of the person is a copy of image 1. If the result's
            background differs from image 1's background in any visible way, the edit has
            FAILED — however good the face is.
            """;

    /** Identidade: vem exclusivamente da image 2. */
    private static final String PERSON_IDENTITY = """

            IDENTITY — FROM IMAGE 2:
            The result shows the person from image 2, with near-100% photographic likeness.
            Reproduce exactly: eye shape and colour, eyebrow shape and thickness, nose shape
            and size, lip shape, jawline, chin, forehead proportions, ear shape, facial bone
            structure, and any distinguishing marks such as beauty spots or dimples.
            Hair matches image 2 exactly: style, colour, hairline shape, volume, texture and
            the way loose strands fall.
            Apparent age matches image 2: an older avatar produces a person who reads as
            older over the whole body, a younger avatar one who reads as younger.
            This is a complete identity replacement — the result's face is image 2's face.
            Where the two people happen to look alike, image 2's specific features still
            decide every detail, feature by feature.
            Neck thickness and shoulder width follow image 2 as far as its crop shows them.
            Height, weight, body proportions and stance stay exactly as in image 1.
            """;

    /**
     * A performance facial vinha numa unica linha entre parenteses. Como a cena tipica e
     * alguem falando, cada canal (boca, olhar, palpebras, cabeca) precisa ser nomeado: se o
     * modelo fecha a boca ou reposiciona o olhar, o frame deixa de casar com o clipe.
     */
    private static final String PERFORMANCE_LOCK = """

            PERFORMANCE LOCK — FROM IMAGE 1:
            The facial performance belongs to image 1 and transfers unchanged onto image 2's
            face. Image 2 supplies the anatomy; image 1 supplies what that anatomy is doing.
            Reproduce from image 1, exactly as they are in that frame:
            — THE MOUTH: how far it is open, the lip shape, whether teeth are visible and how
              much of them, the tongue position when visible. This frame is usually caught
              mid-speech: keep the mouth in that same mid-word shape, rather than settling it
              into a closed or neutral mouth.
            — THE SMILE: its width, its asymmetry, which side lifts more, the cheek compression
            — THE EYES: the eyelid aperture on each side, any squint, the eyebrow position
            — THE GAZE: the exact direction the eyes point, whether they meet the camera or
              look away from it, and to which side
            — THE HEAD: its tilt, its turn, its forward or backward lean, the chin height
            — THE NECK: its tension, its angle, the line of the jaw against it
            The emotion, the muscle positions and the gaze in the result are the ones already
            present in image 1, rendered on image 2's face.
            """;

    /** A roupa faz parte da cena preservada nesta etapa. */
    private static final String PERSON_CLOTHING = """

            CLOTHING — FROM IMAGE 1:
            The outfit in the result is the outfit in image 1: same colour, same cut, same
            fabric, same folds, same texture, same fit, same fastenings. Image 2's own
            clothing stays in image 2.
            """;

    /**
     * Regra unica de pele. Duas propriedades importam aqui, e as duas custaram uma rodada:
     *
     * <p>1. O eixo e albedo x iluminacao, nao matiz x brilho. Profundidade de tom de pele e
     * luminancia, entao "brilho vem da image 1" entregava ao modelo a luminancia da pessoa
     * ORIGINAL do frame e os membros derivavam para o tom dela (membros claros demais).
     *
     * <p>2. A regra e ABSOLUTA, nao relativa. "Os membros tem o mesmo tom do rosto" obriga o
     * modelo a comparar duas regioes que ele gera de forma independente: sem um valor comum a
     * que ambas se refiram, o resultado oscila em torno do alvo. Tentar consertar isso com um
     * empurrao direcional ("nunca mais claros") so troca o lado do erro — foi o que produziu
     * membros escuros demais. Aqui existe UM valor de albedo, declarado na linha de tom do
     * avatar, e toda regiao de pele renderiza para ele.
     *
     * <p>Por isso este bloco NAO nomeia nenhum tom de pele: sinonimo e lido como instrucao
     * nova, e um exemplo "deep brown" aqui competia com o "medium brown" da descricao do
     * avatar. O unico lugar onde um tom e nomeado e a descricao do avatar.
     */
    private static final String SKIN_RULE = """

            SKIN:
            The skin visible in image 1 belongs to a DIFFERENT person and is replaced along with
            the face. Two separate rules govern the skin of the person replacing them:
            — ALBEDO — the skin's own colour, INCLUDING HOW DEEP OR LIGHT IT IS — is a property of
              the person. This person has ONE albedo value: the one stated in the avatar
              description's skin tone line. Every region of skin renders at that value, including
              limbs no photograph shows and limbs the avatar's own clothing covers. The colour of
              a garment says nothing about the skin near it.
            — ILLUMINATION — direction, intensity, softness and colour temperature — comes from
              image 1 and decides only how much light reaches each surface. The face is lit by
              that room on the same terms as the body, never separately from it.
            Light changes how much light a surface returns, never how deep its own colour is.
            The skin is one continuous surface: jaw into neck into chest, with no seam and no step
            at the collar, the sleeve or the hem.
            It carries real texture: visible pores, natural grain, age-appropriate detail.
            """;

    /**
     * Papel da image 3 no tom de membro. Era um CONDICIONAL ("se mostra a perna leia dali,
     * se cobre estenda o rosto") e o modelo tinha de escolher o ramo olhando a foto — quando
     * o avatar usa calca comprida ele caia no prior, que puxa para o claro. Agora a image 3
     * apenas CONFIRMA o valor unico ja declarado, sem nunca decidi-lo, e sem que o rosto seja
     * a referencia: os dois obedecem a mesma ancora.
     */
    private static final String SKIN_RULE_IMAGE3 = """
            IMAGE 3 CONFIRMS THE VALUE, IT NEVER DECIDES IT:
            Image 3 shows this same person's body. Where its outfit leaves the arms or legs bare,
            use it to confirm the stated albedo value there. Where sleeves or trousers cover
            them, nothing changes: those limbs still render at the stated value.
            """;

    /** Regra de marcas de pele, reduzida de ~75 para ~40 palavras e escrita em afirmativa. */
    private static final String SKIN_MARKINGS = """

            SKIN MARKINGS:
            The result carries exactly the tattoos, scars and marks that are visible in image 2
            — no more, no fewer. Where image 2 shows clear skin, the result's skin is clear,
            and any marking that belonged to image 1's person is painted over.
            """;

    /**
     * Substitui, no caminho da pessoa, o antigo bloco de "avoid" herdado do fluxo de roupa.
     * Aquele bloco pedia para evitar "changed facial identity, a different-looking person"
     * — exatamente o oposto da tarefa deste fluxo.
     */
    private static final String PERSON_ANATOMY_CHECK = """

            ANATOMY CHECK:
            Each hand has five fingers, in image 1's position and at image 1's angle. Body
            proportions are image 1's. The frame carries only what image 1 already contains:
            no added text, caption, watermark, logo, border or overlay.
            """;

    /**
     * image 1 = frame do vídeo (cena/pose base); image 2 = avatar (pessoa a inserir);
     * image 3 (opcional) = mesmo avatar sem crop, só para tom de pele/corpo.
     *
     * <p>Ordem dos blocos: tarefa, roster, trava de cena, identidade, performance, roupa,
     * pele, integração fotográfica. A cena vem cedo porque é o requisito de maior prioridade;
     * a trava final combinada (cena + identidade) é anexada pelo service, depois dos blocos
     * opcionais de template e de avatar.
     */
    public static String buildPersonPrompt(boolean hasBodyReference) {
        String roster = PERSON_ROSTER + (hasBodyReference ? PERSON_ROSTER_IMAGE3 : "");
        String skin = SKIN_RULE + (hasBodyReference ? SKIN_RULE_IMAGE3 : "");
        return PERSON_TASK
                + roster
                + SCENE_PIXEL_LOCK
                + PERSON_IDENTITY
                + PERFORMANCE_LOCK
                + PERSON_CLOTHING
                + skin
                + SKIN_MARKINGS
                + PHOTOGRAPHIC_INTEGRATION
                + PERSON_ANATOMY_CHECK;
    }

    // ───────────────────────── contexto de cena do template ─────────────────────
    // O texto de cena entra DEPOIS das regras acima e por isso precisa de um cabeçalho que
    // deixe explícito o seu papel. Sem isso o modelo lê a descrição como "gere esta pessoa"
    // e devolve alguém que não é o avatar escolhido.

    /** Cabeçalho do bloco de cena no swap de PESSOA quando o template tem scenePrompt limpo. */
    private static final String SCENE_HEADER_PERSON = """
            POSE REFERENCE (a text description of image 1 — read only the parts listed here):
            From the text below, use ONLY what it says about the body pose, the facial
            expression, the gaze and the camera framing. Those are the parts that help you keep
            the performance stable while the person changes.
            Everything the text says about the environment — the room, the walls, the floor,
            the furniture, the decor, the lighting — is already present in image 1 at full
            resolution, and image 1 is the only source used for it. Read the scene from the
            pixels, not from this description.
            This text says NOTHING about who the person is. Expression and gaze in it are SCENE
            information belonging to image 1, not identity information. The identity of the
            resulting person comes exclusively from image 2, image 3 and the avatar description.
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
            FINAL CHECK — BOTH HALVES MUST HOLD. This overrides every text block above.
            THE SCENE IS IMAGE 1'S — background, walls, floor, furniture, lighting and camera
            framing are reproduced from it, unchanged. Any text above that describes the
            environment is context about image 1, never permission to rebuild it.
            THE PERSON IS IMAGE 2'S — face, hair, skin tone and apparent age come from image 2,
            image 3 and the avatar description, and from nowhere else. Every other physical
            description of a person above is background context, never a source of identity.
            THE PERFORMANCE IS IMAGE 1'S — pose, expression, mouth shape and gaze direction,
            rendered on image 2's face.
            Getting the person right and the room wrong is exactly as wrong as the reverse.
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
            CRITICAL IDENTITY RULE: The person in image 1 IS ALREADY the person in image 3 —
            this edit changes their clothing, not their face. Preserve the face, facial
            features, hair, skin tone and identity exactly as they appear in image 1.
            Image 3 is a reference for verification only: consult it if some region of the face
            is degraded or unclear in image 1, and use it solely to repair that region back to
            this same person. It is not an instruction to re-apply the face.
            The face in the result must remain 100% the person already present in image 1.
            Preserve the person's exact body proportions and head-to-body ratio, and their size,
            scale and position within the frame, plus the camera framing and distance from
            image 1 — the head keeps its size, and the frame keeps its crop.
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
        promptBuilder.append(AVOID_CLOTHES);

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
                source of identity: use it to resolve anything the images do not show clearly.
                THE SKIN TONE LINE IN THIS TEXT IS THE ALBEDO VALUE referred to by the SKIN rule \
                above. It is a single value for this person's whole body — face, neck, chest, \
                shoulders, arms, hands, thighs, legs and feet all render at it. It holds for \
                limbs that no photograph shows, which is the case whenever the avatar's own \
                outfit covers the arms or the legs.
                For everything OTHER than that skin tone value, the images come first: where \
                this text and the images disagree about a feature, follow the images.
                TEXT:
                """.formatted(personImages) + customPrompt.trim() + "\n";
    }
}
