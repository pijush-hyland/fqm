package com.freightquote.dto;

import java.time.LocalDate;

import com.freightquote.ENUM.SeaFreightMode;
import com.freightquote.ENUM.ShippingType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for advanced courier rate search criteria
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourierRateSearchCriteriaDto {
    
    // Basic filters
    private String courierName;
    private ShippingType shippingType;
    private SeaFreightMode seaFreightMode;
    
    // Location filters
    private String origin;           // Search in origin location
    private String destination;      // Search in destination location
    private Long originId;           // Specific origin location ID
    private Long destinationId;      // Specific destination location ID
    
    // Date filters
    private LocalDate activeOnDate;        // Rate must be active on this date
    private LocalDate effectiveFromAfter;  // Rates starting from this date
    private LocalDate effectiveToBefore;   // Rates ending before this date
    
    // Additional filters
    private Long containerTypeId;     // For FCL rates
    private Integer maxTransitDays;   // Maximum transit days
    private String description;       // Partial match in description
    private Boolean isActive;         // Filter by active/inactive status
    
    // Special flags
    private Boolean currentlyActive;  // Filter only currently active rates
    
    // Pagination and sorting
    private Integer page = 0;
    private Integer size = 20;
    private String sortBy = "id";
    private String sortDirection = "ASC";
    
    /**
     * Check if currently active filter should be applied
     */
    public boolean isCurrentlyActiveFilter() {
        return Boolean.TRUE.equals(currentlyActive);
    }
    
    /**
     * Get safe page number (minimum 0)
     */
    public int getSafePage() {
        return page != null && page >= 0 ? page : 0;
    }
    
    /**
     * Get safe page size (between 1 and 100)
     */
    public int getSafeSize() {
        if (size == null || size < 1) return 20;
        return Math.min(size, 100); // Maximum 100 records per page
    }
    
    /**
     * Get safe sort field
     */
    public String getSafeSortBy() {
        if (sortBy == null || sortBy.trim().isEmpty()) {
            return "id";
        }
        return sortBy.trim();
    }
    
    /**
     * Get safe sort direction
     */
    public String getSafeSortDirection() {
        if (sortDirection == null || 
            (!sortDirection.equalsIgnoreCase("ASC") && !sortDirection.equalsIgnoreCase("DESC"))) {
            return "ASC";
        }
        return sortDirection.toUpperCase();
    }
}
