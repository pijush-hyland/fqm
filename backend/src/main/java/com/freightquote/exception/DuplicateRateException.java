package com.freightquote.exception;

/**
 * Exception thrown when attempting to create a duplicate courier rate
 */
public class DuplicateRateException extends RuntimeException {
    
    private final Long conflictingRateId;
    
    public DuplicateRateException(String message) {
        super(message);
        this.conflictingRateId = null;
    }
    
    public DuplicateRateException(String message, Long conflictingRateId) {
        super(message);
        this.conflictingRateId = conflictingRateId;
    }
    
    public Long getConflictingRateId() {
        return conflictingRateId;
    }
}
