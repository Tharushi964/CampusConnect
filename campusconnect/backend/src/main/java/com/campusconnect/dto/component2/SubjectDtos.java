package com.campusconnect.dto.component2;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public final class SubjectDtos {
    private SubjectDtos() {
    }

    public record Request(
            @NotBlank String subjectCode,
            @NotBlank String subjectName,
            @Min(0) Integer credits,
             Long curriculumId,
             Long semesterId
    ) {
    }

    public record Response(
            Long subjectId,
            String subjectCode,
            String subjectName,
            Integer credits,
            Long curriculumId,
            Long semesterId
    ) {
    }
}

