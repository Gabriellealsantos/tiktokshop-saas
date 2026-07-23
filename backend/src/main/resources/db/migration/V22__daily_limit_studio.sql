-- V22__daily_limit_studio.sql
INSERT INTO daily_limits (flow_type, max_per_day, max_regenerations, updated_at)
VALUES ('STUDIO', 3, 2, now());