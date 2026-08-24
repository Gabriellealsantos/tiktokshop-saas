-- Ancora absoluta de tom de pele nos avatares de galeria (Monk Skin Tone Scale).
--
-- POR QUE: no swap de pessoa o tom de bracos e pernas saia diferente do rosto, ora mais claro
-- ora mais escuro. A causa e que a regra do prompt era RELATIVA ("os membros tem o mesmo tom do
-- rosto"), o que obriga o modelo a comparar duas regioes que ele gera de forma independente: sem
-- um valor comum a que ambas se refiram, o resultado oscila em torno do alvo em vez de convergir.
--
-- A correcao no prompt (SwapPromptComposer.SKIN_RULE) trocou a comparacao por um VALOR UNICO de
-- albedo, que toda regiao de pele deve render. Esta migration cria esse valor: cada customPrompt
-- passa a declarar o tom no formato canonico
--
--     skin tone: <nome-ancora> (MST <n>), <undertone> undertone.
--
-- MST = Monk Skin Tone Scale, a escala de 10 tons publicada pelo Google com o Dr. Ellis Monk.
-- Os numeros foram levantados imagem a imagem, com as 10 fotos julgadas em conjunto para ficarem
-- na mesma regua.
--
-- SOBRE O UNDERTONE: a classificacao automatica devolveu "warm golden" para os 10, achatando
-- justamente os quatro que a descricao escrita a mao marcava como olive (Ana Beatriz, Mariana
-- Costa, Pedro Henrique, Rafael Costa). Colapso para a opcao modal de uma lista fechada nao e
-- medida confiavel, entao nesses quatro vale o undertone escrito a mao.
--
-- ESCOPO: substitui SOMENTE a frase de tom de pele. Rosto, cabelo, corpo, tatuagem e o resto da
-- descricao ficam intactos. Se a frase de origem nao existir mais (customPrompt editado pelo
-- painel), a linha nao e tocada -- e o bloco de verificacao no fim derruba a migration, para que
-- uma ancora faltando nunca passe em silencio.

UPDATE gallery_avatars SET config = jsonb_set(config, '{customPrompt}', to_jsonb(replace(
    config->>'customPrompt',
    'Medium tan olive skin.',
    'skin tone: honey (MST 5), olive undertone.')))
WHERE name = 'Ana Beatriz' AND config->>'customPrompt' LIKE '%Medium tan olive skin.%';

UPDATE gallery_avatars SET config = jsonb_set(config, '{customPrompt}', to_jsonb(replace(
    config->>'customPrompt',
    'Warm-toned medium skin with realistic texture and a natural finish, minimal makeup, with light freckles across the cheeks and the bridge of the nose.',
    'skin tone: caramel (MST 6), warm golden undertone, with realistic texture and a natural finish, minimal makeup, and light freckles across the cheeks and the bridge of the nose.')))
WHERE name = 'Carla Santos' AND config->>'customPrompt' LIKE '%Warm-toned medium skin with realistic texture%';

UPDATE gallery_avatars SET config = jsonb_set(config, '{customPrompt}', to_jsonb(replace(
    config->>'customPrompt',
    'Medium brown skin with warm golden undertones.',
    'skin tone: bronze (MST 7), warm golden undertone.')))
WHERE name = 'Sofia Mendes' AND config->>'customPrompt' LIKE '%Medium brown skin with warm golden undertones.%';

UPDATE gallery_avatars SET config = jsonb_set(config, '{customPrompt}', to_jsonb(replace(
    config->>'customPrompt',
    'Light olive complexion with detailed skin texture and visible pores.',
    'skin tone: honey (MST 5), olive undertone, with detailed skin texture and visible pores.')))
WHERE name = 'Mariana Costa' AND config->>'customPrompt' LIKE '%Light olive complexion with detailed skin texture%';

UPDATE gallery_avatars SET config = jsonb_set(config, '{customPrompt}', to_jsonb(replace(
    config->>'customPrompt',
    'Light sun-kissed skin with warm golden undertones, smooth and radiant with natural glowing makeup.',
    'skin tone: light sand (MST 3), warm golden undertone, smooth and radiant with natural glowing makeup.')))
WHERE name = 'Letícia Silva' AND config->>'customPrompt' LIKE '%Light sun-kissed skin with warm golden undertones%';

UPDATE gallery_avatars SET config = jsonb_set(config, '{customPrompt}', to_jsonb(replace(
    config->>'customPrompt',
    'Medium-light skin with warm olive undertones.',
    'skin tone: honey (MST 5), olive undertone.')))
WHERE name = 'Pedro Henrique' AND config->>'customPrompt' LIKE '%Medium-light skin with warm olive undertones.%';

UPDATE gallery_avatars SET config = jsonb_set(config, '{customPrompt}', to_jsonb(replace(
    config->>'customPrompt',
    'Medium brown skin with warm caramel undertones.',
    'skin tone: caramel (MST 6), warm golden undertone.')))
WHERE name = 'Lucas Almeida' AND config->>'customPrompt' LIKE '%Medium brown skin with warm caramel undertones.%';

UPDATE gallery_avatars SET config = jsonb_set(config, '{customPrompt}', to_jsonb(replace(
    config->>'customPrompt',
    'Medium brown skin with warm undertones.',
    'skin tone: bronze (MST 7), warm golden undertone.')))
WHERE name = 'Bruno Castro' AND config->>'customPrompt' LIKE '%Medium brown skin with warm undertones.%';

UPDATE gallery_avatars SET config = jsonb_set(config, '{customPrompt}', to_jsonb(replace(
    config->>'customPrompt',
    'Light brown skin with warm undertones.',
    'skin tone: honey (MST 5), warm golden undertone.')))
WHERE name = 'Thiago Santos' AND config->>'customPrompt' LIKE '%Light brown skin with warm undertones.%';

UPDATE gallery_avatars SET config = jsonb_set(config, '{customPrompt}', to_jsonb(replace(
    config->>'customPrompt',
    'Tan olive skin with warm undertones.',
    'skin tone: honey (MST 5), olive undertone.')))
WHERE name = 'Rafael Costa' AND config->>'customPrompt' LIKE '%Tan olive skin with warm undertones.%';

-- Guarda: uma ancora que nao entrou e pior do que um erro, porque o avatar volta a depender de
-- vocabulario solto e o sintoma reaparece so nele. Derruba a migration em vez de passar batido.
DO $$
DECLARE sem_ancora TEXT;
BEGIN
    SELECT string_agg(name, ', ' ORDER BY order_index) INTO sem_ancora
    FROM gallery_avatars
    WHERE name IN ('Ana Beatriz', 'Carla Santos', 'Sofia Mendes', 'Mariana Costa',
                   'Letícia Silva', 'Pedro Henrique', 'Lucas Almeida', 'Bruno Castro',
                   'Thiago Santos', 'Rafael Costa')
      AND coalesce(config->>'customPrompt', '') NOT LIKE '%(MST %';

    IF sem_ancora IS NOT NULL THEN
        RAISE EXCEPTION 'Ancora MST nao aplicada em: %. O customPrompt desses avatares nao contem'
                        ' mais a frase de tom de pele esperada -- provavelmente foi editado pelo'
                        ' painel admin. Ajuste a frase de origem nesta migration.', sem_ancora;
    END IF;
END $$;
