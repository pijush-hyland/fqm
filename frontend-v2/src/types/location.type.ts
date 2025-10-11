export type Location = {
    id: number,
    name: string,
    code: string,
    country: string,
    countryCode: string,
    type: LocationType,
    isActive: boolean,
};

export type LocationType = 'SEA_PORT' | 'AIRPORT' | 'CITY' | 'INLAND_PORT';