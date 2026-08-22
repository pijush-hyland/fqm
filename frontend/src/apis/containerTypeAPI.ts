import type { AdministrationContainerOption, CustomerContainerOption } from "../types/container.type";
import { api } from "./api";

const CONTAINER_TYPE_BASE_URL = '/container-types';

export const CONTAINER_TYPE_URL = {
    getAdministrationOptions: `${CONTAINER_TYPE_BASE_URL}`,
    getCustomerOptions: `${CONTAINER_TYPE_BASE_URL}/customer`
};

const containerTypeAPI = {
    getAdministrationOptions: () => api.get<AdministrationContainerOption[]>(CONTAINER_TYPE_URL.getAdministrationOptions),
    getCustomerOptions: () => api.get<CustomerContainerOption[]>(CONTAINER_TYPE_URL.getCustomerOptions)
};

export default containerTypeAPI;