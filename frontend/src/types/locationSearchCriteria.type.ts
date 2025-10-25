import type { LocationType } from './location.type';

export type LocationSearchCriteria = {
  search?: string;
  countryCode?: string;
  locationType?: LocationType;
};

export type LocationCreateRequest = {
  name: string;
  code: string;
  country: string;
  countryCode: string;
  type: LocationType;
  isActive: boolean;
};

export type LocationUpdateRequest = LocationCreateRequest;