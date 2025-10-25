import type { SeaFreightMode, ShippingType } from "./courierRate.type";

export type QuoteRequirement = {
    origin: number;           // Origin location
    destination: number;      // Destination location
    shippingType: ShippingType;     // e.g., "Air", "Sea", "Land"
    seaFreightMode?: SeaFreightMode;  // e.g., "FCL", "LCL" (optional, relevant for sea freight)
    shippingDate: Date;    // Desired shipping date
    numberOfPackages: number; // Total number of packages
    grossWeightKG: number;   // Total gross weight in kilograms
    volumeCBM: number;       // Total volume in cubic meters
    numberOfContainers?: number; // Number of containers (optional, relevant for FCL)
    maxTransitDays?: number; // Maximum acceptable transit days (optional)
    containerTypes?: number
    containerCount?: { [containerType: number]: number }; // e.g., { 20: 2, 40: 1 } (optional, relevant for FCL)

    cargoTypeCategory: string; // e.g., "Electronics", "Furniture"
    cargoType: string; // e.g., "Fragile", "Non-Fragile"
};