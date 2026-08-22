package com.freightquote.dto;

import java.math.BigDecimal;

public record CustomerContainerOptionDto(
        Long id,
        String code,
        String name,
        InternalDimensionsMeters internalDimensionsMeters,
        BigDecimal capacityCbm,
        BigDecimal maximumCargoWeightKg) {

    public record InternalDimensionsMeters(
            BigDecimal length,
            BigDecimal width,
            BigDecimal height) {
    }
}