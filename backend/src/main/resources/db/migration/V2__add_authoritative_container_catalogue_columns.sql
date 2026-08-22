ALTER TABLE container_types
    MODIFY length_meters DECIMAL(8,3) NULL,
    MODIFY width_meters DECIMAL(8,3) NULL,
    MODIFY height_meters DECIMAL(8,3) NULL,
    MODIFY volumecbm DECIMAL(10,2) NULL,
    MODIFY max_gross_weight_kg DECIMAL(10,2) NULL,
    MODIFY tare_weight_kg DECIMAL(10,2) NULL,
    MODIFY max_payload_kg DECIMAL(10,2) NULL,
    ADD COLUMN internal_length_meters DECIMAL(8,3) NULL,
    ADD COLUMN internal_width_meters DECIMAL(8,3) NULL,
    ADD COLUMN internal_height_meters DECIMAL(8,3) NULL,
    ADD COLUMN capacity_cbm DECIMAL(10,2) NULL,
    ADD COLUMN maximum_cargo_weight_kg DECIMAL(10,2) NULL,
    ADD COLUMN maximum_total_weight_kg DECIMAL(10,2) NULL,
    ADD COLUMN display_order INT NULL,
    ADD CONSTRAINT chk_container_internal_dimensions CHECK (
        ((internal_length_meters IS NULL) + (internal_width_meters IS NULL)
            + (internal_height_meters IS NULL)) IN (0, 3)
        AND (internal_length_meters IS NULL OR internal_length_meters > 0)
        AND (internal_width_meters IS NULL OR internal_width_meters > 0)
        AND (internal_height_meters IS NULL OR internal_height_meters > 0)
    ),
    ADD CONSTRAINT chk_container_capacity CHECK (capacity_cbm IS NULL OR capacity_cbm > 0),
    ADD CONSTRAINT chk_container_cargo_weight CHECK (
        maximum_cargo_weight_kg IS NULL OR maximum_cargo_weight_kg > 0
    ),
    ADD CONSTRAINT chk_container_tare_weight CHECK (tare_weight_kg IS NULL OR tare_weight_kg > 0),
    ADD CONSTRAINT chk_container_total_weight CHECK (
        maximum_total_weight_kg IS NULL
        OR (maximum_total_weight_kg > 0 AND maximum_total_weight_kg >= maximum_cargo_weight_kg)
    ),
    ADD CONSTRAINT uk_container_display_order UNIQUE (display_order);