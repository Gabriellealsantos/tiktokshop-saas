CREATE TABLE creation_sessions (
   id         BIGSERIAL PRIMARY KEY,
   user_id    UUID NOT NULL REFERENCES tb_user(uuid),
   product_id BIGINT REFERENCES products(id),
   format     VARCHAR(20) NOT NULL,
   status     VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
   config     JSONB NOT NULL DEFAULT '{}',
   created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
   updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE INDEX idx_creation_sessions_user ON creation_sessions (user_id, created_at DESC);