package com.campusconnect.dto.component1;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public final class FeedbackDtos {
    private FeedbackDtos() {
    }

    public record Request(
        //positive negative
            @NotBlank String feedbackType,
            @NotNull @Min(1) @Max(5) Integer rating,
            @NotBlank String message,
            @NotBlank String status,
            @NotNull Long userId,
            @NotNull Long sessionId

    ) {
    }

    public record Response(
            Long feedbackId,
            String feedbackType,
            Integer rating,
            String message,
            String status,
            LocalDateTime createdAt,
            Long userId,
            Long sessionId
    ) {
    }
}

