package com.freightquote.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "container_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContainerType {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Container code is required")
    @Column(nullable = false, unique = true, length = 10)
    private String code; // e.g., "20GP", "40GP", "40HC"
    
    @NotBlank(message = "Container name is required")
    @Column(nullable = false)
    private String name; // e.g., "20ft General Purpose"
    
    @Column(nullable = false)
    private String description;
    
    @Positive(message = "Tare weight must be positive")
    @Column(name = "tare_weight_kg", precision = 10, scale = 2)
    private BigDecimal tareWeightKg;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "is_refrigerated")
    private Boolean isRefrigerated = false;

    @Positive(message = "Internal length must be positive")
    @Column(name = "internal_length_meters", precision = 8, scale = 3)
    private BigDecimal internalLengthMeters;

    @Positive(message = "Internal width must be positive")
    @Column(name = "internal_width_meters", precision = 8, scale = 3)
    private BigDecimal internalWidthMeters;

    @Positive(message = "Internal height must be positive")
    @Column(name = "internal_height_meters", precision = 8, scale = 3)
    private BigDecimal internalHeightMeters;

    @Positive(message = "Container capacity must be positive")
    @Column(name = "capacity_cbm", precision = 10, scale = 2)
    private BigDecimal capacityCbm;

    @Positive(message = "Maximum cargo weight must be positive")
    @Column(name = "maximum_cargo_weight_kg", precision = 10, scale = 2)
    private BigDecimal maximumCargoWeightKg;

    @Positive(message = "Maximum total weight must be positive")
    @Column(name = "maximum_total_weight_kg", precision = 10, scale = 2)
    private BigDecimal maximumTotalWeightKg;

    @Column(name = "display_order", unique = true)
    private Integer displayOrder;

    public ContainerType(Long id) {
        this.id = id;
    }
}
