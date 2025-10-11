package com.freightquote.entity;

import java.math.BigDecimal;

import com.freightquote.ENUM.ShippingType;
import com.freightquote.dto.ShippingRequirementDto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "air_freight_rates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AirFreightRate implements Quotable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Inherited from Rate class
    @Column(name = "rate", precision = 10, scale = 2, nullable = false)
    private BigDecimal rate;

    @Column(name = "currency", length = 3)
    private String currency = "INR";

    // Air freight specific properties
    @Column(name = "minimum_charge", precision = 10, scale = 2)
    private BigDecimal minimumCharge = BigDecimal.valueOf(0); // Default minimum
    
    @Column(name = "fuel_surcharge_rate", precision = 5, scale = 4)
    private BigDecimal fuelSurchargeRate = BigDecimal.valueOf(0); // Default 0%
    
    @Column(name = "security_surcharge", precision = 10, scale = 2)
    private BigDecimal securitySurcharge = BigDecimal.valueOf(0); // Default $0
    
    @Column(name = "weight_limit")
    private Double weightLimit; // Maximum weight in KG
    
    @Column(length = 500)
    private String description;
    
    public ShippingType getShippingType() {
        return ShippingType.AIR;
    }

    @Override
    public BigDecimal getQuotation(ShippingRequirementDto requirements) {
        // Air freight pricing uses Weight/Measurement (W/M) calculation with higher volumetric factor
        if (getRate() == null || requirements == null) {
            return BigDecimal.ZERO;
        }
        
        // Calculate chargeable weight using W/M method for air freight
        BigDecimal chargeableWeight = calculateChargeableWeight(requirements);
        
        // Base freight calculation: rate per kg * chargeable weight
        BigDecimal baseFreight = getRate().multiply(chargeableWeight);
        
        // Apply minimum charge if base freight is below minimum
        if (minimumCharge != null && baseFreight.compareTo(minimumCharge) < 0) {
            baseFreight = minimumCharge;
        }
        
        // Add fuel surcharge if applicable
        if (fuelSurchargeRate != null) {
            BigDecimal fuelCharge = baseFreight.multiply(fuelSurchargeRate);
            baseFreight = baseFreight.add(fuelCharge);
        }
        
        // Add security surcharge if applicable
        if (securitySurcharge != null) {
            baseFreight = baseFreight.add(securitySurcharge);
        }
        
        return baseFreight;
    }
    
    /**
     * Calculate chargeable weight using Weight/Measurement (W/M) method for air freight
     * Takes the higher of actual weight or volumetric weight (volume * 167 for air freight)
     */
    private BigDecimal calculateChargeableWeight(ShippingRequirementDto requirements) {
        BigDecimal actualWeight = BigDecimal.ZERO;
        BigDecimal volumetricWeight = BigDecimal.ZERO;
        
        // Get actual weight in KG
        if (requirements.getGrossWeightKG() != null && requirements.getGrossWeightKG() > 0) {
            actualWeight = BigDecimal.valueOf(requirements.getGrossWeightKG());
        }
        
        // Calculate volumetric weight (for air freight: volume in CBM * 167)
        // Industry standard: 6000 cubic cm per kg = 167 kg per CBM
        if (requirements.getVolumeCBM() != null && requirements.getVolumeCBM() > 0) {
            volumetricWeight = BigDecimal.valueOf(requirements.getVolumeCBM()).multiply(BigDecimal.valueOf(167));
        }
        
        // Use the higher of actual weight or volumetric weight (W/M method)
        return actualWeight.max(volumetricWeight);
    }
}
