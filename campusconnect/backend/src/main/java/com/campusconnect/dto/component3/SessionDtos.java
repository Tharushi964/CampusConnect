package com.campusconnect.dto.component3;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public final class SessionDtos {
    private SessionDtos() {
    }

    public record Request(
            @NotNull LocalDate sessionDate,
            @NotBlank String sessionName,
            @NotNull LocalTime startTime,
            @NotNull LocalTime endTime,
            @NotBlank String mode,
             String location,
             String link,
            @NotBlank String status,
            @NotNull Long groupId,
            @NotNull Long createdByUserId
    ) {
    }

    public record Response(
            Long sessionId,
            LocalDate sessionDate,
            String sessionName,
            LocalTime startTime,
            LocalTime endTime,
            String mode,
            String location,
            String link,
            String status,
            Long groupId,
            Long createdByUserId
    ) {
    }
}

