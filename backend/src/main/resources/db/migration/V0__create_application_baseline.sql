CREATE TABLE locations (
    id BIGINT NOT NULL AUTO_INCREMENT,
    code VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    country_code VARCHAR(3),
    type ENUM ('AIRPORT', 'CITY', 'INLAND_PORT', 'SEA_PORT'),
    is_active BIT,
    PRIMARY KEY (id),
    UNIQUE KEY uk_locations_code (code)
) ENGINE = InnoDB;

CREATE TABLE air_freight_rates (
    id BIGINT NOT NULL AUTO_INCREMENT,
    rate DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3),
    fuel_surcharge_rate DECIMAL(5,4),
    security_surcharge DECIMAL(10,2),
    minimum_charge DECIMAL(10,2),
    weight_limit DOUBLE,
    description VARCHAR(500),
    PRIMARY KEY (id)
) ENGINE = InnoDB;

CREATE TABLE lcl_freight_rates (
    id BIGINT NOT NULL AUTO_INCREMENT,
    rate DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3),
    documentation_fee DECIMAL(10,2),
    bunker_adjustment_rate DECIMAL(5,4),
    lcl_service_charge DECIMAL(10,2),
    description VARCHAR(500),
    PRIMARY KEY (id)
) ENGINE = InnoDB;

CREATE TABLE container_types (
    id BIGINT NOT NULL AUTO_INCREMENT,
    code VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    length_meters DECIMAL(5,2) NOT NULL,
    width_meters DECIMAL(5,2) NOT NULL,
    height_meters DECIMAL(5,2) NOT NULL,
    volumecbm DECIMAL(8,3) NOT NULL,
    max_gross_weight_kg DECIMAL(8,2) NOT NULL,
    tare_weight_kg DECIMAL(8,2) NOT NULL,
    max_payload_kg DECIMAL(8,2) NOT NULL,
    is_active BIT,
    is_refrigerated BIT,
    PRIMARY KEY (id),
    UNIQUE KEY uk_container_types_code (code)
) ENGINE = InnoDB;

CREATE TABLE courier_rates (
    id BIGINT NOT NULL AUTO_INCREMENT,
    courier_name VARCHAR(255) NOT NULL,
    shipping_type ENUM ('AIR', 'WATER') NOT NULL,
    sea_freight_mode ENUM ('FCL', 'LCL'),
    origin_location_id BIGINT NOT NULL,
    destination_location_id BIGINT NOT NULL,
    air_freight_details_id BIGINT,
    lcl_freight_details_id BIGINT,
    effective_from DATE NOT NULL,
    effective_to DATE NOT NULL,
    is_active BIT NOT NULL,
    transit_days INT,
    weight_limit DOUBLE,
    dimension_limit VARCHAR(255),
    description VARCHAR(500),
    created_at DATE,
    updated_at DATE,
    PRIMARY KEY (id),
    UNIQUE KEY uk_courier_air_details (air_freight_details_id),
    UNIQUE KEY uk_courier_lcl_details (lcl_freight_details_id),
    CONSTRAINT fk_courier_origin FOREIGN KEY (origin_location_id) REFERENCES locations (id),
    CONSTRAINT fk_courier_destination FOREIGN KEY (destination_location_id) REFERENCES locations (id),
    CONSTRAINT fk_courier_air FOREIGN KEY (air_freight_details_id) REFERENCES air_freight_rates (id),
    CONSTRAINT fk_courier_lcl FOREIGN KEY (lcl_freight_details_id) REFERENCES lcl_freight_rates (id)
) ENGINE = InnoDB;

CREATE TABLE fcl_freight_rates (
    id BIGINT NOT NULL AUTO_INCREMENT,
    rate DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3),
    documentation_fee DECIMAL(10,2),
    bunker_adjustment_rate DECIMAL(5,4),
    description VARCHAR(500),
    container_type_id BIGINT,
    terminal_handling_charge DECIMAL(10,2),
    courier_rate_id BIGINT,
    PRIMARY KEY (id),
    CONSTRAINT fk_fcl_container_type FOREIGN KEY (container_type_id) REFERENCES container_types (id),
    CONSTRAINT fk_fcl_courier_rate FOREIGN KEY (courier_rate_id) REFERENCES courier_rates (id)
) ENGINE = InnoDB;

INSERT INTO container_types
    (code, name, description, length_meters, width_meters, height_meters, volumecbm,
     max_gross_weight_kg, tare_weight_kg, max_payload_kg, is_active, is_refrigerated)
VALUES
    ('20GP', '20ft General Purpose', 'Standard 20-foot dry container for general cargo', 5.90, 2.35, 2.39, 33.13, 30480, 2230, 28250, 1, 0),
    ('20HC', '20ft High Cube', '20-foot high cube container with extra height', 5.90, 2.35, 2.69, 37.30, 30480, 2230, 28250, 1, 0),
    ('40GP', '40ft General Purpose', 'Standard 40-foot dry container for general cargo', 12.03, 2.35, 2.39, 67.59, 30480, 3740, 26740, 1, 0),
    ('40HC', '40ft High Cube', '40-foot high cube container with extra height', 12.03, 2.35, 2.69, 76.06, 30480, 3740, 26740, 1, 0),
    ('20RF', '20ft Refrigerated', '20-foot refrigerated container for temperature-controlled cargo', 5.44, 2.29, 2.27, 28.28, 30480, 3080, 27400, 1, 1),
    ('40RF', '40ft Refrigerated', '40-foot refrigerated container for temperature-controlled cargo', 11.56, 2.29, 2.27, 60.07, 30480, 4800, 25680, 1, 1),
    ('40RH', '40ft Refrigerated High Cube', '40-foot refrigerated high cube container', 11.56, 2.29, 2.57, 68.01, 30480, 4800, 25680, 1, 1),
    ('20OT', '20ft Open Top', '20-foot open top container for oversized cargo', 5.90, 2.35, 2.39, 33.13, 30480, 2300, 28180, 1, 0),
    ('40OT', '40ft Open Top', '40-foot open top container for oversized cargo', 12.03, 2.35, 2.39, 67.59, 30480, 3900, 26580, 1, 0),
    ('20FR', '20ft Flat Rack', '20-foot flat rack container for heavy or oversized cargo', 5.90, 2.35, 2.39, 33.13, 45000, 2360, 42640, 1, 0),
    ('40FR', '40ft Flat Rack', '40-foot flat rack container for heavy or oversized cargo', 12.03, 2.35, 2.39, 67.59, 45000, 5000, 40000, 1, 0);