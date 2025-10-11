package com.freightquote.entity;

import java.math.BigDecimal;

import com.freightquote.dto.ShippingRequirementDto;

public interface Quotable {
    BigDecimal getQuotation(ShippingRequirementDto requirements);
}
