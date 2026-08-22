export type ContainerType = {
    id: number;
    code: string;
    name: string;
    description: string;
    lengthMeters: number;
    widthMeters: number;
    heightMeters: number;
    volumeCBM: number;
    maxGrossWeightKG: number;
    tareWeightKG: number;
    maxPayloadKG: number;
    isActive: boolean;
    isRefrigerated: boolean;
};

export type InternalDimensionsMeters = {
    length: number;
    width: number;
    height: number;
};

export type CustomerContainerOption = {
    id: number;
    code: string;
    name: string;
    internalDimensionsMeters: InternalDimensionsMeters | null;
    capacityCbm: number | null;
    maximumCargoWeightKg: number | null;
};
