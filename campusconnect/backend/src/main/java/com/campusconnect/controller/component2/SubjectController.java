package com.campusconnect.controller.component2;

import com.campusconnect.dto.component2.SubjectDtos;
import com.campusconnect.service.component2.SubjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {
    private final SubjectService subjectService;

    @PreAuthorize("hasAnyRole('ADMIN', 'BATCH_REP')")
    @PostMapping("/create")
    public SubjectDtos.Response create(@Valid @RequestBody SubjectDtos.Request request) {
        return subjectService.create(request);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'BATCH_REP')")
    @PutMapping("/update")
    public SubjectDtos.Response update(@RequestParam Long subjectId, @Valid @RequestBody SubjectDtos.Request request) {
        return subjectService.update(subjectId, request);
    }

    @GetMapping("/get")
    public SubjectDtos.Response getById(@RequestParam Long subjectId) {
        return subjectService.getById(subjectId);
    }

    @GetMapping("/all")
    public List<SubjectDtos.Response> getAll() {
        return subjectService.getAll();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'BATCH_REP')")
    @DeleteMapping("/delete")
    public void delete(@RequestParam Long subjectId) {
        subjectService.delete(subjectId);
    }
}

