package com.freightquote.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.freightquote.dto.CourierRateDto;
import com.freightquote.dto.ShippingRequirementDto;
import com.freightquote.entity.ContainerType;
import com.freightquote.entity.CourierRate;
import com.freightquote.entity.FCLFreightRate;
import com.freightquote.enums.SeaFreightMode;
import com.freightquote.enums.ShippingType;
import com.freightquote.exception.InvalidContainerSelectionException;
import com.freightquote.repository.ContainerTypeRepository;
import com.freightquote.repository.CourierRateRepository;
import com.freightquote.specification.QuoteSpecification;

/**
 * Service class dedicated to freight quotation generation and matching
 */
@Service
public class QuoteService {

    private final CourierRateRepository courierRateRepository;
    private final ContainerTypeRepository containerTypeRepository;

    public QuoteService(
            CourierRateRepository courierRateRepository,
            ContainerTypeRepository containerTypeRepository) {
        this.courierRateRepository = courierRateRepository;
        this.containerTypeRepository = containerTypeRepository;
    }
    
    /**
     * Find matching rates and generate quotations based on shipping requirements
     * Uses QuoteSpecification for clean and maintainable filtering logic
     */
    public List<CourierRateDto> findMatchingQuotes(ShippingRequirementDto requirement) {
        validateFclSelection(requirement);

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
                    if (quotation.getRatesForFCL() != null) {
                        quotation.getRatesForFCL().keySet()
                                .removeIf(id -> !requirement.getContainerCount().containsKey(id));
                        applyRequestedFclMetadata(quotation, rate, requirement);
                    }
                    return quotation;
                })
                .collect(Collectors.toList());
    }

    private void applyRequestedFclMetadata(
            CourierRateDto quotation,
            CourierRate rate,
            ShippingRequirementDto requirement) {
        FCLFreightRate requestedRate = rate.getFclFreightDetails().stream()
                .filter(fclRate -> fclRate.getContainerType() != null)
                .filter(fclRate -> requirement.getContainerCount()
                        .containsKey(fclRate.getContainerType().getId()))
                .findFirst()
                .orElse(null);
        if (requestedRate == null) {
            return;
        }

        quotation.setCurrency(requestedRate.getCurrency());
        quotation.setDocumentationFee(requestedRate.getDocumentationFee());
        quotation.setBunkerAdjustmentRate(requestedRate.getBunkerAdjustmentRate());
        quotation.setTerminalHandlingCharge(requestedRate.getTerminalHandlingCharge());
    }

    private void validateFclSelection(ShippingRequirementDto requirement) {
        if (requirement.getShippingType() != ShippingType.WATER
                || requirement.getSeaFreightMode() != SeaFreightMode.FCL) {
            return;
        }

        Map<Long, Integer> selection = requirement.getContainerCount();
        if (selection == null || selection.isEmpty()) {
            throw new InvalidContainerSelectionException(List.of());
        }

        Map<Long, ContainerType> storedById = new HashMap<>();
    List<Long> idsToLoad = selection.keySet().stream()
        .filter(id -> id != null && id > 0)
        .toList();
    containerTypeRepository.findByIdIn(idsToLoad)
                .forEach(option -> storedById.put(option.getId(), option));

        List<Long> invalidIds = new ArrayList<>();
        for (Map.Entry<Long, Integer> selected : selection.entrySet()) {
            Long id = selected.getKey();
            ContainerType option = storedById.get(id);
            if (id == null || id <= 0
                    || selected.getValue() == null || selected.getValue() <= 0
                    || !hasValidCustomerDetails(option)) {
                invalidIds.add(id);
            }
        }

        if (!invalidIds.isEmpty()) {
            invalidIds.sort(java.util.Comparator.nullsFirst(Long::compareTo));
            throw new InvalidContainerSelectionException(invalidIds);
        }
    }

    private boolean hasValidCustomerDetails(ContainerType option) {
        if (option == null
                || !Boolean.TRUE.equals(option.getIsActive())
                || option.getCode() == null || option.getCode().isBlank()
                || option.getName() == null || option.getName().isBlank()
                || !isPositive(option.getCapacityCbm())
                || !isPositive(option.getMaximumCargoWeightKg())
                || !isAbsentOrPositive(option.getTareWeightKG())
                || !hasValidMaximumTotalWeight(option)) {
            return false;
        }

        boolean hasNoDimensions = option.getInternalLengthMeters() == null
                && option.getInternalWidthMeters() == null
                && option.getInternalHeightMeters() == null;
        boolean hasCompleteDimensions = isPositive(option.getInternalLengthMeters())
                && isPositive(option.getInternalWidthMeters())
                && isPositive(option.getInternalHeightMeters());
        return hasNoDimensions || hasCompleteDimensions;
    }

    private boolean isPositive(BigDecimal value) {
        return value != null && value.compareTo(BigDecimal.ZERO) > 0;
    }

    private boolean isAbsentOrPositive(BigDecimal value) {
        return value == null || isPositive(value);
    }

    private boolean hasValidMaximumTotalWeight(ContainerType option) {
        BigDecimal maximumTotalWeight = option.getMaximumTotalWeightKg();
        return maximumTotalWeight == null
                || isPositive(maximumTotalWeight)
                    && maximumTotalWeight.compareTo(option.getMaximumCargoWeightKg()) >= 0;
    }
}
