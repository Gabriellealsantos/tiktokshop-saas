-- Camada de áudio/fala escolhida pelo admin por template de vídeo (fluxo /templates).
-- Default NARRACAO: todos os templates existentes mantêm o comportamento atual (fala pt-BR + CTA).
ALTER TABLE video_templates
    ADD COLUMN audio_mode VARCHAR(20) NOT NULL DEFAULT 'NARRACAO';
