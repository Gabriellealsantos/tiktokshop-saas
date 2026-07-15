ALTER TABLE avatars
    ADD COLUMN generation_id BIGINT REFERENCES image_generations(id),
    ADD CONSTRAINT uq_avatar_generation UNIQUE (generation_id);

CREATE INDEX idx_avatars_user_created ON avatars (user_id, created_at DESC);