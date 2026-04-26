package com.campusconnect.controller.component3;

import com.campusconnect.dto.component3.SessionDtos;
import com.campusconnect.service.component3.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    // ✅ Create session
    @PreAuthorize("hasAnyRole('ADMIN','BATCHREP')")
    @PostMapping("/create")
    public SessionDtos.Response create(@Valid @RequestBody SessionDtos.Request request) {
        return sessionService.create(request);
    }

    // ✅ Update session
    @PreAuthorize("hasAnyRole('ADMIN','BATCHREP')")
    @PutMapping("/update")
    public SessionDtos.Response update(@RequestParam Long id,
                                       @Valid @RequestBody SessionDtos.Request request) {
        return sessionService.update(id, request);
    }

    // ✅ Get all sessions
    @GetMapping("/all")
    public List<SessionDtos.Response> getAll() {
        return sessionService.getAll();
    }

    // ✅ Get session by ID
    @GetMapping("/getById")
    public SessionDtos.Response getById(@RequestParam Long id) {
        return sessionService.getById(id);
    }

    // ✅ Get sessions by group
    @GetMapping("/getByGroup")
    public List<SessionDtos.Response> getByGroup(@RequestParam Long groupId) {
        return sessionService.getByGroup(groupId);
    }

    @GetMapping("/getByOrganizer")
    public List<SessionDtos.Response> getByOrganizer(@RequestParam Long userId) {
        return sessionService.getByOrganizer(userId);
    }

    @GetMapping("/pastByGroup")
    public List<SessionDtos.Response> getPastByGroup(@RequestParam Long groupId) {
        return sessionService.getPastByGroup(groupId);
    }

    // ✅ Delete session
    @PreAuthorize("hasAnyRole('ADMIN','BATCHREP')")
    @DeleteMapping("/delete")
    public void delete(@RequestParam Long id) {
        sessionService.delete(id);
    }
}