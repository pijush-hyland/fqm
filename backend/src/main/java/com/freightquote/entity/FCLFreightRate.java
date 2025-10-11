package com.freightquote.entity;

import java.math.BigDecimal;
import java.util.Map;

import com.freightquote.dto.ShippingRequirementDto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "fcl_freight_rates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FCLFreightRate implements Quotable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Base rate properties
    @Column(name = "rate", precision = 10, scale = 2, nullable = false)
    private BigDecimal rate;

    @Column(name = "currency", length = 3)
    private String currency = "INR";

    // Sea freight properties
    @Column(name = "documentation_fee", precision = 10, scale = 2)
    private BigDecimal documentationFee = BigDecimal.valueOf(0);

    @Column(name = "bunker_adjustment_rate", precision = 5, scale = 4)
    private BigDecimal bunkerAdjustmentRate = BigDecimal.valueOf(0);

    @Column(name = "description", length = 500)
    private String description;

    // FCL-specific properties
    @ManyToOne
    @JoinColumn(name = "container_type_id")
    private ContainerType containerType; // 20ft, 40ft, 40ft HC

    @Column(name = "terminal_handling_charge", precision = 10, scale = 2)
    private BigDecimal terminalHandlingCharge = BigDecimal.valueOf(0);

    @Override
    public BigDecimal getQuotation(ShippingRequirementDto requirements) {
        // FCL quotation calculation using base rate
        if (getRate() == null || requirements == null) {
            return BigDecimal.ZERO;
        }

        // For FCL, we need to check if this rate applies to any requested container types
        Map<Long, Integer> containerCountMap = requirements.getContainerCount();
        if (containerCountMap == null || containerCountMap.isEmpty()) {
            return BigDecimal.ZERO; // No containers requested
        }

        // Check if this FCL rate applies to any of the requested container types
        Long thisContainerTypeId = (getContainerType() != null) ? getContainerType().getId() : null;
        if (thisContainerTypeId == null) {
            return BigDecimal.ZERO; // This rate doesn't have a container type
        }

        // Get the count for this specific container type
        Integer containerCount = containerCountMap.get(thisContainerTypeId);
        if (containerCount == null || containerCount <= 0) {
            return BigDecimal.ZERO; // No containers of this type requested
        }

        // Calculate base quote for the requested number of containers of this type
        BigDecimal baseQuote = getRate().multiply(BigDecimal.valueOf(containerCount));

        // Add documentation fee if applicable (usually once per shipment, not per container)
        if (getDocumentationFee() != null) {
            baseQuote = baseQuote.add(getDocumentationFee());
        }
        
        // Add terminal handling charge for FCL (per container)
        if (getTerminalHandlingCharge() != null) {
            baseQuote = baseQuote.add(getTerminalHandlingCharge().multiply(BigDecimal.valueOf(containerCount)));
        }
        
        // Apply bunker adjustment if applicable (percentage of base rate per container)
        if (getBunkerAdjustmentRate() != null && getRate() != null) {
            BigDecimal bunkerCharge = getRate().multiply(getBunkerAdjustmentRate()).multiply(BigDecimal.valueOf(containerCount));
            baseQuote = baseQuote.add(bunkerCharge);
        }
        
        return baseQuote;
    }
}
