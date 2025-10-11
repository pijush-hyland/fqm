package com.freightquote.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.freightquote.ENUM.SeaFreightMode;
import com.freightquote.ENUM.ShippingType;
import com.freightquote.entity.AirFreightRate;
import com.freightquote.entity.ContainerType;
import com.freightquote.entity.CourierRate;
import com.freightquote.entity.FCLFreightRate;
import com.freightquote.entity.LCLFreightRate;
import com.freightquote.entity.Location;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourierRateDto {

	// CourierRate fields
	private Long id;

	@NotBlank(message = "Courier name is required")
	private String courierName;

	@NotNull(message = "Origin is required")
	private Location origin;

	@NotNull(message = "Destination is required")
	private Location destination;

	@NotNull(message = "Shipping type is required")
	private ShippingType shippingType;

	private SeaFreightMode seaFreightMode;

	@NotNull(message = "Effective from date is required")
	private LocalDate effectiveFrom;

	@NotNull(message = "Effective to date is required")
	private LocalDate effectiveTo;

	private Boolean isActive = true; // Default to active

	private Integer transitDays;
	private Double weightLimit;
	private String dimensionLimit;
	private String description;
	private LocalDate createdAt;
	private LocalDate updatedAt;

	// Rate fields (base class)
	@Positive(message = "Rate must be positive")
	private BigDecimal rate;

	private Map<Long, BigDecimal> ratesForFCL;

	private String currency = "INR";

	// SeaFreightRate fields
	private BigDecimal documentationFee;
	private BigDecimal bunkerAdjustmentRate;

	// AirFreightRate fields
	private BigDecimal minimumCharge;
	private BigDecimal fuelSurchargeRate;
	private BigDecimal securitySurcharge;
	private Double airWeightLimit;
	private String airDescription;

	// LCLFreightRate fields
	private BigDecimal lclServiceCharge;

	// FCLFreightRate fields
	private BigDecimal terminalHandlingCharge;

	public CourierRateDto(CourierRate courierRate) {
		this.id = courierRate.getId();
		this.courierName = courierRate.getCourierName();
		this.origin = courierRate.getOrigin();
		this.destination = courierRate.getDestination();
		this.shippingType = courierRate.getShippingType();
		this.seaFreightMode = courierRate.getSeaFreightMode();
		this.effectiveFrom = courierRate.getEffectiveFrom();
		this.effectiveTo = courierRate.getEffectiveTo();
		this.isActive = courierRate.getIsActive();
		this.transitDays = courierRate.getTransitDays();
		this.weightLimit = courierRate.getWeightLimit();
		this.dimensionLimit = courierRate.getDimensionLimit();
		this.description = courierRate.getDescription();
		this.createdAt = courierRate.getCreatedAt();
		this.updatedAt = courierRate.getUpdatedAt();
		this.rate = courierRate.getRate();
		this.currency = courierRate.getCurrency();

		// Populate shipping-type specific fields
		if (courierRate.getShippingType() == ShippingType.AIR && courierRate.getAirFreightDetails() != null) {
			var airDetails = courierRate.getAirFreightDetails();
			this.minimumCharge = airDetails.getMinimumCharge();
			this.fuelSurchargeRate = airDetails.getFuelSurchargeRate();
			this.securitySurcharge = airDetails.getSecuritySurcharge();
			this.airWeightLimit = airDetails.getWeightLimit();
			this.airDescription = airDetails.getDescription();
		} else if (courierRate.getShippingType() == ShippingType.WATER) {
			if (courierRate.getSeaFreightMode() == SeaFreightMode.FCL && courierRate.getFclFreightDetails() != null) {
				var fclDetails = courierRate.getFclFreightDetails().get(0);
				this.documentationFee = fclDetails.getDocumentationFee();
				this.bunkerAdjustmentRate = fclDetails.getBunkerAdjustmentRate();
				this.terminalHandlingCharge = fclDetails.getTerminalHandlingCharge();
				this.ratesForFCL = courierRate.getRatesForFCL();
			} else if (courierRate.getSeaFreightMode() == SeaFreightMode.LCL && courierRate.getLclFreightDetails() != null) {
				var lclDetails = courierRate.getLclFreightDetails();
				this.documentationFee = lclDetails.getDocumentationFee();
				this.bunkerAdjustmentRate = lclDetails.getBunkerAdjustmentRate();
				// Note: The lclServiceCharge getter will be available once the entity
				// relationships are properly established
				// this.lclServiceCharge = lclDetails.getLclServiceCharge();
			}
		}
	}

	public CourierRate toEntity() {
		CourierRate entity = new CourierRate();
		entity.setId(this.id);
		entity.setCourierName(this.courierName);
		entity.setOrigin(this.origin);
		entity.setDestination(this.destination);
		entity.setShippingType(this.shippingType);
		entity.setSeaFreightMode(this.seaFreightMode);
		entity.setEffectiveFrom(this.effectiveFrom);
		entity.setEffectiveTo(this.effectiveTo);
		entity.setIsActive(this.isActive != null ? this.isActive : Boolean.TRUE); // Default to true
		entity.setTransitDays(this.transitDays);
		entity.setWeightLimit(this.weightLimit);
		entity.setDimensionLimit(this.dimensionLimit);
		entity.setDescription(this.description);
		entity.setCreatedAt(this.createdAt);
		entity.setUpdatedAt(this.updatedAt);

		// Create and set shipping-type specific freight details
		if (this.shippingType == ShippingType.AIR) {
			entity.setAirFreightDetails(toAirFreightRate());
		} else if (this.shippingType == ShippingType.WATER && this.seaFreightMode == SeaFreightMode.FCL) {
			entity.setFclFreightDetails(toFCLFreightRate());
		} else if (this.shippingType == ShippingType.WATER && this.seaFreightMode == SeaFreightMode.LCL) {
			entity.setLclFreightDetails(toLCLFreightRate());
		}

		return entity;
	}

	/**
	 * Convert AirFreightRate entity from DTO fields
	 */
	private AirFreightRate toAirFreightRate() {
		AirFreightRate airRate = new AirFreightRate();
		if (airRate.getId() != null) {
			airRate.setId(this.id);
		}
		airRate.setRate(this.rate);
		airRate.setCurrency(this.currency == null ? "INR" : this.currency);
		airRate.setMinimumCharge(this.minimumCharge != null ? this.minimumCharge : BigDecimal.valueOf(0));
		airRate.setFuelSurchargeRate(this.fuelSurchargeRate != null ? this.fuelSurchargeRate : BigDecimal.valueOf(0));
		airRate.setSecuritySurcharge(this.securitySurcharge != null ? this.securitySurcharge : BigDecimal.valueOf(0));
		airRate.setWeightLimit(this.airWeightLimit);
		airRate.setDescription(this.airDescription);
		return airRate;
	}

	/**
	 * Convert FCLFreightRate entity from DTO fields
	 */
	private List<FCLFreightRate> toFCLFreightRate() {
		List<FCLFreightRate> fclRates = new ArrayList<>();

		for(Long containerType : this.ratesForFCL.keySet()) {
			FCLFreightRate fclRate = new FCLFreightRate();
			if (fclRate.getId() != null) {
				fclRate.setId(this.id);
			}
			fclRate.setRate(this.ratesForFCL.get(containerType));
			fclRate.setCurrency(this.currency == null ? "INR" : this.currency);
			fclRate.setDocumentationFee(this.documentationFee != null ? this.documentationFee : BigDecimal.valueOf(0));
			fclRate
					.setBunkerAdjustmentRate(this.bunkerAdjustmentRate != null ? this.bunkerAdjustmentRate : BigDecimal.valueOf(0));
			fclRate.setContainerType(new ContainerType(containerType));
			fclRate.setTerminalHandlingCharge(
					this.terminalHandlingCharge != null ? this.terminalHandlingCharge : BigDecimal.valueOf(0));
			fclRate.setDescription(this.description);
			fclRates.add(fclRate);
		}

		return fclRates;
	}

	/**
	 * convert LCLFreightRate entity from DTO fields
	 */
	private LCLFreightRate toLCLFreightRate() {
		LCLFreightRate lclRate = new LCLFreightRate();
		if (lclRate.getId() != null) {
			lclRate.setId(this.id);
		}
		lclRate.setRate(this.rate);
		lclRate.setCurrency(this.currency == null ? "INR" : this.currency);
		lclRate.setDocumentationFee(this.documentationFee != null ? this.documentationFee : BigDecimal.valueOf(0));
		lclRate
				.setBunkerAdjustmentRate(this.bunkerAdjustmentRate != null ? this.bunkerAdjustmentRate : BigDecimal.valueOf(0));
		lclRate.setLclServiceCharge(this.lclServiceCharge != null ? this.lclServiceCharge : BigDecimal.valueOf(0));
		lclRate.setDescription(this.description);
		return lclRate;
	}
}
