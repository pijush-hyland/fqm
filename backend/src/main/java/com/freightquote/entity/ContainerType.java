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
    
    @Positive(message = "Length must be positive")
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal lengthMeters;
    
    @Positive(message = "Width must be positive")
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal widthMeters;
    
    @Positive(message = "Height must be positive")
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal heightMeters;
    
    @Positive(message = "Volume must be positive")
    @Column(nullable = false, precision = 8, scale = 3)
    private BigDecimal volumeCBM; // Cubic Meters
    
    @Positive(message = "Max gross weight must be positive")
    @Column(name = "max_gross_weight_kg", nullable = false, precision = 8, scale = 2)
    private BigDecimal maxGrossWeightKG;
    
    @Positive(message = "Tare weight must be positive")
    @Column(name = "tare_weight_kg", nullable = false, precision = 8, scale = 2)
    private BigDecimal tareWeightKG;
    
    @Positive(message = "Payload must be positive")
    @Column(name = "max_payload_kg", nullable = false, precision = 8, scale = 2)
    private BigDecimal maxPayloadKG;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "is_refrigerated")
    private Boolean isRefrigerated = false;

    public ContainerType(Long id) {
        this.id = id;
    }
}
