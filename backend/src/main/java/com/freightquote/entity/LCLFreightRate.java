package com.freightquote.entity;

import java.math.BigDecimal;

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
@Table(name = "lcl_freight_rates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LCLFreightRate implements Quotable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Inherited from Rate class
    @Column(name = "rate", precision = 10, scale = 2, nullable = false)
    private BigDecimal rate;

    @Column(name = "currency", length = 3)
    private String currency = "INR";

    // Inherited from SeaFreightRate class
    @Column(name = "documentation_fee", precision = 10, scale = 2)
    private BigDecimal documentationFee = BigDecimal.valueOf(0);

    @Column(name = "bunker_adjustment_rate", precision = 5, scale = 4)
    private BigDecimal bunkerAdjustmentRate = BigDecimal.valueOf(0);

    @Column(name = "description", length = 500)
    private String description;

    // LCL-specific properties
    @Column(name = "lcl_service_charge", precision = 10, scale = 2)
    private BigDecimal lclServiceCharge = BigDecimal.valueOf(0); // For LCL

    @Override
    public BigDecimal getQuotation(ShippingRequirementDto requirements) {
        // LCL pricing uses Weight/Measurement (W/M) calculation
        if (getRate() == null || requirements == null) {
            return BigDecimal.ZERO;
        }
        
        // Calculate chargeable volume using W/M method
        BigDecimal chargeableVolume = calculateChargeableVolume(requirements);
        
        // Base freight calculation: rate per CBM * chargeable volume
        BigDecimal baseFreight = getRate().multiply(chargeableVolume);
        
        // Add documentation fee if applicable
        if (getDocumentationFee() != null) {
            baseFreight = baseFreight.add(getDocumentationFee());
        }
        
        // Add LCL service charge if applicable
        if (getLclServiceCharge() != null) {
            baseFreight = baseFreight.add(getLclServiceCharge());
        }
        
        // Apply bunker adjustment if applicable
        if (getBunkerAdjustmentRate() != null) {
            BigDecimal bunkerCharge = baseFreight.multiply(getBunkerAdjustmentRate());
            baseFreight = baseFreight.add(bunkerCharge);
        }
        
        return baseFreight;
    }
    
    /**
     * Calculate chargeable volume using Weight/Measurement (W/M) method
     * Takes the higher of actual volume or volumetric weight (weight/1000 for sea freight)
     */
    private BigDecimal calculateChargeableVolume(ShippingRequirementDto requirements) {
        BigDecimal actualVolume = BigDecimal.ZERO;
        BigDecimal volumetricWeight = BigDecimal.ZERO;
        
        // Get actual volume in CBM
        if (requirements.getVolumeCBM() != null && requirements.getVolumeCBM() > 0) {
            actualVolume = BigDecimal.valueOf(requirements.getVolumeCBM());
        }
        
        // Calculate volumetric weight (for sea freight: weight in kg / 1000)
        if (requirements.getGrossWeightKG() != null && requirements.getGrossWeightKG() > 0) {
            volumetricWeight = BigDecimal.valueOf(requirements.getGrossWeightKG()).divide(BigDecimal.valueOf(1000));
        }
        
        // Use the higher of actual volume or volumetric weight (W/M method)
        return actualVolume.max(volumetricWeight);
    }
}
