package com.freightquote.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.freightquote.entity.Location;
import com.freightquote.repository.LocationRepository;

@Service
public class LocationService {

	@Autowired
	private LocationRepository locationRepository;

	public List<Location> getAllLocations() {
		return locationRepository.findAll();
	}

	public Optional<Location> getLocationById(Long id) {
		return locationRepository.findById(id);
	}

	public Optional<Location> getLocationByCode(String code) {
		return locationRepository.findByCode(code);
	}

	public List<Location> getLocationsByCountry(String countryCode) {
		return locationRepository.findByCountryCode(countryCode);
	}

	public List<Location> getLocationsByType(Location.Type Type) {
		return locationRepository.findByType(Type);
	}

	public List<Location> getSeaPorts() {
		return locationRepository.findByType(Location.Type.SEA_PORT);
	}

	public List<Location> getAirports() {
		return locationRepository.findByType(Location.Type.AIRPORT);
	}

	public List<Location> searchLocations(String search) {
		if (search == null || search.trim().isEmpty()) {
			return getAllLocations();
		}
		return locationRepository.searchLocations(search.trim());
	}

	public List<String> getCountryCodes() {
		return locationRepository.findDistinctCountryCodes();
	}

	public Location saveLocation(Location location) {
		validateLocation(location);
		return locationRepository.save(location);
	}

	public void deleteLocation(Long id) {
		locationRepository.deleteById(id);
	}

	public boolean existsByCode(String locationCode) {
		return locationRepository.existsByCode(locationCode);
	}

	private void validateLocation(Location location) {
		if (location.getCode() == null || location.getCode().trim().isEmpty()) {
			throw new IllegalArgumentException("Location code is required");
		}

		if (location.getName() == null || location.getName().trim().isEmpty()) {
			throw new IllegalArgumentException("Location name is required");
		}

		if (location.getCountryCode() == null || location.getCountryCode().trim().isEmpty()) {
			throw new IllegalArgumentException("Country code is required");
		}

		// Check for duplicate code (excluding current location if updating)
		if (location.getId() == null) {
			if (existsByCode(location.getCode())) {
				throw new IllegalArgumentException("Location code already exists: " + location.getCode());
			}
		}
	}

	public List<Location> searchWithMultipleFilters(String search, String countryCode, Location.Type type) {
		// Use database-level filtering for better performance
		return locationRepository.findByMultipleFilters(search, countryCode, type);
	}

}
