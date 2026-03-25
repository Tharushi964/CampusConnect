package com.campusconnect.controller.component1;

import com.campusconnect.dto.component1.RoleDtos;
import com.campusconnect.service.component1.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {
    private final RoleService roleService;

    @PostMapping
    public RoleDtos.Response create(@Valid @RequestBody RoleDtos.Request request) {
        return roleService.create(request);
    }

    @PutMapping("/{roleId}")
    public RoleDtos.Response update(@PathVariable Long roleId, @Valid @RequestBody RoleDtos.Request request) {
        return roleService.update(roleId, request);
    }

    @GetMapping("/{roleId}")
    public RoleDtos.Response getById(@PathVariable Long roleId) {
        return roleService.getById(roleId);
    }

    @GetMapping
    public List<RoleDtos.Response> getAll() {
        return roleService.getAll();
    }

    @DeleteMapping("/{roleId}")
    public void delete(@PathVariable Long roleId) {
        roleService.delete(roleId);
    }
}

