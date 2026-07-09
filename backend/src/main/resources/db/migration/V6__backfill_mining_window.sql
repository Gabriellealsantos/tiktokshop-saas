-- mining_window virou enum de janela de horário (W_00_06..W_18_24); a coluna continua
-- VARCHAR (guarda o nome do enum). Converte os valores de texto livre antigos (ex.: "7d",
-- que não parseiam) derivando a faixa de 6h a partir da hora UTC de created_at.
UPDATE products SET mining_window = CASE
    WHEN EXTRACT(HOUR FROM created_at) < 6  THEN 'W_00_06'
    WHEN EXTRACT(HOUR FROM created_at) < 12 THEN 'W_06_12'
    WHEN EXTRACT(HOUR FROM created_at) < 18 THEN 'W_12_18'
    ELSE 'W_18_24' END;
