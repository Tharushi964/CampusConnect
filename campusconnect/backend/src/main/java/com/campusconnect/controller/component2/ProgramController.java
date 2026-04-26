package com.campusconnect.controller.component2;

import com.campusconnect.dto.component2.ProgramDtos;
import com.campusconnect.service.component2.ProgramService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/programs")
@RequiredArgsConstructor
public class ProgramController {

    private final ProgramService programService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create")
    public ProgramDtos.Response create(@Valid @RequestBody ProgramDtos.Request request) {
        return programService.create(request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/update")
    public ProgramDtos.Response update(
            @RequestParam Long programId,
            @Valid @RequestBody ProgramDtos.Request request) {
        return programService.update(programId, request);
    }

    // changed here
    @GetMapping("/get")
    public ProgramDtos.Response getById(@RequestParam Long programId) {
        return programService.getById(programId);
    }

    @GetMapping("/all")
    public List<ProgramDtos.Response> getAll() {
        return programService.getAll();
    }

    // changed here
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete")
    public void delete(@RequestParam Long programId) {
        programService.delete(programId);
    }
}

