package com.freightquote.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.freightquote.entity.Location;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {

	Optional<Location> findByCode(String code);

	List<Location> findByCountryCode(String countryCode);

	List<Location> findByType(Location.Type type);

	@Query("SELECT l FROM Location l WHERE l.type = :Type AND l.countryCode = :countryCode")
	List<Location> findByTypeAndCountryCode(
			@Param("Type") Location.Type Type,
			@Param("countryCode") String countryCode);

	@Query("SELECT l FROM Location l WHERE " +
			"LOWER(l.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
			"LOWER(l.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
			"LOWER(l.country) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
			"LOWER(l.countryCode) LIKE LOWER(CONCAT('%', :search, '%')) ")
	List<Location> searchLocations(@Param("search") String search);

	@Query("SELECT DISTINCT l.countryCode FROM Location l ORDER BY l.countryCode")
	List<String> findDistinctCountryCodes();

	@Query("SELECT l FROM Location l WHERE " +
			"(:search IS NULL OR :search = '' OR " +
			"LOWER(l.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
			"LOWER(l.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
			"LOWER(l.country) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
			"LOWER(l.countryCode) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
			"(:countryCode IS NULL OR :countryCode = '' OR LOWER(l.countryCode) = LOWER(:countryCode)) AND " +
			"(:type IS NULL OR l.type = :type)")
	List<Location> findByMultipleFilters(@Param("search") String search,
			@Param("countryCode") String countryCode,
			@Param("type") Location.Type type);

	boolean existsByCode(String code);
}
