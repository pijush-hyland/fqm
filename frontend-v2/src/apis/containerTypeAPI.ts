import type { ContainerType } from "../types/container.type";
import { api } from "./api";

const CONTAINER_TYPE_BASE_URL = '/container-types';

export const CONTAINER_TYPE_URL = {
    getAll: `${CONTAINER_TYPE_BASE_URL}`,
    getById: `${CONTAINER_TYPE_BASE_URL}/types/:id`,
    getByCode: `${CONTAINER_TYPE_BASE_URL}/code/:code`,
    getSuitableContainerTypes: `${CONTAINER_TYPE_BASE_URL}/suitable`,
    create: `${CONTAINER_TYPE_BASE_URL}`,
    update: `${CONTAINER_TYPE_BASE_URL}/:id`,
    delete: `${CONTAINER_TYPE_BASE_URL}/:id`,
    calculateVolumeWeight: `${CONTAINER_TYPE_BASE_URL}/volume-weight`,
    calculateChargeableWeight: `${CONTAINER_TYPE_BASE_URL}/chargeable-weight`
};

const containerTypeAPI = {
    getAll: () => api.get(CONTAINER_TYPE_URL.getAll),
    getById: (id: string) => api.get(CONTAINER_TYPE_URL.getById.replace(":id", id)),
    getByCode: (code: string) => api.get(CONTAINER_TYPE_URL.getByCode.replace(":code", code)),
    getSuitableContainerTypes: (weightKG: number, volumeCBM: number) =>
        api.get(`${CONTAINER_TYPE_URL.getSuitableContainerTypes}?weightKG=${weightKG}&volumeCBM=${volumeCBM}`),

    create: (data: ContainerType) => api.post(CONTAINER_TYPE_URL.create, data),
    update: (id: string, data: ContainerType) => api.put(CONTAINER_TYPE_URL.update.replace(":id", id), data),
    delete: (id: string) => api.delete(CONTAINER_TYPE_URL.delete.replace(":id", id)),

    calculateVolumeWeight: (volumeCBM: number, volumetricFactor: number) =>
        api.post(`${CONTAINER_TYPE_URL.calculateVolumeWeight}?volumeCBM=${volumeCBM}&volumetricFactor=${volumetricFactor}`),
    calculateChargeableWeight: (grossWeightKG: number, volumeWeightKG: number) =>
        api.post(`${CONTAINER_TYPE_URL.calculateChargeableWeight}?grossWeightKG=${grossWeightKG}&volumeWeightKG=${volumeWeightKG}`)
};

export default containerTypeAPI;