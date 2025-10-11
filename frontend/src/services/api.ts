import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { Location, ContainerType, ApiResponse, CourierRate, ShippingRequirement } from '../types';

const API_BASE_URL = 'api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Enable CORS credentials
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add common headers
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens or other headers here if needed
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.response?.status === 0) {
      console.error('Network error - CORS might not be configured properly');
    }
    return Promise.reject(error);
  }
);

// Interfaces for API requests
interface RateFilters {
  shippingType?: string;
  containerType?: string;
  origin?: string;
  destination?: string;
}

// Courier Rate Service
export const courierRateService = {
  // Get all rates
  getAllRates: (): Promise<AxiosResponse<CourierRate[]>> => 
    apiClient.get<CourierRate[]>('/courier-rates'),
  
  // Get rate by ID
  getRateById: (id: number): Promise<AxiosResponse<CourierRate>> => 
    apiClient.get<CourierRate>(`/courier-rates/${id}`),
  
  // Create new rate
  createRate: (rateData: Partial<CourierRate>): Promise<AxiosResponse<CourierRate>> => 
    apiClient.post<CourierRate>('/courier-rates', rateData),
  
  // Update rate
  updateRate: (id: number, rateData: Partial<CourierRate>): Promise<AxiosResponse<CourierRate>> => 
    apiClient.put<CourierRate>(`/courier-rates/${id}`, rateData),
  
  // Delete rate
  deleteRate: (id: number): Promise<AxiosResponse<void>> => 
    apiClient.delete<void>(`/courier-rates/${id}`),
  
  // Get active rates
  getActiveRates: (): Promise<AxiosResponse<CourierRate[]>> => 
    apiClient.get<CourierRate[]>('/courier-rates/active'),
  
  // Search rates with filters
  searchRates: (filters: RateFilters): Promise<AxiosResponse<CourierRate[]>> => {
    const params = new URLSearchParams();
    if (filters.shippingType) params.append('shippingType', filters.shippingType);
    if (filters.containerType) params.append('containerType', filters.containerType);
    if (filters.origin) params.append('origin', filters.origin);
    if (filters.destination) params.append('destination', filters.destination);
    
    return apiClient.get<CourierRate[]>(`/courier-rates/search?${params.toString()}`);
  },
  
  // Get rates by shipping type
  getRatesByShippingType: (shippingType: string): Promise<AxiosResponse<CourierRate[]>> => 
    apiClient.get<CourierRate[]>(`/courier-rates/shipping-type/${shippingType}`),
  
  // Get rates by shipping type and container type
  getRatesByShippingTypeAndSeaFreightMode: (shippingType: string, containerType: string): Promise<AxiosResponse<CourierRate[]>> =>
    apiClient.get<CourierRate[]>(`/courier-rates/shipping-type/${shippingType}/sea-freight-mode/${containerType}`),

  // Find matching rates for shipping requirements (using dedicated quote endpoint)
  findMatchingRates: (requirement: ShippingRequirement): Promise<AxiosResponse<CourierRate[]>> =>
    apiClient.post<CourierRate[]>('/quotes/get-quotes', requirement),
};

// Location Service
export const locationService = {
  // Get all locations
  getAllLocations: (): Promise<ApiResponse<Location[]>> => 
    apiClient.get<Location[]>('/locations').then(response => ({ data: response.data })),
  
  // Get location by ID
  getLocationById: (id: number): Promise<ApiResponse<Location>> => 
    apiClient.get<Location>(`/locations/${id}`).then(response => ({ data: response.data })),
  
  // Create new location
  createLocation: (locationData: Partial<Location>): Promise<ApiResponse<Location>> => 
    apiClient.post<Location>('/locations', locationData).then(response => ({ data: response.data })),
  
  // Update location
  updateLocation: (id: number, locationData: Partial<Location>): Promise<ApiResponse<Location>> => 
    apiClient.put<Location>(`/locations/${id}`, locationData).then(response => ({ data: response.data })),
  
  // Delete location
  deleteLocation: (id: number): Promise<ApiResponse<void>> => 
    apiClient.delete<void>(`/locations/${id}`).then(response => ({ data: response.data })),
  
  // Get active locations
  getActiveLocations: (): Promise<ApiResponse<Location[]>> => 
    apiClient.get<Location[]>('/locations/active').then(response => ({ data: response.data })),
  
  // Search locations
  searchLocations: (searchTerm: string): Promise<ApiResponse<Location[]>> => 
    apiClient.get<Location[]>(`/locations/search?q=${encodeURIComponent(searchTerm)}`).then(response => ({ data: response.data })),
  
  // Get locations by type
  getLocationsByType: (locationType: string): Promise<ApiResponse<Location[]>> => 
    apiClient.get<Location[]>(`/locations/type/${locationType}`).then(response => ({ data: response.data })),
  
  // Get locations by country
  getLocationsByCountry: (country: string): Promise<ApiResponse<Location[]>> => 
    apiClient.get<Location[]>(`/locations/country/${encodeURIComponent(country)}`).then(response => ({ data: response.data })),
};

// Container Type Service
export const containerTypeService = {
  // Get all container types
  getAllContainerTypes: (): Promise<ApiResponse<ContainerType[]>> => 
    apiClient.get<ContainerType[]>('/container-types').then(response => ({ data: response.data })),
  
  // Get container type by ID
  getContainerTypeById: (id: number): Promise<ApiResponse<ContainerType>> => 
    apiClient.get<ContainerType>(`/container-types/${id}`).then(response => ({ data: response.data })),
  
  // Create new container type
  createContainerType: (containerData: Partial<ContainerType>): Promise<ApiResponse<ContainerType>> => 
    apiClient.post<ContainerType>('/container-types', containerData).then(response => ({ data: response.data })),
  
  // Update container type
  updateContainerType: (id: number, containerData: Partial<ContainerType>): Promise<ApiResponse<ContainerType>> => 
    apiClient.put<ContainerType>(`/container-types/${id}`, containerData).then(response => ({ data: response.data })),
  
  // Delete container type
  deleteContainerType: (id: number): Promise<ApiResponse<void>> => 
    apiClient.delete<void>(`/container-types/${id}`).then(response => ({ data: response.data })),
  
  // Get active container types
  getActiveContainerTypes: (): Promise<ApiResponse<ContainerType[]>> => 
    apiClient.get<ContainerType[]>('/container-types/active').then(response => ({ data: response.data })),
  
  // Search container types
  searchContainerTypes: (searchTerm: string): Promise<ApiResponse<ContainerType[]>> => 
    apiClient.get<ContainerType[]>(`/container-types/search?q=${encodeURIComponent(searchTerm)}`).then(response => ({ data: response.data })),
  
  // Get suitable container types for cargo
  getSuitableContainerTypes: (weightKG: number, volumeCBM: number): Promise<ApiResponse<ContainerType[]>> => 
    apiClient.get<ContainerType[]>(`/container-types/suitable?weight=${weightKG}&volume=${volumeCBM}`).then(response => ({ data: response.data })),
  
  // Get container types by category
  getContainerTypesByCategory: (category: string): Promise<ApiResponse<ContainerType[]>> => 
    apiClient.get<ContainerType[]>(`/container-types/category/${category}`).then(response => ({ data: response.data })),
};

export default apiClient;
