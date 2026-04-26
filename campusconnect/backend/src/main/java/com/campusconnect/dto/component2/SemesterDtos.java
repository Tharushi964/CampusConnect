package com.campusconnect.dto.component2;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public final class SemesterDtos {
    private SemesterDtos() {
    }

    public record Request(
            @NotNull @Min(1) Integer yearNumber,
            @NotNull @Min(1) Integer semesterNumber,
            @NotNull LocalDate startDate,
            @NotNull LocalDate endDate,
            @NotBlank String status,
            @NotNull Long batchId
    ) {
    }

    public record Response(
            Long semesterId,
            Integer yearNumber,
            Integer semesterNumber,
            LocalDate startDate,
            LocalDate endDate,
            String status,
            Long batchId
    ) {
    }
}

