-- Separa a descricao de CENA da coluna legada image_prompt.
--
-- image_prompt foi escrito para GERAR a pessoa generica original do template, entao mistura
-- cena (enquadramento/pose/roupa/ambiente) com descricao fisica da pessoa (rosto, pele, cabelo,
-- idade, genero). No swap de pessoa esse texto era concatenado logo apos a regra
-- FACIAL IDENTITY LOCK e competia com ela: o modelo recebia DUAS descricoes de "quem e a
-- pessoa" e devolvia uma terceira pessoa, que nao era nem o avatar escolhido nem a original.
--
-- scene_prompt descreve APENAS a cena, em linhas rotuladas
-- (FRAMING / POSE / EXPRESSION / OUTFIT / ENVIRONMENT), referindo-se sempre a "the subject".
-- A identidade passa a vir exclusivamente da imagem do avatar (image 2).

ALTER TABLE video_templates ADD COLUMN IF NOT EXISTS scene_prompt TEXT;

COMMENT ON COLUMN video_templates.scene_prompt IS
    'Descricao APENAS da cena (FRAMING/POSE/EXPRESSION/OUTFIT/ENVIRONMENT). NUNCA descrever rosto, pele, cabelo, idade, genero ou tipo de corpo: a identidade vem da imagem do avatar.';

COMMENT ON COLUMN video_templates.image_prompt IS
    'LEGADO: pode conter descricao da pessoa original do template. Enviado a IA apenas como fallback, com aviso automatico, quando scene_prompt esta vazio.';

-- ---------------------------------------------------------------------------
-- Reescrita dos 14 templates publicos existentes.
-- Slugs sao case-sensitive e alguns colidem apenas no case
-- ('Roupa-masculina' vs 'roupa-masculina' sao linhas DIFERENTES):
-- usar igualdade exata, nunca LOWER() nem ILIKE.
-- Dollar-quoting ($sp$) porque os textos contem apostrofos.
-- ---------------------------------------------------------------------------

UPDATE video_templates SET scene_prompt = $sp$FRAMING: vertical full-body mirror selfie, camera straight-on at chest height.
POSE: the subject stands upright facing the mirror with weight evenly balanced; the right arm is raised and bent at the elbow, holding a black smartphone vertically in front of the face and partially concealing it; the left arm hangs relaxed at the side.
EXPRESSION: neutral, lips slightly parted, gaze directed down toward the phone.
OUTFIT: long brown strapless tube dress with a fitted bodice hugging the torso and a full, flowing floor-length skirt.
ENVIRONMENT: cozy bedroom - on the left a white vanity desk cluttered with makeup bottles and skincare products, a small phone and a black backpack on top, a white cushioned stool tucked underneath; on the right a low bed with beige and soft-pink bedding and a dark bed frame, long beige curtains on a black rod; white walls with small decorative lettering on the far left wall, light honey-toned wood flooring; warm soft indoor lighting.$sp$
WHERE slug = 'vestido';

UPDATE video_templates SET scene_prompt = $sp$FRAMING: vertical full-body mirror selfie, camera straight-on at upper-chest height.
POSE: the subject stands upright and squared to the mirror; the right arm is raised and bent, holding a white smartphone vertically directly in front of the face and fully covering it; the left arm rests naturally along the body.
EXPRESSION: not visible - the face is completely hidden behind the phone.
OUTFIT: white strapless maxi dress with a shirred smocked bodice and a blue folk-style floral print that intensifies into large blue floral motifs toward the wide tiered hem; a single thin gold necklace at the collarbone.
ENVIRONMENT: bright minimal room - soft white curtains fill the background, white ceramic tile flooring, a striped fabric surface (sofa or bed) partially visible at the right edge; diffused natural lighting.$sp$
WHERE slug = 'Vestido-Feminino';

UPDATE video_templates SET scene_prompt = $sp$FRAMING: vertical shot framed from roughly the knees up, camera at eye level.
POSE: the subject stands relaxed, body angled slightly to one side with weight on one leg, turned toward the camera; the left arm is bent across the waist holding a small structured gold clutch tucked against the hip; the right arm rests along the side.
EXPRESSION: soft, gentle closed-lip smile, looking toward the camera.
OUTFIT: short strapless dress with a shirred bodice, white with a purple floral print; gold-toned accessories - layered delicate necklaces at the neckline, stacked bangles and bracelets on both wrists, and rings.
ENVIRONMENT: warm bedroom - a light wood-panel wardrobe fills the right background, a bed dressed in beige and cream linens on the left, a plain beige wall completing the backdrop; warm soft lighting.$sp$
WHERE slug = 'vastido-feminino';

UPDATE video_templates SET scene_prompt = $sp$FRAMING: vertical full-body mirror selfie, camera straight-on at chest height.
POSE: the subject's torso is angled slightly toward the mirror while looking down toward the phone; the right arm is raised and bent at the elbow, holding a black smartphone at head height; the left arm hangs loosely at the side.
EXPRESSION: looking down toward the phone, face only partially visible.
OUTFIT: black long-sleeve shirt with the sleeves rolled up to the forearms and the front left mostly unbuttoned revealing the chest, loose-fitting navy trousers, white flip-flop sandals, and a silver wristwatch on the left wrist.
ENVIRONMENT: modern interior - an open white cube-shelving unit, mostly empty, fills the left background; a glass-front mini fridge stocked with bottled drinks and snack packages at the lower right; white ceramic tile flooring; neutral indoor lighting.$sp$
WHERE slug = 'Roupa-masculina';

UPDATE video_templates SET scene_prompt = $sp$FRAMING: vertical mirror selfie framed from mid-thigh up and cropped just below the chin, so the face is outside the frame; camera straight-on.
POSE: the subject stands squared to the mirror with weight evenly distributed; the right arm is raised and bent at the elbow, holding a silver smartphone at chest height; the left arm hangs relaxed at the side.
EXPRESSION: not visible - the frame is cropped below the chin.
OUTFIT: fitted black short-sleeve compression training t-shirt with subtle gray stitching, black athletic shorts with a drawstring, and white sneakers.
ENVIRONMENT: gym - weight machines and a cable station on the left, dumbbells and loaded barbells on the floor, a water bottle nearby, black exercise mats in the foreground, light wood-laminate flooring, and a wood door in the right background; even neutral indoor lighting.$sp$
WHERE slug = 'roupa-masculina';

UPDATE video_templates SET scene_prompt = $sp$FRAMING: first-person POV, top-down shot from the subject's own point of view looking down, centered on a t-shirt held up toward the camera.
POSE: both hands grip the shirt at the shoulder seams - the left hand at the left shoulder seam, the right hand at the right shoulder seam - holding the garment taut and flat to display its front graphic; the lower frame shows the lap, indicating the subject is seated.
EXPRESSION: not visible - the face is outside the frame in this POV shot.
OUTFIT: black shorts and a light surface across the thighs visible in the lower frame; the held white cotton crew-neck t-shirt carries a car-themed print - technical blueprint-style line drawings of a sports car in front, rear and side views with dimension callout lines and measurement numbers, large faded lettering across the middle, and a full-color rendered white sports car with red brake calipers in the center.
ENVIRONMENT: t-shirt shop or stall - stacks of folded white and gray t-shirts in clear plastic packaging arranged on shelves in the background, each showing similar car line-art prints, on a wooden-topped display table; even neutral indoor retail lighting.$sp$
WHERE slug = 'Mostrando roupa';

UPDATE video_templates SET scene_prompt = $sp$FRAMING: vertical full-body shot, camera at eye level capturing the whole figure.
POSE: the subject stands with the body slightly angled and weight on one leg, chin lifted; the left arm is raised and bent with the hand tucked behind the head; the right arm hangs along the body.
EXPRESSION: calm and confident, face fully visible, no phone in frame.
OUTFIT: cream-beige two-piece set - a thin-strap cami top with a straight neckline and matching high-waisted shorts - with strappy cream platform sandals, a gold watch on one wrist and a delicate thin gold necklace.
ENVIRONMENT: bright modern room - a wooden bookshelf holding books and small potted plants on the left, a wood door on the right, light gray-white walls with visible outlet and switch plates, light ceramic tile flooring with a textured cream shag rug underfoot, and a wooden counter edge in the lower right; clean natural lighting.$sp$
WHERE slug = 'Mostrando-roupa';

UPDATE video_templates SET scene_prompt = $sp$FRAMING: vertical mirror selfie, camera straight-on at chest height.
POSE: the subject's body is slightly angled to accentuate the waist; both hands are raised near the face - the right hand holds a white smartphone vertically, fully covering the face, while the left hand rests just below it near the chin.
EXPRESSION: not visible - the face is completely hidden behind the phone.
OUTFIT: white midi dress with a small repeating geometric diamond print, a twisted cut-out detail at the bust exposing a sliver of midriff, and a ruffled tiered hem; heavily accessorized with multiple rings across both hands, stacked and beaded bracelets on both wrists, an arm cuff on the upper right arm, and layered delicate necklaces.
ENVIRONMENT: home entryway at night - a dark open doorway directly behind, a festive Christmas wreath with red accents mounted on the upper left wall, a light-colored door on the left, a wall-mounted intercom panel, and polished stone tile flooring; warm moody evening lighting.$sp$
WHERE slug = 'mostando-vestido';

UPDATE video_templates SET scene_prompt = $sp$FRAMING: vertical full-body shot, camera straight-on at roughly waist height, capturing the full figure.
POSE: the subject stands facing the camera with weight balanced evenly; both arms are relaxed with the hands tucked into the front pockets of the shorts and the elbows angled outward; no phone in frame.
EXPRESSION: playful, tongue slightly out, face fully visible, looking toward the camera.
OUTFIT: off-white crew-neck short-sleeve t-shirt, beige chino shorts ending above the knee, clean white low-top sneakers, and a dark wristwatch on the left wrist.
ENVIRONMENT: retail fitting-room area - white walls and a light structural frame, a black floor-to-ceiling curtain on the right, and light beige tile flooring; even neutral retail lighting.$sp$
WHERE slug = 'camisa-ugc';

UPDATE video_templates SET scene_prompt = $sp$FRAMING: vertical full-body shot, camera at eye level.
POSE: the subject stands facing the camera in a confident pose with weight balanced, both hands placed on the hips and the elbows pushed outward; no phone in frame.
EXPRESSION: soft closed-lip smile, face fully visible, looking toward the camera.
OUTFIT: matching olive-green activewear set with white trim - a sports bra with white contrast panels and coordinating high-waisted leggings with white side piping - finished with white sneakers and a delicate thin necklace.
ENVIRONMENT: simple room - a light gray wall behind, a white door on the right, a colorful pom-pom tassel garland hanging on the upper left wall, and a black mat on the floor underfoot; bright even lighting.$sp$
WHERE slug = 'roupa-treino-ugc';

UPDATE video_templates SET scene_prompt = $sp$FRAMING: vertical full-body shot, camera straight-on at waist height.
POSE: the subject stands facing the camera in a relaxed, upright pose; both arms hang naturally at the sides with the hands relaxed; no phone in frame.
EXPRESSION: big, warm open smile, face fully visible, looking toward the camera.
OUTFIT: fitted olive-green short-sleeve romper (one-piece shorts jumpsuit) with a front zipper running down the chest and a small stand collar; delicate thin necklaces at the neckline.
ENVIRONMENT: bright upscale home interior - a light wood door centered behind, an open bathroom visible to the right with a stone-topped vanity, mirror and sink, and a bedroom glimpsed through a doorway on the left, over light tile flooring; bright airy natural lighting.$sp$
WHERE slug = 'conjunto-feminino';

UPDATE video_templates SET scene_prompt = $sp$FRAMING: vertical full-body shot, camera at eye level capturing the full figure.
POSE: the subject stands with the body angled slightly and weight on one leg, chin slightly lowered; both arms hang loosely away from the body with the hands relaxed and fingers slightly spread, the right hand resting lightly near a cloth-covered table edge on the right.
EXPRESSION: soft and poised, face fully visible, no phone in frame.
OUTFIT: oversized brown short-sleeve t-shirt with a white text graphic across the chest, tucked loosely over a fitted white mini skirt; a tan shoulder bag on the left shoulder, layered gold accessories - a gold choker, layered pendant necklaces, gold bangles on both wrists - plus white crew socks and sneakers.
ENVIRONMENT: apartment - warm wood flooring, a light-colored built-in wardrobe filling the right background, an open hallway on the left, and a table draped with a textured white cloth on the right; neutral indoor lighting.$sp$
WHERE slug = 'roupa-feminina';

UPDATE video_templates SET scene_prompt = $sp$FRAMING: vertical mirror selfie, camera straight-on at chest height, framing from nearly head to mid-calf.
POSE: the subject's body is angled slightly toward the mirror; the right arm is raised and bent at the elbow, holding a pink smartphone vertically in front of the face and fully covering it; the left arm hangs relaxed at the side with the hand resting near the hip.
EXPRESSION: not visible - the face is completely hidden behind the phone.
OUTFIT: white two-piece outfit - a strapless bandeau crop top exposing a bare midriff with a matching long white neck scarf draped around the throat and trailing down, paired with a long ruched skirt sitting high on the waist and featuring a high thigh slit that reveals the leg.
ENVIRONMENT: bedroom - a warm wood door on the left, a tall white wardrobe with vertical chrome bar handles on the right, and light wood flooring; soft diffused natural lighting.$sp$
WHERE slug = 'roupas-femininas';

UPDATE video_templates SET scene_prompt = $sp$FRAMING: vertical full-body mirror selfie, camera straight-on at chest height, capturing the full figure.
POSE: the subject stands upright and squared to the mirror; the right arm is raised and bent at the elbow, holding a black smartphone vertically in front of the face and fully covering it; the left arm hangs relaxed at the side.
EXPRESSION: not visible - the face is completely hidden behind the phone.
OUTFIT: plain white crew-neck short-sleeve t-shirt, light-gray washed slim jeans, clean white low-top sneakers, a silver watch on the left wrist and a thin chain necklace.
ENVIRONMENT: sleek modern apartment - dark cabinetry and a mounted TV on the left, a window with dark horizontal blinds behind, a white sofa on the right, a textured gray area rug underfoot, and light tile flooring; neutral refined indoor lighting.$sp$
WHERE slug = 'roupa-masculina-casual';

-- Aviso nao-fatal: templates publicos que ficaram sem scene_prompt usarao o fallback legado.
DO $$
DECLARE faltando INT;
BEGIN
    SELECT count(*) INTO faltando
      FROM video_templates
     WHERE owner_id IS NULL AND image_prompt IS NOT NULL AND scene_prompt IS NULL;
    IF faltando > 0 THEN
        RAISE NOTICE 'V39: % template(s) publico(s) sem scene_prompt - usarao o image_prompt legado com aviso.', faltando;
    END IF;
END $$;
