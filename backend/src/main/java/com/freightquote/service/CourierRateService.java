package com.freightquote.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.freightquote.ENUM.SeaFreightMode;
import com.freightquote.ENUM.ShippingType;
import com.freightquote.dto.CourierRateDto;
import com.freightquote.dto.CourierRateSearchCriteriaDto;
import com.freightquote.entity.AirFreightRate;
import com.freightquote.entity.ContainerType;
import com.freightquote.entity.CourierRate;
import com.freightquote.entity.FCLFreightRate;
import com.freightquote.entity.LCLFreightRate;
import com.freightquote.exception.DuplicateRateException;
import com.freightquote.repository.CourierRateRepository;
import com.freightquote.specification.CourierRateSpecification;

@Service
public class CourierRateService {

	@Autowired
	private CourierRateRepository courierRateRepository;

	public List<CourierRateDto> getAllRates() {
		return courierRateRepository.findAll()
				.stream()
				.map(CourierRateDto::new)
				.collect(Collectors.toList());
	}

	public Optional<CourierRateDto> getRateById(Long id) {
		return courierRateRepository.findById(id)
				.map(CourierRateDto::new);
	}

	public CourierRateDto createRate(CourierRateDto rateDto) {
		// Validate if a similar rate already exists
		validateRateDoesNotExist(rateDto, null);

		CourierRate rate = rateDto.toEntity();
		CourierRate savedRate = courierRateRepository.save(rate);
		return new CourierRateDto(savedRate);
	}

	/**
	 * Validate that a rate with similar criteria doesn't already exist
	 * @param rateDto - the rate data to validate
	 * @param excludeRateId - rate ID to exclude from validation (for updates), null for creates
	 */
	private void validateRateDoesNotExist(CourierRateDto rateDto, Long excludeRateId) {
		// For FCL rates, check all container types in the ratesForFCL map
		if (rateDto.getShippingType() == ShippingType.WATER &&
				rateDto.getSeaFreightMode() == SeaFreightMode.FCL &&
				rateDto.getRatesForFCL() != null) {
			
			// Check each container type for conflicts
			for (Long containerTypeId : rateDto.getRatesForFCL().keySet()) {
				validateSingleFCLRate(rateDto, containerTypeId, excludeRateId);
			}
		} else {
			// For non-FCL rates, use the standard validation
			validateSingleRate(rateDto, excludeRateId);
		}
	}

	/**
	 * Validate a single rate (for non-FCL)
	 * @param rateDto - the rate data to validate
	 * @param excludeRateId - rate ID to exclude from validation (for updates), null for creates
	 */
	private void validateSingleRate(CourierRateDto rateDto, Long excludeRateId) {
		// Use database query to find conflicting rates
		List<CourierRate> conflictingRates;
		
		conflictingRates = courierRateRepository.findConflictingRates(
			rateDto.getCourierName(),
			rateDto.getOrigin() != null ? rateDto.getOrigin().getId() : null,
			rateDto.getDestination() != null ? rateDto.getDestination().getId() : null,
			rateDto.getShippingType(),
			rateDto.getSeaFreightMode(),
			rateDto.getEffectiveFrom(),
			rateDto.getEffectiveTo());

		if (excludeRateId != null && conflictingRates.size() == 1 &&
				conflictingRates.get(0).getId().equals(excludeRateId)){
			return;
		}else if (!conflictingRates.isEmpty()) {
			CourierRate conflictingRate = conflictingRates.get(0);

			throw new DuplicateRateException(
					String.format(
							"A rate already exists for courier '%s' from '%s' to '%s' for %s shipping%s with overlapping dates (%s to %s). "
									+
									"Existing rate ID: %d, effective from %s to %s.",
							rateDto.getCourierName(),
							getLocationDescription(rateDto.getOrigin()),
							getLocationDescription(rateDto.getDestination()),
							rateDto.getShippingType(),
							rateDto.getShippingType() == ShippingType.WATER ? " (" + rateDto.getSeaFreightMode() + ")" : "",
							rateDto.getEffectiveFrom(),
							rateDto.getEffectiveTo(),
							conflictingRate.getId(),
							conflictingRate.getEffectiveFrom(),
							conflictingRate.getEffectiveTo()),
					conflictingRate.getId());
		}
	}

	/**
	 * Validate a single FCL rate for a specific container type
	 * @param rateDto - the rate data to validate
	 * @param containerTypeId - the container type ID to check
	 * @param excludeRateId - rate ID to exclude from validation (for updates), null for creates
	 */
	private void validateSingleFCLRate(CourierRateDto rateDto, Long containerTypeId, Long excludeRateId) {
		// Use database query to find conflicting FCL rates for the specific container type
		List<CourierRate> conflictingRates;
		
		conflictingRates = courierRateRepository.findConflictingFCLRatesForContainerType(
			rateDto.getCourierName(),
			rateDto.getOrigin() != null ? rateDto.getOrigin().getId() : null,
			rateDto.getDestination() != null ? rateDto.getDestination().getId() : null,
			containerTypeId,
			rateDto.getEffectiveFrom(),
			rateDto.getEffectiveTo());

		if (excludeRateId != null && conflictingRates.size() == 1 &&
				conflictingRates.get(0).getId().equals(excludeRateId)){
			// No conflict if the only found rate is the one being updated
		}else if (!conflictingRates.isEmpty()) {
			CourierRate conflictingRate = conflictingRates.get(0);
			
			// Get container type name for better error message
			String containerTypeName = conflictingRate.getFclFreightDetails().stream()
					.filter(fclRate -> fclRate.getContainerType() != null && 
							fclRate.getContainerType().getId().equals(containerTypeId))
					.findFirst()
					.map(fclRate -> fclRate.getContainerType().getName())
					.orElse("Unknown Container Type");

			throw new DuplicateRateException(
					String.format(
							"An FCL rate already exists for courier '%s' from '%s' to '%s' for container type '%s' with overlapping dates (%s to %s). " +
							"Existing rate ID: %d, effective from %s to %s.",
							rateDto.getCourierName(),
							getLocationDescription(rateDto.getOrigin()),
							getLocationDescription(rateDto.getDestination()),
							containerTypeName,
							rateDto.getEffectiveFrom(),
							rateDto.getEffectiveTo(),
							conflictingRate.getId(),
							conflictingRate.getEffectiveFrom(),
							conflictingRate.getEffectiveTo()),
					conflictingRate.getId());
		}
	}

	/**
	 * Get a user-friendly description of a location
	 */
	private String getLocationDescription(com.freightquote.entity.Location location) {
		if (location == null) {
			return "Unknown";
		}

		StringBuilder desc = new StringBuilder();
		if (location.getCode() != null) {
			desc.append(location.getCode());
		}
		if (location.getCountry() != null) {
			if (desc.length() > 0)
				desc.append(", ");
			desc.append(location.getCountry());
		}

		return desc.length() > 0 ? desc.toString() : "Location ID: " + location.getId();
	}

	@Transactional("transactionManager")
	public Optional<CourierRateDto> updateRate(Long id, CourierRateDto rateDto) {
		return courierRateRepository.findById(id)
			.map(existingRate -> {
				// Validate for conflicts before updating - exclude the current rate being updated
				validateRateDoesNotExist(rateDto, id);
				
				if (rateDto.getEffectiveFrom() != null) {
					existingRate.setEffectiveFrom(rateDto.getEffectiveFrom());
				}
				if (rateDto.getEffectiveTo() != null) {
					existingRate.setEffectiveTo(rateDto.getEffectiveTo());
				}
				if (rateDto.getDescription() != null) {
					existingRate.setDescription(rateDto.getDescription());
				}
				if (rateDto.getTransitDays() != null) {
					existingRate.setTransitDays(rateDto.getTransitDays());
				}
				if (rateDto.getWeightLimit() != null) {
					existingRate.setWeightLimit(rateDto.getWeightLimit());
				}
				if (rateDto.getDimensionLimit() != null) {
					existingRate.setDimensionLimit(rateDto.getDimensionLimit());
				}
				if (rateDto.getIsActive() != null) {
					existingRate.setIsActive(rateDto.getIsActive());
				}

				// Update shipping-type-specific freight details
				updateFreightDetails(existingRate, rateDto);

				CourierRate updatedRate = courierRateRepository.save(existingRate);
				return new CourierRateDto(updatedRate);
			});
	}

	/**
	 * Update shipping-type-specific freight details based on the DTO
	 */
	private void updateFreightDetails(CourierRate existingRate, CourierRateDto rateDto) {
		if (rateDto.getShippingType() == ShippingType.AIR) {
			updateAirFreightDetails(existingRate, rateDto);
		} else if (rateDto.getShippingType() == ShippingType.WATER) {
			if (rateDto.getSeaFreightMode() == SeaFreightMode.FCL) {
				updateFCLFreightDetails(existingRate, rateDto);
			} else if (rateDto.getSeaFreightMode() == SeaFreightMode.LCL) {
				updateLCLFreightDetails(existingRate, rateDto);
			}
		}
	}

	/**
	 * Update or create AirFreightRate details
	 */
	private void updateAirFreightDetails(CourierRate existingRate, CourierRateDto rateDto) {
		if (existingRate.getAirFreightDetails() == null) {
			// Create new air freight details if they don't exist
			existingRate.setAirFreightDetails(createAirFreightRateFromDto(rateDto));
		} else {
			// Update existing air freight details - only update non-null values
			var airDetails = existingRate.getAirFreightDetails();

			if (rateDto.getRate() != null) {
				airDetails.setRate(rateDto.getRate());
			}
			if (rateDto.getCurrency() != null) {
				airDetails.setCurrency(rateDto.getCurrency());
			}
			if (rateDto.getMinimumCharge() != null) {
				airDetails.setMinimumCharge(rateDto.getMinimumCharge());
			}
			if (rateDto.getFuelSurchargeRate() != null) {
				airDetails.setFuelSurchargeRate(rateDto.getFuelSurchargeRate());
			}
			if (rateDto.getSecuritySurcharge() != null) {
				airDetails.setSecuritySurcharge(rateDto.getSecuritySurcharge());
			}
			if (rateDto.getAirWeightLimit() != null) {
				airDetails.setWeightLimit(rateDto.getAirWeightLimit());
			}
			if (rateDto.getAirDescription() != null) {
				airDetails.setDescription(rateDto.getAirDescription());
			}
		}
	}

	/**
	 * Update or create FCLFreightRate details
	 */
	private void updateFCLFreightDetails(CourierRate existingRate, CourierRateDto rateDto) {
		// Initialize the list if it doesn't exist
		if (existingRate.getFclFreightDetails() == null) {
			existingRate.setFclFreightDetails(new ArrayList<>());
		}

		// Handle multiple container types from DTO's ratesForFCL map
		if (rateDto.getRatesForFCL() != null && !rateDto.getRatesForFCL().isEmpty()) {
			
			// Smart update: Update existing, remove obsolete, add new
			List<FCLFreightRate> currentRates = existingRate.getFclFreightDetails();
			Map<Long, FCLFreightRate> currentRatesByContainerType = currentRates.stream()
					.filter(rate -> rate.getContainerType() != null)
					.collect(Collectors.toMap(
						rate -> rate.getContainerType().getId(),
						rate -> rate
					));

			// Clear the list to rebuild it
			currentRates.clear();
			
			// Process each container type from DTO
			for (Map.Entry<Long, BigDecimal> entry : rateDto.getRatesForFCL().entrySet()) {
				Long containerTypeId = entry.getKey();
				BigDecimal newRate = entry.getValue();
				
				// Check if we already have a rate for this container type
				FCLFreightRate existingFclRate = currentRatesByContainerType.get(containerTypeId);
				
				if (existingFclRate != null) {
					// Update existing rate
					updateExistingFCLRate(existingFclRate, rateDto, newRate);
					currentRates.add(existingFclRate);
				} else {
					// Create new rate
					FCLFreightRate newFclRate = createFCLFreightRateFromDto(rateDto, containerTypeId, newRate);
					existingRate.addFclRate(newFclRate);
				}
			}
		}
	}

	/**
	 * Update an existing FCL freight rate with new values
	 */
	private void updateExistingFCLRate(FCLFreightRate existingFclRate, CourierRateDto rateDto, BigDecimal newRate) {
		// Update only non-null values
		if (newRate != null) {
			existingFclRate.setRate(newRate);
		}
		if (rateDto.getCurrency() != null) {
			existingFclRate.setCurrency(rateDto.getCurrency());
		}
		if (rateDto.getDocumentationFee() != null) {
			existingFclRate.setDocumentationFee(rateDto.getDocumentationFee());
		}
		if (rateDto.getBunkerAdjustmentRate() != null) {
			existingFclRate.setBunkerAdjustmentRate(rateDto.getBunkerAdjustmentRate());
		}
		if (rateDto.getTerminalHandlingCharge() != null) {
			existingFclRate.setTerminalHandlingCharge(rateDto.getTerminalHandlingCharge());
		}
		if (rateDto.getDescription() != null) {
			existingFclRate.setDescription(rateDto.getDescription());
		}
	}

	/**
	 * Update or create LCLFreightRate details
	 */
	private void updateLCLFreightDetails(CourierRate existingRate, CourierRateDto rateDto) {
		if (existingRate.getLclFreightDetails() == null) {
			// Create new LCL freight details if they don't exist
			existingRate.setLclFreightDetails(createLCLFreightRateFromDto(rateDto));
		} else {
			// Update existing LCL freight details - only update non-null values
			var lclDetails = existingRate.getLclFreightDetails();

			if (rateDto.getRate() != null) {
				lclDetails.setRate(rateDto.getRate());
			}
			if (rateDto.getCurrency() != null) {
				lclDetails.setCurrency(rateDto.getCurrency());
			}
			if (rateDto.getDocumentationFee() != null) {
				lclDetails.setDocumentationFee(rateDto.getDocumentationFee());
			}
			if (rateDto.getBunkerAdjustmentRate() != null) {
				lclDetails.setBunkerAdjustmentRate(rateDto.getBunkerAdjustmentRate());
			}
			if (rateDto.getLclServiceCharge() != null) {
				lclDetails.setLclServiceCharge(rateDto.getLclServiceCharge());
			}
			if (rateDto.getDescription() != null) {
				lclDetails.setDescription(rateDto.getDescription());
			}
		}
	}

	public boolean deleteRate(Long id) {
		if (courierRateRepository.existsById(id)) {
			courierRateRepository.deleteById(id);
			return true;
		}
		return false;
	}

	public List<CourierRateDto> getRatesByShippingType(ShippingType shippingType) {
		return courierRateRepository.findByShippingType(shippingType)
				.stream()
				.map(CourierRateDto::new)
				.collect(Collectors.toList());
	}

	public List<CourierRateDto> getRatesByShippingTypeAndSeaFreightMode(
			ShippingType shippingType,
			SeaFreightMode seaFreightMode) {
		return courierRateRepository.findByShippingTypeAndSeaFreightMode(shippingType, seaFreightMode)
				.stream()
				.map(CourierRateDto::new)
				.collect(Collectors.toList());
	}

	public List<CourierRateDto> getActiveRates() {
		return courierRateRepository.findActiveRatesOnDate(LocalDate.now())
				.stream()
				.map(CourierRateDto::new)
				.collect(Collectors.toList());
	}

	public List<CourierRateDto> searchRates(
			ShippingType shippingType,
			SeaFreightMode seaFreightMode,
			String origin,
			String destination) {
		return courierRateRepository.findRatesWithFilters(
				shippingType, seaFreightMode, origin, destination, LocalDate.now())
				.stream()
				.map(CourierRateDto::new)
				.collect(Collectors.toList());
	}

	/**
	 * Advanced search using Specifications for dynamic querying
	 */
	public Page<CourierRateDto> searchRatesAdvanced(CourierRateSearchCriteriaDto criteria) {
		// Build specification dynamically based on criteria
		Specification<CourierRate> spec = Specification.allOf();

		// Add filters based on provided criteria
		if (criteria.getCourierName() != null) {
			spec = spec.and(CourierRateSpecification.hasCourierName(criteria.getCourierName()));
		}

		if (criteria.getShippingType() != null) {
			spec = spec.and(CourierRateSpecification.hasShippingType(criteria.getShippingType()));
		}

		if (criteria.getSeaFreightMode() != null) {
			spec = spec.and(CourierRateSpecification.hasSeaFreightMode(criteria.getSeaFreightMode()));
		}

		if (criteria.getOrigin() != null) {
			spec = spec.and(CourierRateSpecification.hasOrigin(criteria.getOrigin()));
		}

		if (criteria.getDestination() != null) {
			spec = spec.and(CourierRateSpecification.hasDestination(criteria.getDestination()));
		}

		if (criteria.getOriginId() != null) {
			spec = spec.and(CourierRateSpecification.hasOriginId(criteria.getOriginId()));
		}

		if (criteria.getDestinationId() != null) {
			spec = spec.and(CourierRateSpecification.hasDestinationId(criteria.getDestinationId()));
		}

		if (criteria.getActiveOnDate() != null) {
			spec = spec.and(CourierRateSpecification.isActiveOnDate(criteria.getActiveOnDate()));
		}

		if (criteria.getEffectiveFromAfter() != null) {
			spec = spec.and(CourierRateSpecification.hasEffectiveFromAfter(criteria.getEffectiveFromAfter()));
		}

		if (criteria.getEffectiveToBefore() != null) {
			spec = spec.and(CourierRateSpecification.hasEffectiveToBefore(criteria.getEffectiveToBefore()));
		}

		if (criteria.getContainerTypeId() != null) {
			spec = spec.and(CourierRateSpecification.hasContainerType(criteria.getContainerTypeId()));
		}

		if (criteria.getMaxTransitDays() != null) {
			spec = spec.and(CourierRateSpecification.hasMaxTransitDays(criteria.getMaxTransitDays()));
		}

		if (criteria.getDescription() != null) {
			spec = spec.and(CourierRateSpecification.hasDescriptionContaining(criteria.getDescription()));
		}

		if (criteria.getIsActive() != null) {
			spec = spec.and(CourierRateSpecification.hasActiveStatus(criteria.getIsActive()));
		}

		if (criteria.isCurrentlyActiveFilter()) {
			spec = spec.and(CourierRateSpecification.isCurrentlyActive());
		}

		// Create pageable with sorting
		Sort sort = Sort.by(
				criteria.getSafeSortDirection().equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC,
				criteria.getSafeSortBy());

		Pageable pageable = PageRequest.of(
				criteria.getSafePage(),
				criteria.getSafeSize(),
				sort);

		// Execute query and convert to DTO
		Page<CourierRate> ratePage = courierRateRepository.findAll(spec, pageable);

		return ratePage.map(CourierRateDto::new);
	}

	/**
	 * Create AirFreightRate entity from DTO fields (for service layer use)
	 */
	private AirFreightRate createAirFreightRateFromDto(CourierRateDto rateDto) {
		AirFreightRate airRate = new AirFreightRate();
		airRate.setRate(rateDto.getRate());
		airRate.setCurrency(rateDto.getCurrency() != null ? rateDto.getCurrency() : "INR");
		airRate.setMinimumCharge(rateDto.getMinimumCharge() != null ? rateDto.getMinimumCharge() : BigDecimal.valueOf(0));
		airRate.setFuelSurchargeRate(
				rateDto.getFuelSurchargeRate() != null ? rateDto.getFuelSurchargeRate() : BigDecimal.valueOf(0));
		airRate.setSecuritySurcharge(
				rateDto.getSecuritySurcharge() != null ? rateDto.getSecuritySurcharge() : BigDecimal.valueOf(0));
		airRate.setWeightLimit(rateDto.getAirWeightLimit());
		airRate.setDescription(rateDto.getAirDescription());
		return airRate;
	}

	/**
	 * Create FCLFreightRate entity from DTO fields (for service layer use)
	 */
	private FCLFreightRate createFCLFreightRateFromDto(CourierRateDto rateDto, Long containerTypeId, BigDecimal rate) {
		FCLFreightRate fclRate = new FCLFreightRate();
		fclRate.setRate(rate);
		fclRate.setCurrency(rateDto.getCurrency() != null ? rateDto.getCurrency() : "INR");
		fclRate.setDocumentationFee(
				rateDto.getDocumentationFee() != null ? rateDto.getDocumentationFee() : BigDecimal.valueOf(0));
		fclRate.setBunkerAdjustmentRate(
				rateDto.getBunkerAdjustmentRate() != null ? rateDto.getBunkerAdjustmentRate() : BigDecimal.valueOf(0));
		fclRate.setContainerType(new ContainerType(containerTypeId));
		fclRate.setTerminalHandlingCharge(
				rateDto.getTerminalHandlingCharge() != null ? rateDto.getTerminalHandlingCharge() : BigDecimal.valueOf(0));
		fclRate.setDescription(rateDto.getDescription());
		return fclRate;
	}

	/**
	 * Create LCLFreightRate entity from DTO fields (for service layer use)
	 */
	private LCLFreightRate createLCLFreightRateFromDto(CourierRateDto rateDto) {
		LCLFreightRate lclRate = new LCLFreightRate();
		lclRate.setRate(rateDto.getRate());
		lclRate.setCurrency(rateDto.getCurrency() != null ? rateDto.getCurrency() : "INR");
		lclRate.setDocumentationFee(
				rateDto.getDocumentationFee() != null ? rateDto.getDocumentationFee() : BigDecimal.valueOf(0));
		lclRate.setBunkerAdjustmentRate(
				rateDto.getBunkerAdjustmentRate() != null ? rateDto.getBunkerAdjustmentRate() : BigDecimal.valueOf(0));
		lclRate.setLclServiceCharge(
				rateDto.getLclServiceCharge() != null ? rateDto.getLclServiceCharge() : BigDecimal.valueOf(0));
		lclRate.setDescription(rateDto.getDescription());
		return lclRate;
	}
}
