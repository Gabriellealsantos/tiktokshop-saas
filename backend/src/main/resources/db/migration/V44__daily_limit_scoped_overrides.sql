-- Limite diário deixa de ser só global: passa a resolver em 3 níveis, do mais
-- específico para o mais amplo — usuário > papel > padrão global (daily_limits).
-- Cada override é um "ilimitado" booleano; quem não tem override cai no número
-- configurado em daily_limits para o fluxo.

CREATE TABLE daily_limit_role_overrides (
    id          BIGSERIAL PRIMARY KEY,
    flow_type   VARCHAR(30) NOT NULL,
    role_id     BIGINT      NOT NULL REFERENCES tb_role(id) ON DELETE CASCADE,
    unlimited   BOOLEAN     NOT NULL DEFAULT FALSE,
    updated_at  TIMESTAMP WITHOUT TIME ZONE,
    updated_by  UUID REFERENCES tb_user(uuid),
    CONSTRAINT uk_role_override_flow_role UNIQUE (flow_type, role_id)
);

CREATE TABLE daily_limit_user_overrides (
    id          BIGSERIAL PRIMARY KEY,
    flow_type   VARCHAR(30) NOT NULL,
    user_id     UUID        NOT NULL REFERENCES tb_user(uuid) ON DELETE CASCADE,
    unlimited   BOOLEAN     NOT NULL DEFAULT FALSE,
    updated_at  TIMESTAMP WITHOUT TIME ZONE,
    updated_by  UUID REFERENCES tb_user(uuid),
    CONSTRAINT uk_user_override_flow_user UNIQUE (flow_type, user_id)
);

-- Hot path: a checagem roda a cada geração, sempre filtrando por dono + fluxo.
CREATE INDEX idx_user_override_user_flow ON daily_limit_user_overrides (user_id, flow_type);
CREATE INDEX idx_role_override_flow ON daily_limit_role_overrides (flow_type);

-- Default: ADM não gasta cota (usa a plataforma pra testar/dar suporte).
-- Afiliado e cliente ficam no limite global até o admin liberar na tela.
INSERT INTO daily_limit_role_overrides (flow_type, role_id, unlimited, updated_at)
SELECT d.flow_type, r.id, TRUE, now()
FROM daily_limits d
CROSS JOIN tb_role r
WHERE r.authority = 'ROLE_ADMIN';
