-- Catálogo de "video templates" do fluxo de extração de movimento (tela /templates).
-- Domínio distinto do fluxo viral de texto (viral_flow_templates): aqui o template é um
-- VÍDEO base cujo movimento será replicado, e a direção alimenta o prompt-engine (Veo3).
--
-- Dono/visibilidade:
--   owner_id NULL  -> template PÚBLICO (cadastrado pelo ADMIN, aparece para todos).
--   owner_id != NULL -> template PRIVADO (upload manual do próprio usuário, só aparece p/ ele).
--
-- Direção do prompt (preenchida na curadoria pública; NULL em uploads privados, que caem
-- num corpo default no VideoPromptComposer):
--   video_style, objective, tone, energy, duration, motion_instruction (corpo ".md" c/ placeholders).

CREATE TABLE video_templates (
    id                 BIGSERIAL PRIMARY KEY,
    slug               VARCHAR(80) NOT NULL UNIQUE,
    title              VARCHAR(120) NOT NULL,
    category           VARCHAR(40),
    thumbnail_url      VARCHAR(1024),
    video_url          VARCHAR(1024) NOT NULL,
    owner_id           UUID REFERENCES tb_user(uuid) ON DELETE CASCADE,
    video_style        VARCHAR(255),
    objective          VARCHAR(255),
    tone               VARCHAR(120),
    energy             VARCHAR(120),
    duration           VARCHAR(60),
    motion_instruction TEXT,
    active             BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order         INTEGER NOT NULL DEFAULT 0,
    created_at         TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE INDEX idx_video_templates_gallery ON video_templates (owner_id, active, sort_order);

-- Seed dos modelos públicos (antes mockados no front em modelosPlaceholder).
INSERT INTO video_templates (slug, title, category, video_url, owner_id, sort_order, created_at) VALUES
    ('novelinha-viral',   'Novelinha Viral',   'Moda',   '/c-criar-seu-video3.mp4', NULL, 1, now()),
    ('ugc-natural',       'UGC Natural',       'UGC',    '/placeholder-video.mp4',  NULL, 2, now()),
    ('review-dinamico',   'Review Dinâmico',   'Beleza', '/placeholder-video.mp4',  NULL, 3, now()),
    ('estilo-vlog',       'Estilo Vlog',       'Beleza', '/placeholder-video.mp4',  NULL, 4, now()),
    ('transicoes-rapidas','Transições Rápidas','Moda',   '/placeholder-video.mp4',  NULL, 5, now()),
    ('storytelling',      'Storytelling',      'UGC',    '/placeholder-video.mp4',  NULL, 6, now());