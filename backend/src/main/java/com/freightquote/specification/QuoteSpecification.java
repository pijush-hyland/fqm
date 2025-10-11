package com.freightquote.specification;

import java.util.Set;

import org.springframework.data.jpa.domain.Specification;

import com.freightquote.ENUM.SeaFreightMode;
import com.freightquote.ENUM.ShippingType;
import com.freightquote.dto.ShippingRequirementDto;
import com.freightquote.entity.CourierRate;

/**
 * Specification builder specifically for quote-related queries
 * Encapsulates all filtering logic for freight quotations
 */
public class QuoteSpecification {

	/**
	 * Build a complete specification for finding matching quotes based on shipping
	 * requirements
	 */
	public static Specification<CourierRate> buildQuoteSpecification(ShippingRequirementDto requirement) {
		// Start with a base specification that matches everything
		Specification<CourierRate> spec = (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();

		// Always filter for active rates in quotes
		spec = spec.and(CourierRateSpecification.hasActiveStatus(true));

		// Filter by origin location ID
		if (requirement.getOrigin() != null) {
			spec = spec.and(CourierRateSpecification.hasOriginId(requirement.getOrigin()));
		}

		// Filter by destination location ID
		if (requirement.getDestination() != null) {
			spec = spec.and(CourierRateSpecification.hasDestinationId(requirement.getDestination()));
		}

		// Filter by date (rate must be active on shipping date)
		if (requirement.getShippingDate() != null) {
			spec = spec.and(CourierRateSpecification.isActiveOnDate(requirement.getShippingDate()));
		}

		// Filter by shipping type
		if (requirement.getShippingType() != null) {
			spec = spec.and(CourierRateSpecification.hasShippingType(requirement.getShippingType()));
		}

		// Filter by sea freight mode for water shipments
		if (requirement.getShippingType() == ShippingType.WATER && requirement.getSeaFreightMode() != null) {
			spec = spec.and(CourierRateSpecification.hasSeaFreightMode(requirement.getSeaFreightMode()));
		}

		// Filter by container types for FCL shipments
		if (requirement.getShippingType() == ShippingType.WATER &&
				requirement.getSeaFreightMode() == SeaFreightMode.FCL &&
				requirement.getContainerCount() != null && !requirement.getContainerCount().isEmpty()) {

			spec = spec.and(buildContainerTypesSpecification(requirement.getContainerCount().keySet()));
		}
		return spec;
	}

	/**
	 * Build OR specification for multiple container type IDs
	 */
	private static Specification<CourierRate> buildContainerTypesSpecification(Set<Long> containerTypeIds) {
		Specification<CourierRate> containerSpec = null;

		for (Long containerTypeId : containerTypeIds) {
			Specification<CourierRate> singleContainerSpec = CourierRateSpecification.hasContainerType(containerTypeId);

			if (containerSpec == null) {
				containerSpec = singleContainerSpec;
			} else {
				containerSpec = containerSpec.or(singleContainerSpec);
			}
		}

		return containerSpec;
	}

	/**
	 * Specification for active rates only (convenience method for quotes)
	 */
	public static Specification<CourierRate> isCurrentlyActive() {
		return CourierRateSpecification.isCurrentlyActive();
	}

	/**
	 * Specification for rates with maximum transit days (for time-sensitive quotes)
	 */
	public static Specification<CourierRate> hasMaxTransitDays(Integer maxTransitDays) {
		return CourierRateSpecification.hasMaxTransitDays(maxTransitDays);
	}
}
