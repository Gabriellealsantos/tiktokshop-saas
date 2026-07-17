-- =====================================================================
-- V16 — Categorias de produto gerenciáveis (enum -> entidade)
-- Substitui a coluna enum products.category por uma FK para a nova
-- tabela categories, permitindo que o admin crie/edite/remova categorias.
-- =====================================================================

CREATE TABLE categories (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(80) NOT NULL,
    slug       VARCHAR(80) NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    system     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Categorias padrão (system = não deletáveis).
INSERT INTO categories (name, slug, sort_order, system) VALUES
    ('Beleza & Cuidados', 'beleza-cuidados', 1, TRUE),
    ('Casa & Decoração',  'casa-decoracao',  2, TRUE),
    ('Saúde & Fitness',   'saude-fitness',   3, TRUE),
    ('Moda & Estilo',     'moda-estilo',     4, TRUE),
    ('Tecnologia',        'tecnologia',      5, TRUE),
    ('Acessórios',        'acessorios',      6, TRUE);

ALTER TABLE products ADD COLUMN category_id BIGINT REFERENCES categories(id);

-- Backfill: mapeia os valores antigos do enum (VARCHAR) para a categoria semeada.
-- FAVORITOS/TOP_PRODUTOS eram filtros, não categorias -> ficam NULL.
UPDATE products p SET category_id = c.id
FROM categories c
WHERE c.slug = CASE p.category
    WHEN 'BELEZA_CUIDADOS' THEN 'beleza-cuidados'
    WHEN 'CASA_MAIS'       THEN 'casa-decoracao'
    WHEN 'SAUDE_FITNESS'   THEN 'saude-fitness'
    WHEN 'MODA'            THEN 'moda-estilo'
    WHEN 'TECNOLOGIA'      THEN 'tecnologia'
    WHEN 'ACESSORIOS'      THEN 'acessorios'
    ELSE NULL
END;

DROP INDEX IF EXISTS idx_products_category;
ALTER TABLE products DROP COLUMN category;
CREATE INDEX idx_products_category ON products(category_id);
