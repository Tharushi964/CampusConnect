package com.campusconnect.dto.component2;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public final class CurriculumDtos {
    private CurriculumDtos() {
    }

    public record Request(
            @NotBlank 
            String curriculumName,

            @NotBlank 
            String version,

            @NotNull @Min(2023) 
            Integer createdYear,
            
            @NotBlank 
            String status,
            
            Long programId
    ) {
    }

    public record Response(
            Long curriculumId,
            String curriculumName,
            String version,
            Integer createdYear,
            String status,
            Long programId
    ) {
    }
}

