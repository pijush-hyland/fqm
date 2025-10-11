package com.freightquote.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.freightquote.entity.ContainerType;

@Repository
public interface ContainerTypeRepository extends JpaRepository<ContainerType, Long> {
    
    Optional<ContainerType> findByCode(String code);
    
    List<ContainerType> findByIsActiveTrue();
    
    @Query("SELECT ct FROM ContainerType ct WHERE " +
           "ct.isActive = true AND " +
           "ct.maxPayloadKG >= :weight AND " +
           "ct.volumeCBM >= :volume " +
           "ORDER BY ct.volumeCBM ASC")
    List<ContainerType> findSuitableContainers(
        @Param("weight") Double weight, 
        @Param("volume") Double volume
    );
    
    @Query("SELECT ct FROM ContainerType ct WHERE " +
           "LOWER(ct.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(ct.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(ct.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<ContainerType> searchContainerTypes(@Param("search") String search);
    
    @Query("SELECT ct FROM ContainerType ct WHERE ct.isActive = true ORDER BY ct.volumeCBM ASC")
    List<ContainerType> findAllActiveOrderByCbm();
    
    boolean existsByCode(String code);
}
