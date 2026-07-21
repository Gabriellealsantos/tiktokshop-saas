-- Fluxo de geração viral (Novelinha Viral + Objetos Falantes).
-- Reusa FlowType.VIRAL_MODEL (limite diário já semeado em V9: 5/dia, 3 correções).
--
-- Cadastro híbrido: template + personagens + tons ficam no banco (editáveis via
-- /api/admin/viral/**), e o corpo do ".md" de instrução fica em colunas TEXT
-- (script_instruction / prompt_instruction). O ViralPromptComposer preenche os
-- placeholders abaixo antes de enviar ao LLM:
--   Roteiros:      {{templateTitle}} {{characterName}} {{characterDescription}} {{toneLabel}} {{toneDescription}}
--   Prompt final:  + {{scriptTitle}} {{scriptDescription}} {{scriptQuote}}

CREATE TABLE viral_flow_templates (
    id                 BIGSERIAL PRIMARY KEY,
    slug               VARCHAR(60) NOT NULL UNIQUE,
    title              VARCHAR(120) NOT NULL,
    subtitle           VARCHAR(255),
    description        TEXT,
    thumbnail_url      VARCHAR(1024),
    preview_video_url  VARCHAR(1024),
    script_instruction TEXT NOT NULL,
    prompt_instruction TEXT NOT NULL,
    active             BOOLEAN NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE viral_characters (
    id          BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES viral_flow_templates(id) ON DELETE CASCADE,
    slug        VARCHAR(60) NOT NULL,
    name        VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    image_url   VARCHAR(1024),
    sort_order  INTEGER NOT NULL DEFAULT 0,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (template_id, slug)
);

CREATE INDEX idx_viral_characters_template ON viral_characters (template_id, active, sort_order);

CREATE TABLE viral_tones (
    id          BIGSERIAL PRIMARY KEY,
    slug        VARCHAR(60) NOT NULL UNIQUE,
    label       VARCHAR(120) NOT NULL,
    description VARCHAR(255),
    sort_order  INTEGER NOT NULL DEFAULT 0,
    active      BOOLEAN NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------------
-- Seed: tons (espelha o front character-flow/data.ts)
-- ------------------------------------------------------------------
INSERT INTO viral_tones (slug, label, description, sort_order, active) VALUES
    ('funny',     'Engraçado',  'Punchline e humor leve',          0, TRUE),
    ('sarcastic', 'Sarcástico', 'Humor seco, deadpan',             1, TRUE),
    ('absurd',    'Absurdo',    'Viradas inesperadas, surreal',    2, TRUE),
    ('cute',      'Ternurinha', 'Fofo e carismático',              3, TRUE),
    ('nostalgic', 'Nostálgico', 'Memória afetiva quente',          4, TRUE);

-- ------------------------------------------------------------------
-- Seed: template Novelinha Viral ("Vovôs e Vovós")
-- ------------------------------------------------------------------
INSERT INTO viral_flow_templates
    (slug, title, subtitle, description, thumbnail_url, preview_video_url, script_instruction, prompt_instruction, active, created_at)
VALUES (
    'novelinha',
    'Vovôs e Vovós',
    'Escolha o personagem que vai protagonizar sua história.',
    'Histórias curtas com conflito, personagens e loop.',
    '/characters/novelinha/char-1.png',
    '/novelinha-viral.mp4',
    -- script_instruction (PLACEHOLDER — substituir pelo .md real)
    'Você é um roteirista especialista em vídeos curtos virais para TikTok e Reels.

Template: {{templateTitle}}
Personagem: {{characterName}} — {{characterDescription}}
Tom desejado: {{toneLabel}} ({{toneDescription}})

Crie roteiros de até 8 segundos, com gancho forte nos 2 primeiros segundos, um conflito ou virada, e uma fala de efeito memorável em português do Brasil. A fala deve combinar com o personagem e com o tom escolhido. Priorize retenção, comentários e compartilhamento.',
    -- prompt_instruction (PLACEHOLDER — substituir pelo .md real)
    'Você é um diretor de vídeo de IA. Transforme o roteiro escolhido em um prompt de geração de vídeo cinematográfico.

Template: {{templateTitle}}
Personagem: {{characterName}} — {{characterDescription}}
Tom: {{toneLabel}} ({{toneDescription}})

Roteiro escolhido:
- Título: {{scriptTitle}}
- Direção de cena: {{scriptDescription}}
- Fala do personagem: "{{scriptQuote}}"

Descreva enquadramento, câmera, movimento, iluminação, expressão e ação do personagem. Mantenha a fala (Dialogue) exatamente em português do Brasil.',
    TRUE,
    now()
);

-- ------------------------------------------------------------------
-- Seed: template Objetos Falantes
-- ------------------------------------------------------------------
INSERT INTO viral_flow_templates
    (slug, title, subtitle, description, thumbnail_url, preview_video_url, script_instruction, prompt_instruction, active, created_at)
VALUES (
    'objetos',
    'Objetos Falantes',
    'Escolha o objeto que vai narrar sua dica.',
    'Dicas memoráveis narradas pelo próprio objeto.',
    '/characters/objetos/char-1.png',
    '/objetos-falantes.mp4',
    'Você é um roteirista especialista em vídeos curtos virais para TikTok e Reels.

Template: {{templateTitle}}
Objeto narrador: {{characterName}} — {{characterDescription}}
Tom desejado: {{toneLabel}} ({{toneDescription}})

Crie roteiros de até 8 segundos em que o próprio objeto narra uma dica memorável em primeira pessoa, com gancho forte nos 2 primeiros segundos e uma fala de efeito em português do Brasil. A fala deve combinar com o objeto e com o tom escolhido. Priorize retenção, comentários e compartilhamento.',
    'Você é um diretor de vídeo de IA. Transforme o roteiro escolhido em um prompt de geração de vídeo cinematográfico.

Template: {{templateTitle}}
Objeto narrador: {{characterName}} — {{characterDescription}}
Tom: {{toneLabel}} ({{toneDescription}})

Roteiro escolhido:
- Título: {{scriptTitle}}
- Direção de cena: {{scriptDescription}}
- Fala do objeto: "{{scriptQuote}}"

Descreva enquadramento, câmera, movimento, iluminação e como o objeto ganha vida ao falar. Mantenha a fala (Dialogue) exatamente em português do Brasil.',
    TRUE,
    now()
);

-- ------------------------------------------------------------------
-- Seed: personagens (10 por template). image_url segue os paths do front.
-- ------------------------------------------------------------------
INSERT INTO viral_characters (template_id, slug, name, description, image_url, sort_order, active)
SELECT t.id, c.slug, c.name, c.description,
       '/characters/novelinha/' || c.slug || '.png', c.ord, TRUE
FROM viral_flow_templates t
CROSS JOIN (VALUES
    ('char-1',  'Vovô do Triciclo', 'Idoso pilotando um triciclo infantil como se fosse uma moto potente, numa estrada de terra.', 0),
    ('char-2',  'Vovó da Janela',   'Senhora observando a rua pela janela, pronta para fofocar sobre a vizinhança.',            1),
    ('char-3',  'Vovô Mecânico',    'Idoso de macacão engordurado consertando um fusca antigo na garagem.',                     2),
    ('char-4',  'Vovó da Cozinha',  'Senhora mexendo uma panela enorme no fogão a lenha, provando o tempero.',                  3),
    ('char-5',  'Vovô Pescador',    'Idoso sentado à beira do rio com vara de bambu, esperando o peixe fisgar.',                4),
    ('char-6',  'Vovó do Crochê',   'Senhora na cadeira de balanço fazendo crochê, cercada de gatos.',                          5),
    ('char-7',  'Vovô do Dominó',   'Idoso na mesa da pracinha batendo a peça de dominó com força.',                            6),
    ('char-8',  'Vovó do Terço',    'Senhora rezando o terço na varanda ao entardecer.',                                        7),
    ('char-9',  'Vovô do Rádio',    'Idoso escutando futebol num radinho de pilha e comemorando o gol.',                       8),
    ('char-10', 'Vovó da Horta',    'Senhora de chapéu de palha cuidando da horta no quintal.',                                9)
) AS c(slug, name, description, ord)
WHERE t.slug = 'novelinha';

INSERT INTO viral_characters (template_id, slug, name, description, image_url, sort_order, active)
SELECT t.id, c.slug, c.name, c.description,
       '/characters/objetos/' || c.slug || '.png', c.ord, TRUE
FROM viral_flow_templates t
CROSS JOIN (VALUES
    ('char-1',  'Caneca Falante',   'Uma caneca de café branca sobre a mesa da cozinha, soltando vapor.',        0),
    ('char-2',  'Vaso de Planta',   'Um vaso de samambaia numa varanda ensolarada.',                             1),
    ('char-3',  'Controle Remoto',  'Um controle de TV largado no sofá, entre as almofadas.',                    2),
    ('char-4',  'Geladeira Tagarela','Uma geladeira antiga cheia de ímãs, na cozinha.',                          3),
    ('char-5',  'Tênis Velho',      'Um par de tênis esportivo gasto no tapete da porta.',                       4),
    ('char-6',  'Panela de Pressão','Uma panela de pressão chiando no fogão.',                                   5),
    ('char-7',  'Despertador',      'Um despertador retrô sobre a mesa de cabeceira.',                           6),
    ('char-8',  'Guarda-chuva',     'Um guarda-chuva pingando ao lado da porta num dia chuvoso.',                7),
    ('char-9',  'Ventilador',       'Um ventilador de mesa girando num quarto abafado.',                         8),
    ('char-10', 'Carteira',         'Uma carteira de couro gasta em cima da cômoda.',                            9)
) AS c(slug, name, description, ord)
WHERE t.slug = 'objetos';
