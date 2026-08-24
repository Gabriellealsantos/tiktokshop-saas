-- Ajuste de um degrau na ancora do Lucas Almeida: caramel (MST 6) -> honey (MST 5).
--
-- POR QUE: a classificacao automatica colocou a foto dele em MST 6, mas na revisao visual do
-- resultado o tom ficou mais escuro do que a pessoa da foto. Um degrau na escala Monk e a menor
-- correcao possivel, e mantem o formato canonico intacto.
--
-- POR QUE UMA MIGRATION SEPARADA EM VEZ DE EDITAR A V40: o Flyway roda no start da aplicacao,
-- entao a V40 pode ja ter sido aplicada. Editar um script ja aplicado quebra o checksum e trava
-- o boot. Esta V41 chega ao mesmo estado final nos dois cenarios: se a V40 ainda nao rodou, o
-- Flyway aplica as duas em ordem e o texto passa por caramel antes de virar honey.

UPDATE gallery_avatars SET config = jsonb_set(config, '{customPrompt}', to_jsonb(replace(
    config->>'customPrompt',
    'skin tone: caramel (MST 6), warm golden undertone.',
    'skin tone: honey (MST 5), warm golden undertone.')))
WHERE name = 'Lucas Almeida'
  AND config->>'customPrompt' LIKE '%skin tone: caramel (MST 6), warm golden undertone.%';

DO $$
DECLARE tom TEXT;
BEGIN
    SELECT config->>'customPrompt' INTO tom FROM gallery_avatars WHERE name = 'Lucas Almeida';

    IF tom IS NULL OR tom NOT LIKE '%skin tone: honey (MST 5), warm golden undertone.%' THEN
        RAISE EXCEPTION 'Lucas Almeida ficou sem a ancora honey (MST 5). customPrompt atual: %', tom;
    END IF;
END $$;
