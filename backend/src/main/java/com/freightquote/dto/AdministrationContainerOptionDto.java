package com.freightquote.dto;

import java.math.BigDecimal;

public record AdministrationContainerOptionDto(
        Long id,
        String code,
        String name,
        String description,
        CustomerContainerOptionDto.InternalDimensionsMeters internalDimensionsMeters,
        BigDecimal capacityCbm,
        BigDecimal tareWeightKg,
        BigDecimal maximumCargoWeightKg,
        BigDecimal maximumTotalWeightKg,
        Boolean active,
        Boolean refrigerated,
        Integer displayOrder) {
}