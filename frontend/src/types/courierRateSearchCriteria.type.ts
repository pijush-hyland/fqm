import type { SeaFreightMode, ShippingType } from "./courierRate.type";

export type CourierRateSearchCriteria = {
    courierName: string;
    shippingType: ShippingType;
    seaFreightMode: SeaFreightMode;

    // Location filters
    origin: string;           // Search in origin location
    destination: string;      // Search in destination location
    originId: number;        // Specific origin location ID
    destinationId: number;   // Specific destination location ID

    // Date filters
    activeOnDate: Date;        // Rate must be active on this date
    effectiveFromAfter: Date;  // Rates starting from this date
    effectiveToBefore: Date;   // Rates ending before this date

    // Additional filters
    containerTypeId: number;     // For FCL rates
    maxTransitDays: number;   // Maximum transit days
    description: string;       // Partial match in description
    isActive: boolean;         // Filter by active/inactive status
    
    // Special flags
    currentlyActive: boolean;  // Filter only currently active rates

    // Pagination and sorting
    page: number;
    size: number;
    sortBy: string;
    sortDirection: string;
}