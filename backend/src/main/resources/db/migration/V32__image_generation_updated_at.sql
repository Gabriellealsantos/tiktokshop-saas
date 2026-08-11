ALTER TABLE image_generations
    ADD COLUMN updated_at TIMESTAMP WITHOUT TIME ZONE;

UPDATE image_generations SET updated_at = created_at WHERE updated_at IS NULL;