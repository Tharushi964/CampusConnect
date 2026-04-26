package com.campusconnect.controller.component2;

import com.campusconnect.dto.component2.SemesterDtos;
import com.campusconnect.service.component2.SemesterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/semesters")
@RequiredArgsConstructor
public class SemesterController {
    private final SemesterService semesterService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create")
    public SemesterDtos.Response create(@Valid @RequestBody SemesterDtos.Request request) {
        return semesterService.create(request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/update")
    public SemesterDtos.Response update(@RequestParam Long semesterId, @Valid @RequestBody SemesterDtos.Request request) {
        return semesterService.update(semesterId, request);
    }

    @GetMapping("/get")
    public SemesterDtos.Response getById(@RequestParam Long semesterId) {
        return semesterService.getById(semesterId);
    }

    @GetMapping("/all")
    public List<SemesterDtos.Response> getAll() {
        return semesterService.getAll();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete")
    public void delete(@RequestParam Long semesterId) {
        semesterService.delete(semesterId);
    }
}

