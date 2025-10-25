import type { CourierRatePayload, SeaFreightMode, ShippingType } from "../types/courierRate.type";
import type { CourierRateSearchCriteria } from "../types/courierRateSearchCriteria.type";
import { api } from "./api";

const COURIER_RATE_BASE_URL = "/courier-rates";

export const COURIER_RATE_URL = {
  getAllRates: `${COURIER_RATE_BASE_URL}`,
  getRateById: `${COURIER_RATE_BASE_URL}/:id`,
  createRate: `${COURIER_RATE_BASE_URL}`,
  updateRate: `${COURIER_RATE_BASE_URL}/:id`,
  deleteRate: `${COURIER_RATE_BASE_URL}/:id`,
  getActiveRates: `${COURIER_RATE_BASE_URL}/active`,
  searchRates: `${COURIER_RATE_BASE_URL}/search`,

  getRatesByShippingType: `${COURIER_RATE_BASE_URL}/shipping-type/:type`,
  getRatesByShippingTypeAndSeaFreightMode: `${COURIER_RATE_BASE_URL}/shipping-type/:type/sea-freight-mode/:mode`,
  searchRatesAdvanced: `${COURIER_RATE_BASE_URL}/search-advanced`
};

const courierRateAPI = {
  getAllRates: () => api.get(COURIER_RATE_URL.getAllRates), //use
  getRateById: (id: string) => api.get(COURIER_RATE_URL.getRateById.replace(":id", id)),
  createRate: (data: CourierRatePayload) => api.post(COURIER_RATE_URL.createRate, data), //use
  updateRate: (id: string, data: CourierRatePayload) => api.put(COURIER_RATE_URL.updateRate.replace(":id", id), data), //use
  deleteRate: (id: string) => api.delete(COURIER_RATE_URL.deleteRate.replace(":id", id)), //use
  getActiveRates: () => api.get(COURIER_RATE_URL.getActiveRates),
  searchRates: (shippingType: ShippingType, seaFreightMode: SeaFreightMode, origin: string, destination: string) => api.get(`${COURIER_RATE_URL.searchRates}?shippingType=${shippingType}&seaFreightMode=${seaFreightMode}&origin=${origin}&destination=${destination}`),

  getRatesByShippingType: (shippingType: string) =>
    api.get(COURIER_RATE_URL.getRatesByShippingType.replace(":type", shippingType)),
  getRatesByShippingTypeAndSeaFreightMode: (
    shippingType: ShippingType,
    seaFreightMode: SeaFreightMode
  ) =>
    api.get(COURIER_RATE_URL.getRatesByShippingTypeAndSeaFreightMode.replace(":type", shippingType).replace(":mode", seaFreightMode)),

  searchRatesAdvanced: (filters: CourierRateSearchCriteria) => api.post(COURIER_RATE_URL.searchRatesAdvanced, filters)
};

export default courierRateAPI;