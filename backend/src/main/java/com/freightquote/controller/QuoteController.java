package com.freightquote.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.freightquote.dto.CourierRateDto;
import com.freightquote.dto.ShippingRequirementDto;
import com.freightquote.service.QuoteService;

import jakarta.validation.Valid;

/**
 * Controller dedicated to freight quotation and rate matching for customers
 */
@RestController
@RequestMapping("/api/quotes")
public class QuoteController {
    
    @Autowired
    private QuoteService quoteService;
    
    /**
     * Get freight quotes based on shipping requirements
     *
     * This endpoint is designed for customers to get quotations for their shipments.
     * It takes shipping requirements and returns matching rates with calculated costs.
     *
     * Example request:
     * POST /api/quotes/get-quotes
     * {
     *   "origin": 1,
     *   "destination": 2,
     *   "shippingType": "WATER",
     *   "seaFreightMode": "FCL",
     *   "shippingDate": "2024-12-15",
     *   "numberOfPackages": 10,
     *   "grossWeightKG": 15000.0,
     *   "volumeCBM": 25.5,
     *   "numberOfContainers": 1,
     *   "containerTypes": [1, 2],
     *   "maxTransitDays": 30
     * }
     *
     * @param requirement The shipping requirements including origin, destination, dates, cargo details
     * @return List of quoted rates with calculated costs based on the requirements
     */
    @PostMapping("/get-quotes")
    public ResponseEntity<List<CourierRateDto>> getQuotes(
            @Valid @RequestBody ShippingRequirementDto requirement) {
        
        List<CourierRateDto> quotes = quoteService.findMatchingQuotes(requirement);
        return ResponseEntity.ok(quotes);
    }
}
