package com.campusconnect.controller.component2;

import com.campusconnect.dto.component2.ResourceDtos;
import com.campusconnect.service.component2.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @PostMapping("/create")
    public ResourceDtos.Response create(@Valid @RequestBody ResourceDtos.Request request) {
        return resourceService.create(request);
    }

    @PutMapping("/update")
    public ResourceDtos.Response update(
           @RequestParam Long id,
            @Valid @RequestBody ResourceDtos.UpdateRequest request) {
        return resourceService.update(id, request);
    }

    @GetMapping("/get")
    public ResourceDtos.Response getById(@RequestParam Long id) {
        return resourceService.getById(id);
    }

    @GetMapping("/all")
    public List<ResourceDtos.Response> getAll() {
        return resourceService.getAll();
    }

    @GetMapping("/getBySubject")
    public List<ResourceDtos.Response> getBySubject(@RequestParam Long subjectId) {
        return resourceService.getBySubject(subjectId);
    }

    @DeleteMapping("/delete")
    public void delete(@RequestParam Long id) {
        resourceService.delete(id);
    }
}
