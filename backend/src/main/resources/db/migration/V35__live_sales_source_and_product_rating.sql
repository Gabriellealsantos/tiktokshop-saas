ALTER TABLE live_sales_config
ADD COLUMN category_id BIGINT,
ADD COLUMN source_type VARCHAR(50) NOT NULL DEFAULT 'RANDOM';

CREATE TABLE live_sales_config_products (
    config_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    PRIMARY KEY (config_id, product_id),
    CONSTRAINT fk_live_sales_config FOREIGN KEY (config_id) REFERENCES live_sales_config(id) ON DELETE CASCADE,
    CONSTRAINT fk_live_sales_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

ALTER TABLE products
ADD COLUMN rating NUMERIC(3,1),
ADD COLUMN reviews_count INTEGER;
