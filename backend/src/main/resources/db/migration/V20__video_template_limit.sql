-- Cota diária do fluxo VIDEO_TEMPLATE (extração de movimento).
-- Cada geração de imagem por IA (trocar pessoa / trocar roupa e regenerações) consome
-- a cota; a geração do prompt Veo3 (texto) é gratuita. Editável pelo admin em /api/admin/limits.
INSERT INTO daily_limits (flow_type, max_per_day, max_regenerations, updated_at)
VALUES ('VIDEO_TEMPLATE', 5, 3, now());