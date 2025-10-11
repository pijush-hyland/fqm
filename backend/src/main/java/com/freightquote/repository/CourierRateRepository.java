package com.freightquote.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.freightquote.ENUM.SeaFreightMode;
import com.freightquote.ENUM.ShippingType;
import com.freightquote.entity.CourierRate;

@Repository
public interface CourierRateRepository extends JpaRepository<CourierRate, Long>, JpaSpecificationExecutor<CourierRate> {

	List<CourierRate> findByShippingType(ShippingType shippingType);

	List<CourierRate> findByShippingTypeAndSeaFreightMode(
		ShippingType shippingType,
		SeaFreightMode seaFreightMode);

	@Query("SELECT cr FROM CourierRate cr WHERE cr.effectiveFrom <= :date AND cr.effectiveTo >= :date")
	List<CourierRate> findActiveRatesOnDate(@Param("date") LocalDate date);

	@Query("SELECT cr FROM CourierRate cr WHERE " +
		"(:shippingType IS NULL OR cr.shippingType = :shippingType) AND " +
		"(:seaFreightMode IS NULL OR cr.seaFreightMode = :seaFreightMode) AND " +
		"(:origin IS NULL OR LOWER(cr.origin) LIKE LOWER(CONCAT('%', :origin, '%'))) AND " +
		"(:destination IS NULL OR LOWER(cr.destination) LIKE LOWER(CONCAT('%', :destination, '%'))) AND " +
		"cr.effectiveFrom <= :currentDate AND cr.effectiveTo >= :currentDate")
	List<CourierRate> findRatesWithFilters(
		@Param("shippingType") ShippingType shippingType,
		@Param("seaFreightMode") SeaFreightMode seaFreightMode,
		@Param("origin") String origin,
		@Param("destination") String destination,
		@Param("currentDate") LocalDate currentDate);

	@Query("SELECT cr FROM CourierRate cr WHERE " +
		"(:origin IS NULL OR LOWER(cr.origin) LIKE LOWER(CONCAT('%', :origin, '%'))) AND " +
		"(:destination IS NULL OR LOWER(cr.destination) LIKE LOWER(CONCAT('%', :destination, '%'))) AND " +
		"cr.effectiveFrom <= :currentDate AND cr.effectiveTo >= :currentDate")
	List<CourierRate> findRatesWithFilters(
		@Param("origin") String origin,
		@Param("destination") String destination,
		@Param("currentDate") LocalDate currentDate);

	@Query("SELECT cr FROM CourierRate cr WHERE " +
		"LOWER(cr.courierName) = LOWER(:courierName) AND " +
		"cr.origin.id = :originId AND " +
		"cr.destination.id = :destinationId AND " +
		"cr.shippingType = :shippingType AND " +
		"(:seaFreightMode IS NULL OR cr.seaFreightMode = :seaFreightMode) AND " +
		"NOT (cr.effectiveTo < :newEffectiveFrom OR cr.effectiveFrom > :newEffectiveTo)")
	List<CourierRate> findConflictingRates(
		@Param("courierName") String courierName,
		@Param("originId") Long originId,
		@Param("destinationId") Long destinationId,
		@Param("shippingType") ShippingType shippingType,
		@Param("seaFreightMode") SeaFreightMode seaFreightMode,
		@Param("newEffectiveFrom") LocalDate newEffectiveFrom,
		@Param("newEffectiveTo") LocalDate newEffectiveTo);

	@Query("SELECT cr FROM CourierRate cr " +
		"JOIN cr.fclFreightDetails fcl " +
		"WHERE LOWER(cr.courierName) = LOWER(:courierName) AND " +
		"cr.origin.id = :originId AND " +
		"cr.destination.id = :destinationId AND " +
		"cr.shippingType = com.freightquote.ENUM.ShippingType.WATER AND " +
		"cr.seaFreightMode = com.freightquote.ENUM.SeaFreightMode.FCL AND " +
		"fcl.containerType.id = :containerTypeId AND " +
		"NOT (cr.effectiveTo < :newEffectiveFrom OR cr.effectiveFrom > :newEffectiveTo)")
	List<CourierRate> findConflictingFCLRatesForContainerType(
		@Param("courierName") String courierName,
		@Param("originId") Long originId,
		@Param("destinationId") Long destinationId,
		@Param("containerTypeId") Long containerTypeId,
		@Param("newEffectiveFrom") LocalDate newEffectiveFrom,
		@Param("newEffectiveTo") LocalDate newEffectiveTo);
}
