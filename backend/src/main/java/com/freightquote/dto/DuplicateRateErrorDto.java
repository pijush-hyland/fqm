package com.freightquote.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Extended error response for duplicate rate conflicts
 */
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class DuplicateRateErrorDto extends ErrorResponseDto {
    
    private Long conflictingRateId;
    private String suggestion;
    
    public DuplicateRateErrorDto(int status, String error, String message, String path, 
                                Long conflictingRateId, String suggestion) {
        super(status, error, message, path);
        this.conflictingRateId = conflictingRateId;
        this.suggestion = suggestion;
    }
}
