package com.freightquote.dto;

import java.time.LocalDate;
import java.util.Map;

import com.freightquote.ENUM.SeaFreightMode;
import com.freightquote.ENUM.ShippingType;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShippingRequirementDto {

    // 1. Shipment Details (General)
    @NotNull(message = "Origin is required")
    private Long origin;
    
    @NotNull(message = "Destination is required")
    private Long destination;

    // @NotNull(message = "Shipping type is required")
    private ShippingType shippingType;
    
    private SeaFreightMode seaFreightMode; // FCL or LCL (for sea freight only)
    
    @NotNull(message = "Ready date is required")
    private LocalDate shippingDate; // Renamed from readyDate for backend compatibility
    
    // 2. Cargo Dimensions & Weight
    // @NotNull(message = "Number of packages is required")
    // @Positive(message = "Number of packages must be positive")
    private Integer numberOfPackages;
    
    // @NotNull(message = "Gross weight is required")
    // @Positive(message = "Gross weight must be positive")
    private Double grossWeightKG;
    
    private Double volumeCBM; // For sea freight
    
    // // 3. For Sea Freight - FCL
    // private Integer numberOfContainers;
    
    // Optional constraints
    private Integer maxTransitDays;

    private Map<Long, Integer> containerCount; // Map of containerTypeId to count
}
