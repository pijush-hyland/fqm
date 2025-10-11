-- Sample data for Freight Quote Management System
-- Run this after the application has created the database schema

USE freight_quote_db;

-- Insert sample courier rates with multiple couriers
INSERT INTO courier_rates (courier_name, origin, destination, shipping_type, container_type, cost, currency, effective_from, effective_to, description, transit_days, weight_limit, dimension_limit, created_at, updated_at) VALUES

-- Air shipping rates - Multiple couriers
('DHL Express', 'New York, USA', 'London, UK', 'AIR', NULL, 2500.00, 'INR', '2024-01-01', '2024-12-31', 'Express air freight service', 3, 68.0, '120x80x80 cm', CURDATE(), CURDATE()),
('FedEx International', 'New York, USA', 'London, UK', 'AIR', NULL, 2650.00, 'INR', '2024-01-01', '2024-12-31', 'Premium air express', 2, 68.0, '119x80x80 cm', CURDATE(), CURDATE()),
('UPS Worldwide Express', 'New York, USA', 'London, UK', 'AIR', NULL, 2400.00, 'INR', '2024-01-01', '2024-12-31', 'Worldwide express service', 4, 70.0, '120x80x80 cm', CURDATE(), CURDATE()),

('DHL Express', 'Los Angeles, USA', 'Tokyo, Japan', 'AIR', NULL, 3200.00, 'INR', '2024-01-01', '2024-12-31', 'Trans-Pacific air cargo', 4, 68.0, '120x80x80 cm', CURDATE(), CURDATE()),
('FedEx International', 'Los Angeles, USA', 'Tokyo, Japan', 'AIR', NULL, 3100.00, 'INR', '2024-01-01', '2024-12-31', 'Pacific express route', 3, 68.0, '119x80x80 cm', CURDATE(), CURDATE()),
('UPS Worldwide Express', 'Los Angeles, USA', 'Tokyo, Japan', 'AIR', NULL, 3350.00, 'INR', '2024-01-01', '2024-12-31', 'Premium Pacific service', 5, 70.0, '120x80x80 cm', CURDATE(), CURDATE()),

('Lufthansa Cargo', 'Chicago, USA', 'Frankfurt, Germany', 'AIR', NULL, 2800.00, 'INR', '2024-01-01', '2024-12-31', 'Transatlantic air freight', 3, 100.0, '150x100x100 cm', CURDATE(), CURDATE()),
('Air France Cargo', 'Chicago, USA', 'Frankfurt, Germany', 'AIR', NULL, 2750.00, 'INR', '2024-01-01', '2024-12-31', 'European air express', 4, 80.0, '140x90x90 cm', CURDATE(), CURDATE()),

('American Airlines Cargo', 'Miami, USA', 'São Paulo, Brazil', 'AIR', NULL, 2100.00, 'INR', '2024-01-01', '2024-12-31', 'South American air route', 5, 50.0, '100x80x60 cm', CURDATE(), CURDATE()),
('LATAM Cargo', 'Miami, USA', 'São Paulo, Brazil', 'AIR', NULL, 1950.00, 'INR', '2024-01-01', '2024-12-31', 'Regional Latin America service', 4, 60.0, '110x80x70 cm', CURDATE(), CURDATE()),

-- Water shipping rates - FCL (Full Container Load) - Multiple shipping lines
('Maersk Line', 'Los Angeles, USA', 'Shanghai, China', 'WATER', 'FCL', 4500.00, 'INR', '2024-01-01', '2024-12-31', '20ft FCL container to China', 15, 22000.0, '6x2.4x2.4 m', CURDATE(), CURDATE()),
('COSCO Shipping', 'Los Angeles, USA', 'Shanghai, China', 'WATER', 'FCL', 4200.00, 'INR', '2024-01-01', '2024-12-31', 'Competitive FCL service', 18, 22000.0, '6x2.4x2.4 m', CURDATE(), CURDATE()),
('MSC Mediterranean', 'Los Angeles, USA', 'Shanghai, China', 'WATER', 'FCL', 4350.00, 'INR', '2024-01-01', '2024-12-31', 'Reliable trans-Pacific route', 16, 22000.0, '6x2.4x2.4 m', CURDATE(), CURDATE()),

('Maersk Line', 'New York, USA', 'Rotterdam, Netherlands', 'WATER', 'FCL', 3800.00, 'INR', '2024-01-01', '2024-12-31', '40ft FCL container to Europe', 12, 26500.0, '12x2.4x2.6 m', CURDATE(), CURDATE()),
('Hapag-Lloyd', 'New York, USA', 'Rotterdam, Netherlands', 'WATER', 'FCL', 3650.00, 'INR', '2024-01-01', '2024-12-31', 'European express route', 11, 26500.0, '12x2.4x2.6 m', CURDATE(), CURDATE()),
('CMA CGM', 'New York, USA', 'Rotterdam, Netherlands', 'WATER', 'FCL', 3900.00, 'INR', '2024-01-01', '2024-12-31', 'Premium Atlantic service', 13, 26500.0, '12x2.4x2.6 m', CURDATE(), CURDATE()),

('Evergreen Marine', 'Houston, USA', 'Hamburg, Germany', 'WATER', 'FCL', 4200.00, 'INR', '2024-01-01', '2024-12-31', 'Transatlantic FCL shipping', 14, 26500.0, '12x2.4x2.6 m', CURDATE(), CURDATE()),
('Yang Ming Marine', 'Long Beach, USA', 'Yokohama, Japan', 'WATER', 'FCL', 3900.00, 'INR', '2024-01-01', '2024-12-31', 'Pacific FCL route', 13, 22000.0, '6x2.4x2.4 m', CURDATE(), CURDATE()),

-- Water shipping rates - LCL (Less than Container Load) - Multiple forwarders
('DB Schenker', 'Los Angeles, USA', 'Shanghai, China', 'WATER', 'LCL', 850.00, 'INR', '2024-01-01', '2024-12-31', 'LCL service to China', 20, 1000.0, '2x2x2 m', CURDATE(), CURDATE()),
('Kuehne + Nagel', 'Los Angeles, USA', 'Shanghai, China', 'WATER', 'LCL', 780.00, 'INR', '2024-01-01', '2024-12-31', 'Efficient LCL consolidation', 22, 1200.0, '2.5x2x2 m', CURDATE(), CURDATE()),
('DHL Global Forwarding', 'Los Angeles, USA', 'Shanghai, China', 'WATER', 'LCL', 820.00, 'INR', '2024-01-01', '2024-12-31', 'Reliable LCL service', 19, 1000.0, '2x2x2 m', CURDATE(), CURDATE()),

('DB Schenker', 'New York, USA', 'Rotterdam, Netherlands', 'WATER', 'LCL', 720.00, 'INR', '2024-01-01', '2024-12-31', 'LCL service to Europe', 16, 1000.0, '2x2x2 m', CURDATE(), CURDATE()),
('Expeditors', 'New York, USA', 'Rotterdam, Netherlands', 'WATER', 'LCL', 690.00, 'INR', '2024-01-01', '2024-12-31', 'Cost-effective LCL', 18, 1200.0, '2.5x2x2 m', CURDATE(), CURDATE()),
('Panalpina (DSV)', 'New York, USA', 'Rotterdam, Netherlands', 'WATER', 'LCL', 750.00, 'INR', '2024-01-01', '2024-12-31', 'Premium LCL service', 15, 1000.0, '2x2x2 m', CURDATE(), CURDATE()),

('Geodis', 'Houston, USA', 'Hamburg, Germany', 'WATER', 'LCL', 780.00, 'INR', '2024-01-01', '2024-12-31', 'Transatlantic LCL', 17, 1000.0, '2x2x2 m', CURDATE(), CURDATE()),
('C.H. Robinson', 'Miami, USA', 'Santos, Brazil', 'WATER', 'LCL', 650.00, 'INR', '2024-01-01', '2024-12-31', 'South American LCL', 14, 800.0, '1.8x1.8x1.8 m', CURDATE(), CURDATE()),

-- Additional routes with budget-friendly options
('TNT Express', 'Dallas, USA', 'Dubai, UAE', 'AIR', NULL, 2900.00, 'INR', '2024-06-01', '2024-12-31', 'Middle East air cargo', 5, 68.0, '120x80x80 cm', CURDATE(), CURDATE()),
('Emirates SkyCargo', 'Dallas, USA', 'Dubai, UAE', 'AIR', NULL, 3100.00, 'INR', '2024-06-01', '2024-12-31', 'Premium Middle East service', 3, 100.0, '150x100x100 cm', CURDATE(), CURDATE()),

('Qantas Freight', 'Boston, USA', 'Melbourne, Australia', 'AIR', NULL, 4200.00, 'INR', '2024-03-01', '2024-11-30', 'Australia air freight', 7, 68.0, '120x80x80 cm', CURDATE(), CURDATE()),

-- Budget options
('Budget Air Cargo', 'Seattle, USA', 'Mumbai, India', 'AIR', NULL, 2800.00, 'INR', '2024-01-01', '2024-12-31', 'Economy air service to India', 6, 50.0, '100x70x70 cm', CURDATE(), CURDATE()),
('Westwood Shipping', 'Portland, USA', 'Vancouver, Canada', 'WATER', 'FCL', 1200.00, 'INR', '2024-01-01', '2024-12-31', 'Canada FCL service', 3, 22000.0, '6x2.4x2.4 m', CURDATE(), CURDATE()),
('Regional LCL Services', 'Norfolk, USA', 'Le Havre, France', 'WATER', 'LCL', 690.00, 'INR', '2024-02-01', '2024-10-31', 'French LCL route', 16, 1000.0, '2x2x2 m', CURDATE(), CURDATE()),

-- Expired rate (for testing)
('Old Express Co', 'Phoenix, USA', 'Mexico City, Mexico', 'AIR', NULL, 1800.00, 'INR', '2023-01-01', '2023-12-31', 'Expired Mexican route', 4, 50.0, '100x60x60 cm', CURDATE(), CURDATE()),

-- Future rate (for testing)
('Future Logistics', 'Atlanta, USA', 'Lagos, Nigeria', 'WATER', 'FCL', 5200.00, 'INR', '2025-01-01', '2025-12-31', 'Future African route', 21, 22000.0, '6x2.4x2.4 m', CURDATE(), CURDATE());

-- Verify the data
SELECT 
    origin, 
    destination, 
    shipping_type, 
    container_type, 
    cost, 
    currency,
    effective_from,
    effective_to,
    CASE 
        WHEN CURDATE() < effective_from THEN 'Future'
        WHEN CURDATE() > effective_to THEN 'Expired'
        ELSE 'Active'
    END as status
FROM courier_rates
ORDER BY shipping_type, container_type, origin;
