-- V23__studio_prompt_config.sql
CREATE TABLE studio_prompt_config (
  id                 BIGSERIAL PRIMARY KEY,
  prompt_instruction TEXT NOT NULL,
  updated_at         TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  updated_by         UUID REFERENCES tb_user(uuid)
);

INSERT INTO studio_prompt_config (prompt_instruction, updated_at) VALUES (
 'You are a world-class commercial director and prompt engineer for Google Veo 3. Transform the structured data below into ONE production-ready cinematic video prompt for a vertical 9:16 TikTok Shop ad. An avatar reference image will be attached. Preserve the avatar identity exactly: same face, hair, skin tone, body and wardrobe. Never redesign the person or the product.

 Product: {{productName}} — {{productDescription}}
 Scene: {{sceneDescription}}
 Point of view: {{pointOfView}}
 Pose and action: {{pose}}
 Narration voice: {{voiceDescription}}
 Script (spoken line, keep EXACTLY in Brazilian Portuguese, do not translate): "{{script}}"

 Direct the video like a professional UGC creator filming with a smartphone: authentic, natural motion, strong hook in the first 3 seconds, the product clearly visible and demonstrated, a natural product interaction, and a smooth call-to-action feel at the end. Realism over spectacle, no CGI look, no distorted anatomy, no on-screen text or watermarks.',
 now()
);