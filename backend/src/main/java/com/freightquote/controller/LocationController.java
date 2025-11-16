package com.freightquote.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.freightquote.entity.Location;
import com.freightquote.service.LocationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/locations")
public class LocationController {
    
    @Autowired
    private LocationService locationService;
    
    @GetMapping
    public ResponseEntity<List<Location>> getAllLocations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String countryCode,
            @RequestParam(required = false) String locationType) {
        
        try {
            List<Location> locations;
            
            // Check if any search parameters are provided
            boolean hasSearch = search != null && !search.trim().isEmpty();
            boolean hasCountryCode = countryCode != null && !countryCode.trim().isEmpty();
            boolean hasLocationType = locationType != null && !locationType.trim().isEmpty();
            
            if (hasSearch || hasCountryCode || hasLocationType) {
                // Parse location type if provided
                Location.Type type = null;
                if (hasLocationType) {
                    try {
                        type = Location.Type.valueOf(locationType.toUpperCase());
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest().build();
                    }
                }
                
                // Use combined search with all provided parameters
                locations = locationService.searchWithMultipleFilters(
                    hasSearch ? search.trim() : null,
                    hasCountryCode ? countryCode.trim() : null,
                    type
                );
            } else {
                // No parameters provided, return all locations
                locations = locationService.getAllLocations();
            }
            
            return ResponseEntity.ok(locations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Location> getLocationById(@PathVariable Long id) {
        try {
            Optional<Location> location = locationService.getLocationById(id);
            return location.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/code/{locationCode}")
    public ResponseEntity<Location> getLocationByCode(@PathVariable String locationCode) {
        try {
            Optional<Location> location = locationService.getLocationByCode(locationCode);
            return location.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/countries")
    public ResponseEntity<List<String>> getCountryCodes() {
        try {
            List<String> countryCodes = locationService.getCountryCodes();
            return ResponseEntity.ok(countryCodes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/seaports")
    public ResponseEntity<List<Location>> getSeaPorts() {
        try {
            List<Location> seaPorts = locationService.getSeaPorts();
            return ResponseEntity.ok(seaPorts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/airports")
    public ResponseEntity<List<Location>> getAirports() {
        try {
            List<Location> airports = locationService.getAirports();
            return ResponseEntity.ok(airports);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping
    public ResponseEntity<Location> createLocation(@Valid @RequestBody Location location) {
        try {
            Location savedLocation = locationService.saveLocation(location);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedLocation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Location> updateLocation(@PathVariable Long id, @Valid @RequestBody Location location) {
        try {
            Optional<Location> existingLocation = locationService.getLocationById(id);
            if (!existingLocation.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            location.setId(id);
            Location updatedLocation = locationService.saveLocation(location);
            return ResponseEntity.ok(updatedLocation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocation(@PathVariable Long id) {
        try {
            Optional<Location> location = locationService.getLocationById(id);
            if (!location.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            locationService.deleteLocation(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
