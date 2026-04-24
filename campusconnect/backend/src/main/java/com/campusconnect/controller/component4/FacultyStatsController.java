package com.campusconnect.controller.component4;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import com.campusconnect.service.component2.FacultyService;  // If exists
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/faculties")
@RequiredArgsConstructor
public class FacultyStatsController {

    private final FacultyService facultyService;  // Inject if available

    @GetMapping("/stats")
    public ResponseEntity<List<Map<String, Object>>> getFacultyStats() {
        List<Map<String, Object>> facultyStats = new ArrayList<>();
        
        // Option A: Get from database if FacultyService exists
        // List<Faculty> faculties = facultyService.getAllFaculties();
        // for (Faculty f : faculties) {
        //     Map<String, Object> stat = new HashMap<>();
        //     stat.put("name", f.getFacultyName());
        //     stat.put("studentCount", f.getStudents().size());
        //     facultyStats.add(stat);
        // }

        // Option B: Return mock data for now
        Map<String, Object> faculty1 = new HashMap<>();
        faculty1.put("name", "Faculty of Computing");
        faculty1.put("programCount", 5);
        faculty1.put("studentCount", 320);
        facultyStats.add(faculty1);
        
        Map<String, Object> faculty2 = new HashMap<>();
        faculty2.put("name", "Faculty of Engineering");
        faculty2.put("programCount", 4);
        faculty2.put("studentCount", 280);
        facultyStats.add(faculty2);
        
        Map<String, Object> faculty3 = new HashMap<>();
        faculty3.put("name", "Faculty of Business");
        faculty3.put("programCount", 3);
        faculty3.put("studentCount", 190);
        facultyStats.add(faculty3);
        
        return ResponseEntity.ok(facultyStats);
    }
}