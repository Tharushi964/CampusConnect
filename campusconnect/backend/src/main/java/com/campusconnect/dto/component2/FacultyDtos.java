package com.campusconnect.dto.component2;

import jakarta.validation.constraints.NotBlank;

public final class FacultyDtos {
    private FacultyDtos(){

    }
    
    public record Request(
        @NotBlank 
        String facultyName,

        @NotBlank 
        String status

    ){

    }

    public record Response(
        Long facultyId,
        String facultyName,
        String status
    ){

    }
}

