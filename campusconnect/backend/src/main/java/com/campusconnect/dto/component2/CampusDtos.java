package com.campusconnect.dto.component2;

import jakarta.validation.constraints.NotBlank;

public final class CampusDtos {
    private CampusDtos() {
    }

    public record Request(
            @NotBlank String campusName,
            @NotBlank String location,
            @NotBlank String status
    ) {
    }

    public record Response(
            Long campusId,
            String campusName,
            String location,
            String status
    ) {
    }
}

