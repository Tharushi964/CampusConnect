package com.campusconnect.dto.component2;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public final class ResourceDtos {

    private ResourceDtos() {}

    public record Request(
            @NotBlank String name,
            @NotNull Long subjectId,
            @NotNull Long createdByUserId,
            List<String> fileUrls // simple approach for now
    ) {}

    public record UpdateRequest(
            @NotBlank String name,
            List<String> fileUrls,
            @NotNull Long updatedByUserId
    ) {}

    public record Response(
            Long resourceId,
            String name,
            Integer version,
            LocalDateTime createdDate,
            LocalDateTime updatedDate,
            Long subjectId,
            Long createdBy,
            Long updatedBy,
            List<String> fileUrls
    ) {}
}