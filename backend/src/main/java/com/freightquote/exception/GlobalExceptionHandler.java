package com.freightquote.exception;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import com.freightquote.dto.DuplicateRateErrorDto;
import com.freightquote.dto.ErrorResponseDto;
import com.freightquote.dto.InvalidContainerSelectionErrorDto;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;

import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String INVALID_CONTAINER_SELECTION = "INVALID_CONTAINER_SELECTION";

    @ExceptionHandler(InvalidContainerSelectionException.class)
    public ResponseEntity<InvalidContainerSelectionErrorDto> handleInvalidContainerSelection(
            InvalidContainerSelectionException ex, WebRequest request) {
        InvalidContainerSelectionErrorDto errorResponse = new InvalidContainerSelectionErrorDto(
                HttpStatus.BAD_REQUEST.value(),
                INVALID_CONTAINER_SELECTION,
                ex.getMessage(),
                ex.getContainerIds(),
                request.getDescription(false).replace("uri=", ""),
                LocalDateTime.now());

        return ResponseEntity.badRequest().body(errorResponse);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> handleUnreadableRequest(
            HttpMessageNotReadableException ex, WebRequest request) {
        InvalidFormatException invalidFormat = findCause(ex, InvalidFormatException.class);
        if (invalidFormat == null || invalidFormat.getPath().stream()
            .noneMatch(reference -> "containerCount".equals(reference.getFieldName()))) {
            ErrorResponseDto errorResponse = new ErrorResponseDto(
                    HttpStatus.BAD_REQUEST.value(),
                    "Bad Request",
                    "Request body is malformed",
                    request.getDescription(false).replace("uri=", ""));
            return ResponseEntity.badRequest().body(errorResponse);
        }

        InvalidContainerSelectionErrorDto errorResponse = new InvalidContainerSelectionErrorDto(
                HttpStatus.BAD_REQUEST.value(),
                INVALID_CONTAINER_SELECTION,
                "Invalid FCL Container Option selection",
                List.of(offendingContainerId(invalidFormat)),
                request.getDescription(false).replace("uri=", ""),
                LocalDateTime.now());
        return ResponseEntity.badRequest().body(errorResponse);
    }

    private String offendingContainerId(InvalidFormatException invalidFormat) {
        String nestedMapKey = null;
        for (com.fasterxml.jackson.databind.JsonMappingException.Reference reference : invalidFormat.getPath()) {
            String fieldName = reference.getFieldName();
            if (fieldName != null && !"containerCount".equals(fieldName)) {
                nestedMapKey = fieldName;
            }
        }
        return nestedMapKey != null ? nestedMapKey : String.valueOf(invalidFormat.getValue());
    }

    private <T extends Throwable> T findCause(Throwable throwable, Class<T> causeType) {
        Throwable current = throwable;
        while (current != null) {
            if (causeType.isInstance(current)) {
                return causeType.cast(current);
            }
            current = current.getCause();
        }
        return null;
    }
    
    /**
     * Handle DuplicateRateException (specific business logic for rate conflicts)
     */
    @ExceptionHandler(DuplicateRateException.class)
    public ResponseEntity<DuplicateRateErrorDto> handleDuplicateRateException(
            DuplicateRateException ex, WebRequest request) {
        
        String suggestion = "Please check the existing rate or adjust the effective dates to avoid overlap.";
        if (ex.getConflictingRateId() != null) {
            suggestion += " You can update the existing rate with ID: " + ex.getConflictingRateId();
        }
        
        DuplicateRateErrorDto errorResponse = new DuplicateRateErrorDto(
            HttpStatus.CONFLICT.value(),
            "Duplicate Rate Conflict",
            ex.getMessage(),
            request.getDescription(false).replace("uri=", ""),
            ex.getConflictingRateId(),
            suggestion
        );
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }
    
    /**
     * Handle IllegalArgumentException (business logic violations)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDto> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {
        
        ErrorResponseDto errorResponse = new ErrorResponseDto(
            HttpStatus.CONFLICT.value(),
            "Conflict",
            ex.getMessage(),
            request.getDescription(false).replace("uri=", "")
        );
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }
    
    /**
     * Handle validation errors from @Valid annotations
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDto> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {
        
        StringBuilder message = new StringBuilder("Validation failed: ");
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            message.append(error.getField()).append(" - ").append(error.getDefaultMessage()).append("; ");
        }
        
        ErrorResponseDto errorResponse = new ErrorResponseDto(
            HttpStatus.BAD_REQUEST.value(),
            "Bad Request",
            message.toString().trim(),
            request.getDescription(false).replace("uri=", "")
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }
    
    /**
     * Handle constraint violation exceptions
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponseDto> handleConstraintViolationException(
            ConstraintViolationException ex, WebRequest request) {
        
        ErrorResponseDto errorResponse = new ErrorResponseDto(
            HttpStatus.BAD_REQUEST.value(),
            "Bad Request",
            "Constraint violation: " + ex.getMessage(),
            request.getDescription(false).replace("uri=", "")
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }
    
    /**
     * Handle generic exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGenericException(
            Exception ex, WebRequest request) {
        
        ErrorResponseDto errorResponse = new ErrorResponseDto(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Internal Server Error",
            "An unexpected error occurred: " + ex.getMessage(),
            request.getDescription(false).replace("uri=", "")
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
