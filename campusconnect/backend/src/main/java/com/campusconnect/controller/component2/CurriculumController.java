package com.campusconnect.controller.component2;

import com.campusconnect.dto.component2.CurriculumDtos;
import com.campusconnect.service.component2.CurriculumService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/curriculums")
@RequiredArgsConstructor
public class CurriculumController {
    private final CurriculumService curriculumService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create")
    public CurriculumDtos.Response create(@Valid @RequestBody CurriculumDtos.Request request) {
        return curriculumService.create(request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/update")
    public CurriculumDtos.Response update(@RequestParam Long curriculumId, @Valid @RequestBody CurriculumDtos.Request request) {
        return curriculumService.update(curriculumId, request);
    }

    @GetMapping("/get")
    public CurriculumDtos.Response getById(@RequestParam Long curriculumId) {
        return curriculumService.getById(curriculumId);
    }

    @GetMapping("/all")
    public List<CurriculumDtos.Response> getAll() {
        return curriculumService.getAll();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete")
    public void delete(@RequestParam Long curriculumId) {
        curriculumService.delete(curriculumId);
    }
}

