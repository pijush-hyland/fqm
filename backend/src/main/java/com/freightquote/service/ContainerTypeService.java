package com.freightquote.service;

import java.util.List;

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
        return toAdministrationOptions(containerTypeRepository.findByIsActiveTrue());
    }

    public List<AdministrationContainerOptionDto> searchAdministrationContainerOptions(String search) {
        return toAdministrationOptions(containerTypeRepository.searchContainerTypes(search.trim()));
    }
    
    public List<CustomerContainerOptionDto> getCustomerContainerOptions() {
        return containerTypeRepository
            .findByIsActiveTrueAndCodeInOrderByDisplayOrderAsc(CUSTOMER_FCL_OPTION_CODES).stream()
                .map(this::toCustomerOption)
                .toList();
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
            containerType.getTareWeightKg(),
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
    
}
