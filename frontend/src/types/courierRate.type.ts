import type { Location } from "./location.type";

export type courierRate = {
    id?: number,
    courierName: string,
    origin: Location,
    destination: Location,
    shippingType: ShippingType,
    seaFreightMode?: SeaFreightMode,
    effectiveFrom: Date,
    effectiveTo: Date,

    isActive: boolean,

    transitDays?: number,
    weightLimit?: number,
    dimensionLimit?: number,
    description?: string,
    createdAt?: Date,
    updatedAt?: Date,

    rate?: number,
    ratesForFCL?: { [containerTypeId: number]: number };

    currency?: string,
    
    documentationFee?: number,
    bunkerAdjustmentRate?: number,

    minimumCharge?: number,
    fuelSurcharge?: number,
    securitySurcharge?: number,
    airWeightLimit?: number,
    airDescription?: string,

    lclServiceCharge?: number,

    terminalHandlingCharge?: number,
}

export type CourierRatePayload = Omit<courierRate, 'origin' | 'destination'> & {
    origin: { id: number };
    destination: { id: number };
};

export type ShippingType = 'AIR' | 'WATER';
export type SeaFreightMode = 'FCL' | 'LCL';