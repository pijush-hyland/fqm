package com.freightquote.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.freightquote.dto.AdministrationContainerOptionDto;
import com.freightquote.dto.CustomerContainerOptionDto;
import com.freightquote.dto.CustomerContainerOptionDto.InternalDimensionsMeters;
import com.freightquote.entity.ContainerType;
import com.freightquote.repository.ContainerTypeRepository;

@Service
public class ContainerTypeService {

    private static final List<String> CUSTOMER_FCL_OPTION_CODES =
            List.of("20GP", "40GP", "20OT", "40HC", "40OT", "20TK");
    
    @Autowired
    private ContainerTypeRepository containerTypeRepository;
    
    public List<AdministrationContainerOptionDto> getAdministrationContainerOptions() {
        return toAdministrationOptions(containerTypeRepository.findAll());
    }

    public List<AdministrationContainerOptionDto> getActiveAdministrationContainerOptions() {
        return toAdministrationOptions(containerTypeRepository.findAllActiveOrderByCbm());
    }

    public List<AdministrationContainerOptionDto> searchAdministrationContainerOptions(String search) {
        return toAdministrationOptions(containerTypeRepository.searchContainerTypes(search.trim()));
    }
    
    public List<ContainerType> getActiveContainerTypes() {
        return containerTypeRepository.findByIsActiveTrue();
    }

    public List<CustomerContainerOptionDto> getCustomerContainerOptions() {
        return containerTypeRepository
            .findByIsActiveTrueAndCodeInOrderByDisplayOrderAsc(CUSTOMER_FCL_OPTION_CODES).stream()
                .map(this::toCustomerOption)
                .toList();
    }
    
    public List<ContainerType> getActiveContainerTypesOrderedByCbm() {
        return containerTypeRepository.findAllActiveOrderByCbm();
    }
    
    public Optional<ContainerType> getContainerTypeById(Long id) {
        return containerTypeRepository.findById(id);
    }
    
    public Optional<ContainerType> getContainerTypeByCode(String code) {
        return containerTypeRepository.findByCode(code);
    }
    
    public List<ContainerType> findSuitableContainers(Double weightKG, Double volumeCBM) {
        if (weightKG == null || volumeCBM == null) {
            return getActiveContainerTypes();
        }
        return containerTypeRepository.findSuitableContainers(weightKG, volumeCBM);
    }
    
    public List<ContainerType> searchContainerTypes(String search) {
        if (search == null || search.trim().isEmpty()) {
            return getActiveContainerTypes();
        }
        return containerTypeRepository.searchContainerTypes(search.trim());
    }
    
    public ContainerType saveContainerType(ContainerType containerType) {
        validateContainerType(containerType);
        calculateDerivedValues(containerType);
        return containerTypeRepository.save(containerType);
    }
    
    public void deleteContainerType(Long id) {
        containerTypeRepository.deleteById(id);
    }
    
    public boolean existsByCode(String code) {
        return containerTypeRepository.existsByCode(code);
    }

    private CustomerContainerOptionDto toCustomerOption(ContainerType containerType) {
        return new CustomerContainerOptionDto(
            containerType.getId(),
            containerType.getCode(),
            containerType.getName(),
            internalDimensions(containerType),
            containerType.getCapacityCbm(),
            containerType.getMaximumCargoWeightKg());
        }

        private List<AdministrationContainerOptionDto> toAdministrationOptions(List<ContainerType> containerTypes) {
        return containerTypes.stream()
            .map(this::toAdministrationOption)
            .sorted(java.util.Comparator
                .comparing(AdministrationContainerOptionDto::displayOrder,
                    java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder()))
                .thenComparing(AdministrationContainerOptionDto::code))
            .toList();
        }

        private AdministrationContainerOptionDto toAdministrationOption(ContainerType containerType) {
        return new AdministrationContainerOptionDto(
            containerType.getId(),
            containerType.getCode(),
            containerType.getName(),
            containerType.getDescription(),
            internalDimensions(containerType),
            containerType.getCapacityCbm(),
            containerType.getTareWeightKG(),
            containerType.getMaximumCargoWeightKg(),
            containerType.getMaximumTotalWeightKg(),
            containerType.getIsActive(),
            containerType.getIsRefrigerated(),
            containerType.getDisplayOrder());
        }

        private InternalDimensionsMeters internalDimensions(ContainerType containerType) {
        InternalDimensionsMeters dimensions = null;
        if (containerType.getInternalLengthMeters() != null
                && containerType.getInternalWidthMeters() != null
                && containerType.getInternalHeightMeters() != null) {
            dimensions = new InternalDimensionsMeters(
                    containerType.getInternalLengthMeters(),
                    containerType.getInternalWidthMeters(),
                    containerType.getInternalHeightMeters());
        }
                return dimensions;
    }
    
    public Double calculateVolumeWeight(Double volumeCBM, Double volumetricFactor) {
        if (volumeCBM == null || volumetricFactor == null) {
            return null;
        }
        return volumeCBM * volumetricFactor;
    }
    
    public Double calculateChargeableWeight(Double grossWeightKG, Double volumeWeightKG) {
        if (grossWeightKG == null && volumeWeightKG == null) {
            return null;
        }
        if (grossWeightKG == null) return volumeWeightKG;
        if (volumeWeightKG == null) return grossWeightKG;
        return Math.max(grossWeightKG, volumeWeightKG);
    }
    
    private void validateContainerType(ContainerType containerType) {
        if (containerType.getCode() == null || containerType.getCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Container type code is required");
        }
        
        if (containerType.getName() == null || containerType.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Container type name is required");
        }
        
        if (containerType.getLengthMeters() == null || containerType.getLengthMeters().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Length must be positive");
        }
        
        if (containerType.getWidthMeters() == null || containerType.getWidthMeters().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Width must be positive");
        }
        
        if (containerType.getHeightMeters() == null || containerType.getHeightMeters().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Height must be positive");
        }
        
        if (containerType.getMaxGrossWeightKG() == null || containerType.getMaxGrossWeightKG().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Max gross weight must be positive");
        }
        
        if (containerType.getTareWeightKG() == null || containerType.getTareWeightKG().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Tare weight must be positive");
        }
        
        // Check for duplicate code (excluding current container if updating)
        if (containerType.getId() == null) {
            if (existsByCode(containerType.getCode())) {
                throw new IllegalArgumentException("Container type code already exists: " + containerType.getCode());
            }
        }
    }
    
    private void calculateDerivedValues(ContainerType containerType) {
        // Calculate CBM capacity (length x width x height)
        BigDecimal cbm = containerType.getLengthMeters()
            .multiply(containerType.getWidthMeters())
            .multiply(containerType.getHeightMeters());
        containerType.setVolumeCBM(cbm);
        
        // Calculate max payload (max gross weight - tare weight)
        BigDecimal maxPayload = containerType.getMaxGrossWeightKG().subtract(containerType.getTareWeightKG());
        containerType.setMaxPayloadKG(maxPayload);
    }
}
