export type AdministrationContainerOption = {
    id: number;
    code: string;
    name: string;
    description: string;
    internalDimensionsMeters: InternalDimensionsMeters | null;
    capacityCbm: number | null;
    tareWeightKg: number | null;
    maximumCargoWeightKg: number | null;
    maximumTotalWeightKg: number | null;
    active: boolean;
    refrigerated: boolean;
    displayOrder: number | null;
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
    active?: boolean;
};
