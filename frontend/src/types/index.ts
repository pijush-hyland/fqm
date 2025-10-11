// Location types
export interface Location {
  id?: number;
  name: string;
  locationCode: string;
  country: string;
  countryCode?: string;
  portCode?: string;
  locationType: LocationType;
  isActive: boolean;
}

export type LocationType = 'SEA_PORT' | 'AIRPORT' | 'CITY' | 'INLAND_PORT';

// Container types
export interface ContainerType {
  id?: number;
  code: string;
  name: string;
  description?: string;
  lengthMeters: number;
  widthMeters: number;
  heightMeters: number;
  volumeCBM: number;
  maxGrossWeightKG: number;
  tareWeightKG: number;
  maxPayloadKG: number;
  isActive: boolean;
  isRefrigerated: boolean;
}

// Common types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

export interface LocationTypeInfo {
  value: LocationType;
  label: string;
  icon: string;
}

// Component prop types
export interface LocationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  locationType?: LocationType | null;
  required?: boolean;
  error?: string | null;
}

export interface ContainerTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  weight?: number;
  volume?: number;
  placeholder?: string;
  required?: boolean;
  error?: string | null;
  weightKG?: number | null;
  volumeCBM?: number | null;
  showSuitableOnly?: boolean;
}

// Courier Rate interface - Exactly matches backend CourierRateDto
export interface CourierRate {
  // CourierRate entity fields
  id?: number;
  courierName: string;
  origin: Location;           // Location object, not string
  destination: Location;      // Location object, not string
  shippingType: ShippingType;
  seaFreightMode?: SeaFreightMode;
  effectiveFrom: string;      // LocalDate as ISO string
  effectiveTo: string;        // LocalDate as ISO string
  isActive?: boolean;         // Default to true
  transitDays?: number;
  weightLimit?: number;       // in KG
  dimensionLimit?: string;    // e.g., "100x100x100 cm"
  description?: string;
  createdAt?: string;         // LocalDate as ISO string
  updatedAt?: string;         // LocalDate as ISO string
  
  // Rate fields (from base Rate class)
  rate: number;               // BigDecimal as number - required
  currency: string;           // Default "INR"
  
  // SeaFreightRate fields (for WATER shipping)
  documentationFee?: number;
  bunkerAdjustmentRate?: number;
  
  // AirFreightRate fields (for AIR shipping)
  minimumCharge?: number;
  fuelSurchargeRate?: number;
  securitySurcharge?: number;
  airWeightLimit?: number;
  airDescription?: string;
  
  // LCLFreightRate fields (for WATER + LCL)
  lclServiceCharge?: number;
  
  // FCLFreightRate fields (for WATER + FCL)
  containerType?: ContainerType;
  terminalHandlingCharge?: number;
}

// Shipping types - Aligned with backend ENUMs
export type ShippingType = 'AIR' | 'WATER';
export type SeaFreightMode = 'FCL' | 'LCL';

// API data interface - exactly matching backend ShippingRequirementDto
export interface ShippingRequirement {
  // 1. Shipment Details (General)
  origin?: number;                    // @NotBlank Long - location ID
  destination?: number;               // @NotBlank Long - location ID  
  shippingType?: ShippingType;       // matches backend ShippingType ENUM
  seaFreightMode?: SeaFreightMode;   // SeaFreightMode enum - matches backend
  shippingDate?: string;              // @NotNull LocalDate as ISO string - matches backend
  
  // 2. Cargo Dimensions & Weight
  numberOfPackages?: number;          // @Positive Integer - matches backend
  grossWeightKG?: number;             // @Positive Double - matches backend
  volumeCBM?: number;                // Double for sea freight - matches backend
  
  // 3. Container Details (FCL)
  numberOfContainers?: number;       // Integer - matches backend
  containerTypes?: number[];         // List<Long> container type IDs - matches backend
  containerCount?: number;           // Double - matches backend
  
  // Optional constraints
  maxTransitDays?: number;           // Integer - matches backend
}

// Component prop types for filters and tables
export interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
  filters: FilterState;
}

export interface FilterState {
  shippingType: string;
  containerType: string;
  origin: string;
  destination: string;
}

export interface CourierRateTableProps {
  rates: CourierRate[];
  onEdit?: (rate: CourierRate) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}
