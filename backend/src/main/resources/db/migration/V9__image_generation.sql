CREATE TABLE daily_limits (
  flow_type         VARCHAR(30) PRIMARY KEY,
  max_per_day       INTEGER NOT NULL,
  max_regenerations INTEGER NOT NULL,
  updated_at        TIMESTAMP WITHOUT TIME ZONE
);

INSERT INTO daily_limits (flow_type, max_per_day, max_regenerations, updated_at) VALUES('AVATAR',      1, 1, now()),('VIRAL_MODEL', 5, 3, now());

CREATE TABLE image_generations (
   id         BIGSERIAL PRIMARY KEY,
   user_id    UUID NOT NULL REFERENCES tb_user(uuid),
   flow_type  VARCHAR(30) NOT NULL,
   status     VARCHAR(20) NOT NULL,
   parent_id  BIGINT REFERENCES image_generations(id),
   config     JSONB,
   prompt     TEXT,
   image_url  VARCHAR(1024),
   error      TEXT,
   created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE INDEX idx_image_gen_user_flow_created ON image_generations (user_id, flow_type, created_at);
CREATE INDEX idx_image_gen_parent ON image_generations (parent_id);