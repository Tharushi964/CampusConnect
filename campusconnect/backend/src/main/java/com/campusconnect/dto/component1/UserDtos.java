package com.campusconnect.dto.component1;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public final class UserDtos {
    private UserDtos() {
    }

    public record Request(
            @NotBlank 
            String firstName,
            @NotBlank 
            String lastName,

            String studentId,

            @NotBlank 
            @Email String email,

            String username,

            String password,

            String status,

            Long roleId,

            Long batchId,
            Long campusId
            
            
    ) {
    }

    public record Response(
            Long userId,
            String firstName,
            String lastName,
            String studentId,
            String email,
            String username,
            String status,
            LocalDateTime createdAt,
            Long roleId,
            Long batchId,
            Long campusId
    ) {
    }
}

