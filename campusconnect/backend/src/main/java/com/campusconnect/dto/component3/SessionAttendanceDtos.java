package com.campusconnect.dto.component3;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public final class SessionAttendanceDtos {
    private SessionAttendanceDtos() {
    }

    public record Request(
            @NotNull Long sessionId,
            @NotNull Long userId,
            @NotBlank String attendanceStatus
    ) {


    }

    public record Response(
            Long sessionId,
            Long userId,
            String attendanceStatus
    ) {
    }
}

