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
