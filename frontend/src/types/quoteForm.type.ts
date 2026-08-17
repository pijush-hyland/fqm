import type { ShippingType, SeaFreightMode } from './courierRate.type';

export const QUOTE_REMARKS_MAX_LENGTH = 1000;

export interface QuoteFormData {
	origin: number | null;
	destination: number | null;
	shippingType: ShippingType | '';
	seaFreightMode: SeaFreightMode | '';
	shippingDate: string;
	numberOfPackages: number | '';
	grossWeightKG: number | '';
	volumeCBM: number | '';
	maxTransitDays: number | '';
	containerCount: { [containerType: number]: number };

	cargoTypeCategory: string;
	cargoType: string;
	remarks: string;
}

export interface QuoteFormErrors {
	origin?: string;
	destination?: string;
	shippingType?: string;
	seaFreightMode?: string;
	shippingDate?: string;
	numberOfPackages?: string;
	grossWeightKG?: string;
	volumeCBM?: string;
	containerCount?: string;
	maxTransitDays?: string;
	cargoTypeCategory?: string;
	cargoType?: string;
	remarks?: string;
}
