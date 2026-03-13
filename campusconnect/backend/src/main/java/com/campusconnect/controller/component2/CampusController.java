package com.campusconnect.controller.component2;

import com.campusconnect.dto.component2.CampusDtos;
import com.campusconnect.service.component2.CampusService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/campus")
@RequiredArgsConstructor
public class CampusController {

    private final CampusService campusService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public CampusDtos.Response create(@Valid @RequestBody CampusDtos.Request request) {
        return campusService.create(request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping
    public CampusDtos.Response update(@RequestParam Long campusId,
     @Valid @RequestBody CampusDtos.Request request) {
        return campusService.update(campusId, request);
    }

    @GetMapping
    public CampusDtos.Response getById(@RequestParam Long campusId) {
        return campusService.getById(campusId);
    }

    @GetMapping("/all")
    public List<CampusDtos.Response> getAll() {
        return campusService.getAll();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping
    public void delete(@RequestParam Long campusId) {
        campusService.delete(campusId);
    }
}