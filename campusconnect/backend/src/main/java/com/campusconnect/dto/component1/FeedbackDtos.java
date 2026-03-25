package com.campusconnect.dto.component1;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public final class FeedbackDtos {
    private FeedbackDtos() {
    }

    public record Request(
        //positive negative
            @NotBlank String feedbackType,
            @NotBlank String message,
            @NotBlank String status,
            @NotNull Long userId,
            @NotNull Long sessionId

    ) {
    }

    public record Response(
            Long feedbackId,
            String feedbackType,
            String message,
            String status,
            LocalDateTime createdAt,
            Long userId,
            Long sessionId
    ) {
    }
}

