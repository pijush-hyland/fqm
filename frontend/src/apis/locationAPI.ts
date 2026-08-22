import type { Location, LocationType } from "../types/location.type";
import type { LocationCreateRequest, LocationUpdateRequest } from "../types/locationSearchCriteria.type";
import { api } from "./api";

const LOCATION_BASE_URL = "/locations";

export const LOCATION_URL = {
	getAllLocations: `${LOCATION_BASE_URL}`,
	getLocationById: `${LOCATION_BASE_URL}/:id`,
	getLocationByCode: `${LOCATION_BASE_URL}/code/:locationCode`,
	getCountryCodes: `${LOCATION_BASE_URL}/countries`,
	getSeaPorts: `${LOCATION_BASE_URL}/seaports`,
	getAirports: `${LOCATION_BASE_URL}/airports`,
	createLocation: `${LOCATION_BASE_URL}`,
	updateLocation: `${LOCATION_BASE_URL}/:id`,
	deleteLocation: `${LOCATION_BASE_URL}/:id`,
};

const locationAPI = {
	getAllLocations: (search?: string, countryCode?: string, locationType?: LocationType) => {
		let url = LOCATION_URL.getAllLocations;
		const params = new URLSearchParams();

		if (search) {
			params.append('search', search);
		}
		if (countryCode) {
			params.append('countryCode', countryCode);
		}
		if (locationType) {
			params.append('locationType', locationType);
		}

		if (params.toString()) {
			url += `?${params.toString()}`;
		}

		return api.get<Location[]>(url);
	},

	getLocationById: (id: number) => api.get<Location>(LOCATION_URL.getLocationById.replace(":id", id.toString())),

	createLocation: (data: LocationCreateRequest) => api.post<Location>(LOCATION_URL.createLocation, data),

	updateLocation: (id: number, data: LocationUpdateRequest) => api.put<Location>(LOCATION_URL.updateLocation.replace(":id", id.toString()), data),

	deleteLocation: (id: number) => api.delete<void>(LOCATION_URL.deleteLocation.replace(":id", id.toString())),

	getLocationByCode: (locationCode: string) => api.get<Location>(LOCATION_URL.getLocationByCode.replace(":locationCode", locationCode)),

	getCountryCodes: () => api.get<string[]>(LOCATION_URL.getCountryCodes),

	getSeaPorts: () => api.get<Location[]>(LOCATION_URL.getSeaPorts),

	getAirports: () => api.get<Location[]>(LOCATION_URL.getAirports),

	searchLocations: (search: string) => api.get<Location[]>(`${LOCATION_BASE_URL}?search=${encodeURIComponent(search)}`),

	getLocationsByCountry: (countryCode: string) => api.get<Location[]>(`${LOCATION_BASE_URL}?countryCode=${countryCode}`),

	getLocationsByType: (locationType: LocationType) => api.get<Location[]>(`${LOCATION_BASE_URL}?locationType=${locationType}`)
};

export default locationAPI;