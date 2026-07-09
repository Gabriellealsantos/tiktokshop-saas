-- Runtime das notificações in-app (sino). O modelo Web Push (notification_deliveries/
-- push_subscriptions) fica intocado, reservado p/ fase 2.

-- type distingue prova social de venda (SALE, efêmera) de avisos persistidos.
ALTER TABLE notifications ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'ANNOUNCEMENT';

-- Leitura por usuário: audience=ALL não faz fan-out, então "não-lido" = ausência de linha aqui.
CREATE TABLE notification_reads (
    id              BIGSERIAL PRIMARY KEY,
    notification_id BIGINT NOT NULL REFERENCES notifications(id),
    user_id         UUID   NOT NULL REFERENCES tb_user(uuid),
    read_at         TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT uq_notification_read UNIQUE (notification_id, user_id)
);
CREATE INDEX idx_notification_reads_user ON notification_reads(user_id);

-- Campanhas recorrentes agendadas pelo admin; o scheduler dispara quando vence o intervalo.
CREATE TABLE notification_schedules (
    id               BIGSERIAL PRIMARY KEY,
    title            VARCHAR(255) NOT NULL,
    body             TEXT,
    image_url        VARCHAR(1024),
    click_url        VARCHAR(1024),
    audience         VARCHAR(20) NOT NULL,
    type             VARCHAR(20) NOT NULL,
    interval_seconds INT NOT NULL,
    active           BOOLEAN NOT NULL DEFAULT TRUE,
    last_fired_at    TIMESTAMP WITHOUT TIME ZONE,
    created_by       UUID REFERENCES tb_user(uuid),
    created_at       TIMESTAMP WITHOUT TIME ZONE
);
