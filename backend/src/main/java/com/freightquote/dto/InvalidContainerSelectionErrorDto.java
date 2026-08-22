package com.freightquote.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

public record InvalidContainerSelectionErrorDto(
        int status,
        String code,
        String message,
        List<?> containerIds,
        String path,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime timestamp) {
}