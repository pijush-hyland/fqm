package com.freightquote.specification;

import java.time.LocalDate;

import org.springframework.data.jpa.domain.Specification;

import com.freightquote.ENUM.SeaFreightMode;
import com.freightquote.ENUM.ShippingType;
import com.freightquote.entity.CourierRate;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;

/**
 * Specification builder for CourierRate entity to enable dynamic querying
 */
public class CourierRateSpecification {
    
    /**
     * Filter by courier name (case-insensitive, partial match)
     */
    public static Specification<CourierRate> hasCourierName(String courierName) {
        return (root, query, criteriaBuilder) -> {
            if (courierName == null || courierName.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("courierName")), 
                "%" + courierName.toLowerCase() + "%"
            );
        };
    }
    
    /**
     * Filter by shipping type
     */
    public static Specification<CourierRate> hasShippingType(ShippingType shippingType) {
        return (root, query, criteriaBuilder) -> {
            if (shippingType == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("shippingType"), shippingType);
        };
    }
    
    /**
     * Filter by sea freight mode
     */
    public static Specification<CourierRate> hasSeaFreightMode(SeaFreightMode seaFreightMode) {
        return (root, query, criteriaBuilder) -> {
            if (seaFreightMode == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("seaFreightMode"), seaFreightMode);
        };
    }
    
    /**
     * Filter by origin location (searches in location code and country)
     */
    public static Specification<CourierRate> hasOrigin(String origin) {
        return (root, query, criteriaBuilder) -> {
            if (origin == null || origin.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            
            Join<Object, Object> originJoin = root.join("origin", JoinType.LEFT);
            String searchTerm = "%" + origin.toLowerCase() + "%";
            
            return criteriaBuilder.or(
                criteriaBuilder.like(
                    criteriaBuilder.lower(originJoin.get("locationCode")), 
                    searchTerm
                ),
                criteriaBuilder.like(
                    criteriaBuilder.lower(originJoin.get("country")), 
                    searchTerm
                ),
                criteriaBuilder.like(
                    criteriaBuilder.lower(originJoin.get("city")), 
                    searchTerm
                )
            );
        };
    }
    
    /**
     * Filter by destination location (searches in location code and country)
     */
    public static Specification<CourierRate> hasDestination(String destination) {
        return (root, query, criteriaBuilder) -> {
            if (destination == null || destination.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            
            Join<Object, Object> destinationJoin = root.join("destination", JoinType.LEFT);
            String searchTerm = "%" + destination.toLowerCase() + "%";
            
            return criteriaBuilder.or(
                criteriaBuilder.like(
                    criteriaBuilder.lower(destinationJoin.get("locationCode")), 
                    searchTerm
                ),
                criteriaBuilder.like(
                    criteriaBuilder.lower(destinationJoin.get("country")), 
                    searchTerm
                ),
                criteriaBuilder.like(
                    criteriaBuilder.lower(destinationJoin.get("city")), 
                    searchTerm
                )
            );
        };
    }
    
    /**
     * Filter by specific origin location ID
     */
    public static Specification<CourierRate> hasOriginId(Long originId) {
        return (root, query, criteriaBuilder) -> {
            if (originId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("origin").get("id"), originId);
        };
    }
    
    /**
     * Filter by specific destination location ID
     */
    public static Specification<CourierRate> hasDestinationId(Long destinationId) {
        return (root, query, criteriaBuilder) -> {
            if (destinationId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("destination").get("id"), destinationId);
        };
    }
    
    /**
     * Filter by effective date range - rate must be active on the given date
     */
    public static Specification<CourierRate> isActiveOnDate(LocalDate date) {
        return (root, query, criteriaBuilder) -> {
            if (date == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.and(
                criteriaBuilder.lessThanOrEqualTo(root.get("effectiveFrom"), date),
                criteriaBuilder.greaterThanOrEqualTo(root.get("effectiveTo"), date)
            );
        };
    }
    
    /**
     * Filter by isActive status
     */
    public static Specification<CourierRate> hasActiveStatus(Boolean isActive) {
        return (root, query, criteriaBuilder) -> {
            if (isActive == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("isActive"), isActive);
        };
    }
    
    /**
     * Filter by effective from date (rates starting from this date)
     */
    public static Specification<CourierRate> hasEffectiveFromAfter(LocalDate fromDate) {
        return (root, query, criteriaBuilder) -> {
            if (fromDate == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("effectiveFrom"), fromDate);
        };
    }
    
    /**
     * Filter by effective to date (rates ending before this date)
     */
    public static Specification<CourierRate> hasEffectiveToBefore(LocalDate toDate) {
        return (root, query, criteriaBuilder) -> {
            if (toDate == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("effectiveTo"), toDate);
        };
    }
    
    /**
     * Filter by container type (for FCL rates)
     */
    public static Specification<CourierRate> hasContainerType(Long containerTypeId) {
        return (root, query, criteriaBuilder) -> {
            if (containerTypeId == null) {
                return criteriaBuilder.conjunction();
            }
            
            Join<Object, Object> fclJoin = root.join("fclFreightDetails", JoinType.LEFT);
            return criteriaBuilder.equal(
                fclJoin.get("containerType").get("id"), 
                containerTypeId
            );
        };
    }
    
    /**
     * Filter by transit days (maximum)
     */
    public static Specification<CourierRate> hasMaxTransitDays(Integer maxTransitDays) {
        return (root, query, criteriaBuilder) -> {
            if (maxTransitDays == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("transitDays"), maxTransitDays);
        };
    }
    
    /**
     * Filter by description (partial match, case-insensitive)
     */
    public static Specification<CourierRate> hasDescriptionContaining(String description) {
        return (root, query, criteriaBuilder) -> {
            if (description == null || description.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("description")),
                "%" + description.toLowerCase() + "%"
            );
        };
    }
    
    /**
     * Filter rates that are currently active (today's date)
     */
    public static Specification<CourierRate> isCurrentlyActive() {
        return isActiveOnDate(LocalDate.now()).and((root, query, criteriaBuilder) -> criteriaBuilder.isTrue(root.get("isActive")));
    }
    
    /**
     * Combine multiple specifications with AND logic
     */
    @SafeVarargs
    public static Specification<CourierRate> combineWithAnd(Specification<CourierRate>... specs) {
        return Specification.allOf(specs);
    }
    
    /**
     * Combine multiple specifications with OR logic
     */
    @SafeVarargs
    public static Specification<CourierRate> combineWithOr(Specification<CourierRate>... specs) {
        return Specification.anyOf(specs);
    }
}
