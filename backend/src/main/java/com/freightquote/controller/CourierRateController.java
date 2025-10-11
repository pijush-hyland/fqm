package com.freightquote.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.freightquote.ENUM.SeaFreightMode;
import com.freightquote.ENUM.ShippingType;
import com.freightquote.dto.CourierRateDto;
import com.freightquote.dto.CourierRateSearchCriteriaDto;
import com.freightquote.service.CourierRateService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/courier-rates")
@CrossOrigin(origins = {"http://localhost:3000", "https://*.devtunnels.ms"})
public class CourierRateController {

    @Autowired
    private CourierRateService courierRateService;

    @GetMapping
    public ResponseEntity<List<CourierRateDto>> getAllRates() {
        List<CourierRateDto> rates = courierRateService.getAllRates();
        return ResponseEntity.ok(rates);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourierRateDto> getRateById(@PathVariable Long id) {
        return courierRateService.getRateById(id)
                .map(rate -> ResponseEntity.ok(rate))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CourierRateDto> createRate(@Valid @RequestBody CourierRateDto rateDto) {
        CourierRateDto createdRate = courierRateService.createRate(rateDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRate);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourierRateDto> updateRate(
            @PathVariable Long id,
            @Valid @RequestBody CourierRateDto rateDto) {
        return courierRateService.updateRate(id, rateDto)
                .map(rate -> ResponseEntity.ok(rate))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRate(@PathVariable Long id) {
        if (courierRateService.deleteRate(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    
    @GetMapping("/active")
    public ResponseEntity<List<CourierRateDto>> getActiveRates() {
        List<CourierRateDto> rates = courierRateService.getActiveRates();
        return ResponseEntity.ok(rates);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<CourierRateDto>> searchRates(
            @RequestParam(required = false) ShippingType shippingType,
            @RequestParam(required = false) SeaFreightMode seaFreightMode,
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination) {
        
        List<CourierRateDto> rates = courierRateService.searchRates(
                shippingType, seaFreightMode, origin, destination);
        return ResponseEntity.ok(rates);
    }
    
    @GetMapping("/shipping-type/{type}")
    public ResponseEntity<List<CourierRateDto>> getRatesByShippingType(
            @PathVariable ShippingType type) {
        List<CourierRateDto> rates = courierRateService.getRatesByShippingType(type);
        return ResponseEntity.ok(rates);
    }
    
    @GetMapping("/shipping-type/{shippingType}/sea-freight-mode/{containerType}")
    public ResponseEntity<List<CourierRateDto>> getRatesByShippingTypeAndSeaFreightMode(
            @PathVariable ShippingType shippingType,
            @PathVariable SeaFreightMode seaFreightMode) {
        List<CourierRateDto> rates = courierRateService.getRatesByShippingTypeAndSeaFreightMode(
                shippingType, seaFreightMode);
        return ResponseEntity.ok(rates);
    }

    @PostMapping("/search-advanced")
    public ResponseEntity<Page<CourierRateDto>> searchRatesAdvanced(
            @Valid @RequestBody CourierRateSearchCriteriaDto searchCriteria) {
        Page<CourierRateDto> ratePage = courierRateService.searchRatesAdvanced(searchCriteria);
        return ResponseEntity.ok(ratePage);
    }
}
