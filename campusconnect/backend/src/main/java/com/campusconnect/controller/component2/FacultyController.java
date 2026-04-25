package com.campusconnect.controller.component2;

import com.campusconnect.dto.component2.FacultyDtos;
import com.campusconnect.service.component2.FacultyService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faculties")
@RequiredArgsConstructor
public class FacultyController {

    private final FacultyService facultyService;

    @PostMapping("/create")
    public FacultyDtos.Response create(@Valid @RequestBody FacultyDtos.Request request) {
        return facultyService.create(request);
    }

    @PutMapping("/update")
    public FacultyDtos.Response update(
            @RequestParam Long id,
            @Valid @RequestBody FacultyDtos.Request request
    ) {
        return facultyService.update(id, request);
    }

    @GetMapping("/get")
    public FacultyDtos.Response getById(@RequestParam Long id) {
        return facultyService.getById(id);
    }

    @GetMapping("/all")
    public List<FacultyDtos.Response> getAll() {
        return facultyService.getAll();
    }

    @DeleteMapping("/delete")
    public void delete(@RequestParam Long id) {
        facultyService.delete(id);
    }
}