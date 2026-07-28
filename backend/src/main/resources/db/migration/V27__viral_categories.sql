-- ------------------------------------------------------------------
-- Categorização dos modelos virais.
--
-- `category` (template): tag livre para agrupar/filtrar templates (ex.: 'POV').
-- `subcategory` (personagem): divide a lista de personagens em seções dentro de
-- um mesmo template — 'vovo'/'vova' na Novelinha, 'objeto'/'fruta' nos Objetos.
-- Ambas nullable: template/personagem sem categoria continua funcionando.
-- ------------------------------------------------------------------

ALTER TABLE viral_flow_templates ADD COLUMN category VARCHAR(50);
ALTER TABLE viral_characters ADD COLUMN subcategory VARCHAR(50);

-- Novelinha: os 10 personagens já são 5 avôs / 5 avós, alternados por slug.
UPDATE viral_characters c
SET subcategory = 'vovo'
FROM viral_flow_templates t
WHERE c.template_id = t.id
  AND t.slug = 'novelinha'
  AND c.slug IN ('char-1', 'char-3', 'char-5', 'char-7', 'char-9');

UPDATE viral_characters c
SET subcategory = 'vova'
FROM viral_flow_templates t
WHERE c.template_id = t.id
  AND t.slug = 'novelinha'
  AND c.slug IN ('char-2', 'char-4', 'char-6', 'char-8', 'char-10');

-- Objetos falantes: todo o seed atual é objeto doméstico. A seção 'fruta' nasce
-- vazia e será populada quando os personagens de fruta forem cadastrados.
UPDATE viral_characters c
SET subcategory = 'objeto'
FROM viral_flow_templates t
WHERE c.template_id = t.id
  AND t.slug = 'objetos';

CREATE INDEX idx_viral_characters_subcategory ON viral_characters (template_id, subcategory);
