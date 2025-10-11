package com.freightquote.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.freightquote.ENUM.SeaFreightMode;
import com.freightquote.ENUM.ShippingType;
import com.freightquote.dto.ShippingRequirementDto;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "courier_rates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourierRate {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank(message = "Courier name is required")
	@Column(nullable = false)
	private String courierName;

	@ManyToOne
	@JoinColumn(name = "origin_location_id", nullable = false)
	private Location origin;

	@ManyToOne
	@JoinColumn(name = "destination_location_id", nullable = false)
	private Location destination;

	@NotNull(message = "Shipping type is required")
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ShippingType shippingType;

	@Enumerated(EnumType.STRING)
	private SeaFreightMode seaFreightMode; // Only for WATER shipping

	// Relationships to specific rate details
	@OneToOne(cascade = CascadeType.ALL, fetch = jakarta.persistence.FetchType.LAZY)
	private AirFreightRate airFreightDetails;

	@OneToOne(cascade = CascadeType.ALL, fetch = jakarta.persistence.FetchType.LAZY)
	private LCLFreightRate lclFreightDetails;

	@OneToMany(cascade = CascadeType.ALL, fetch = jakarta.persistence.FetchType.LAZY)
	@JoinColumn(name = "courier_rate_id")
	private List<FCLFreightRate> fclFreightDetails;

	@NotNull(message = "Effective from date is required")
	@Column(nullable = false)
	private LocalDate effectiveFrom;

	@NotNull(message = "Effective to date is required")
	@Column(nullable = false)
	private LocalDate effectiveTo;

	@Column(name = "is_active", nullable = false)
	private Boolean isActive = true; // Default to active

	@Column(name = "transit_days")
	private Integer transitDays;

	@Column(name = "weight_limit")
	private Double weightLimit; // in KG

	@Column(name = "dimension_limit")
	private String dimensionLimit; // e.g., "100x100x100 cm"

	@Column(length = 500)
	private String description;

	@Column(name = "created_at")
	private LocalDate createdAt;

	@Column(name = "updated_at")
	private LocalDate updatedAt;

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDate.now();
		updatedAt = LocalDate.now();
	}

	@PreUpdate
	protected void onUpdate() {
		updatedAt = LocalDate.now();
	}

	public BigDecimal getQuotation(ShippingRequirementDto requirements) {
		if (this.shippingType == ShippingType.AIR && this.airFreightDetails != null) {
			return this.airFreightDetails.getQuotation(requirements);
		} else if (this.shippingType == ShippingType.WATER && this.seaFreightMode == SeaFreightMode.FCL
				&& this.fclFreightDetails != null) {
			// For FCL, calculate total from all applicable container types
			BigDecimal totalQuotation = BigDecimal.ZERO;
			for (FCLFreightRate fclRate : this.fclFreightDetails) {
				BigDecimal containerQuotation = fclRate.getQuotation(requirements);
				if (containerQuotation != null) {
					totalQuotation = totalQuotation.add(containerQuotation);
				}
			}
			return totalQuotation.compareTo(BigDecimal.ZERO) > 0 ? totalQuotation : null;
		} else if (this.shippingType == ShippingType.WATER && this.seaFreightMode == SeaFreightMode.LCL
				&& this.lclFreightDetails != null) {
			return this.lclFreightDetails.getQuotation(requirements);
		}
		return null;
	}

	public void setCurrency(String currency) {
		if (this.shippingType == ShippingType.AIR && this.airFreightDetails != null) {
			this.airFreightDetails.setCurrency(currency);
		} else if (this.shippingType == ShippingType.WATER && this.seaFreightMode == SeaFreightMode.FCL
				&& this.fclFreightDetails != null) {
			// Set currency for all FCL rates
			for (FCLFreightRate fclRate : this.fclFreightDetails) {
				fclRate.setCurrency(currency);
			}
		} else if (this.shippingType == ShippingType.WATER && this.seaFreightMode == SeaFreightMode.LCL
				&& this.lclFreightDetails != null) {
			this.lclFreightDetails.setCurrency(currency);
		}
	}

	public String getCurrency() {
		if (this.shippingType == ShippingType.AIR && this.airFreightDetails != null) {
			return this.airFreightDetails.getCurrency();
		} else if (this.shippingType == ShippingType.WATER && this.seaFreightMode == SeaFreightMode.FCL
				&& this.fclFreightDetails != null && !this.fclFreightDetails.isEmpty()) {
			// Return currency from first FCL rate (assuming all have same currency)
			return this.fclFreightDetails.get(0).getCurrency();
		} else if (this.shippingType == ShippingType.WATER && this.seaFreightMode == SeaFreightMode.LCL
				&& this.lclFreightDetails != null) {
			return this.lclFreightDetails.getCurrency();
		}
		return null;
	}

	public BigDecimal getRate() {
		if (this.shippingType == ShippingType.AIR && this.airFreightDetails != null) {
			return this.airFreightDetails.getRate();
		} else if (this.shippingType == ShippingType.WATER && this.seaFreightMode == SeaFreightMode.FCL
				&& this.fclFreightDetails != null && !this.fclFreightDetails.isEmpty()) {
			// rate depends on container type, so not returning a single rate here
			return null;
		} else if (this.shippingType == ShippingType.WATER && this.seaFreightMode == SeaFreightMode.LCL
				&& this.lclFreightDetails != null) {
			return this.lclFreightDetails.getRate();
		}
		return null;
	}

	public void setRate(BigDecimal rate) {
		if (this.shippingType == ShippingType.AIR && this.airFreightDetails != null) {
			this.airFreightDetails.setRate(rate);
		} else if (this.shippingType == ShippingType.WATER && this.seaFreightMode == SeaFreightMode.FCL
				&& this.fclFreightDetails != null) {
			// rate depends on container type, so not setting a single rate here
		} else if (this.shippingType == ShippingType.WATER && this.seaFreightMode == SeaFreightMode.LCL
				&& this.lclFreightDetails != null) {
			this.lclFreightDetails.setRate(rate);
		}
	}

	public Map<Long, BigDecimal> getRatesForFCL() {
		if (this.shippingType == ShippingType.WATER && this.seaFreightMode == SeaFreightMode.FCL
				&& this.fclFreightDetails != null) {
			Map<Long, BigDecimal> ratesMap = new HashMap<>();
			for (FCLFreightRate fclRate : this.fclFreightDetails) {
				if (fclRate.getContainerType() != null) {
					ratesMap.put(fclRate.getContainerType().getId(), fclRate.getRate());
				}
			}
			return ratesMap;
		}
		return null;
	}

	// public void setRatesForFCL(Map<ContainerType, BigDecimal> ratesForFCL) {
	// 	if (this.shippingType == ShippingType.WATER && this.seaFreightMode == SeaFreightMode.FCL) {
  //       // Initialize fclFreightDetails if null
  //       if (this.fclFreightDetails == null) {
  //           this.fclFreightDetails = new ArrayList<>();
  //       }
        
  //       // Clear existing rates
  //       this.fclFreightDetails.clear();
        
  //       // Create new FCL rates for each container type
  //       for (Map.Entry<ContainerType, BigDecimal> entry : ratesForFCL.entrySet()) {
  //           FCLFreightRate fclRate = new FCLFreightRate();
  //           fclRate.setContainerType(entry.getKey());
  //           fclRate.setRate(entry.getValue());
  //           // Set other common properties if needed
  //           // fclRate.setCourierRate(this); // if back reference exists
  //           this.fclFreightDetails.add(fclRate);
  //       }
  //   }
	// }

	// Helper method to get FCL rate for specific container type
	public FCLFreightRate getFclRateForContainerType(Long containerTypeId) {
		if (this.fclFreightDetails != null) {
			return this.fclFreightDetails.stream()
					.filter(rate -> rate.getContainerType() != null &&
							rate.getContainerType().getId().equals(containerTypeId))
					.findFirst()
					.orElse(null);
		}
		return null;
	}

	// Helper method to add FCL rate for specific container type
	public void addFclRate(FCLFreightRate fclRate) {
		if (this.fclFreightDetails == null) {
			this.fclFreightDetails = new ArrayList<>();
		}
		// fclRate.setCourierRate(this); // Set the back reference
		this.fclFreightDetails.add(fclRate);
	}
}
