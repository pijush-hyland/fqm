package com.freightquote.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.freightquote.entity.ContainerType;

@Repository
public interface ContainerTypeRepository extends JpaRepository<ContainerType, Long> {
    
    List<ContainerType> findByIdIn(List<Long> ids);
    
    List<ContainerType> findByIsActiveTrue();

    List<ContainerType> findByIsActiveTrueAndCodeInOrderByDisplayOrderAsc(List<String> codes);
    
    @Query("SELECT ct FROM ContainerType ct WHERE " +
           "LOWER(ct.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(ct.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(ct.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<ContainerType> searchContainerTypes(@Param("search") String search);
}
