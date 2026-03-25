package com.campusconnect.controller.component3;

import com.campusconnect.dto.component3.StudyGroupDtos;
import com.campusconnect.service.component3.StudyGroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class StudyGroupController {

    private final StudyGroupService studyGroupService;

    // ✅ Create group
    @PreAuthorize("hasAnyRole('ADMIN','BATCH_REP')")
    @PostMapping("/create")
    public StudyGroupDtos.Response create(@Valid @RequestBody StudyGroupDtos.Request request) {
        return studyGroupService.create(request);
    }

    // ✅ Update group
    @PreAuthorize("hasAnyRole('ADMIN','BATCH_REP')")
    @PutMapping("/update")
    public StudyGroupDtos.Response update(@RequestParam Long id,
                                          @Valid @RequestBody StudyGroupDtos.Request request) {
        return studyGroupService.update(id, request);
    }

    // ✅ Get all groups
    @GetMapping("/all")
    public List<StudyGroupDtos.Response> getAll() {
        return studyGroupService.getAll();
    }

    // ✅ Get group by ID
    @GetMapping("/getById")
    public StudyGroupDtos.Response getById(@RequestParam Long id) {
        return studyGroupService.getById(id);
    }

    // ✅ Delete group
    @PreAuthorize("hasAnyRole('ADMIN','BATCH_REP')")
    @DeleteMapping("/delete")
    public void delete(@RequestParam Long id) {
        studyGroupService.delete(id);
    }
}