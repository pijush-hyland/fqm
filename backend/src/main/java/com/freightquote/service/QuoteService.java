package com.freightquote.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.freightquote.dto.CourierRateDto;
import com.freightquote.dto.ShippingRequirementDto;
import com.freightquote.entity.CourierRate;
import com.freightquote.repository.CourierRateRepository;
import com.freightquote.specification.QuoteSpecification;

/**
 * Service class dedicated to freight quotation generation and matching
 */
@Service
public class QuoteService {
    
    @Autowired
    private CourierRateRepository courierRateRepository;
    
    /**
     * Find matching rates and generate quotations based on shipping requirements
     * Uses QuoteSpecification for clean and maintainable filtering logic
     */
    public List<CourierRateDto> findMatchingQuotes(ShippingRequirementDto requirement) {
        // Build specification using dedicated QuoteSpecification class
        Specification<CourierRate> spec = QuoteSpecification.buildQuoteSpecification(requirement);
        
        // Execute query with specifications
        List<CourierRate> matchingRates = courierRateRepository.findAll(spec);
        
        // Generate quotations and sort results
        return matchingRates.stream()
                .map(rate -> {
                    // Calculate quotation for this rate
                    var quotation = new CourierRateDto(rate);
                    quotation.setRate(rate.getQuotation(requirement));
                    return quotation;
                })
                .collect(Collectors.toList());
    }
}
