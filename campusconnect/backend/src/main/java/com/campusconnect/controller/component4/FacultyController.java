package com.campusconnect.controller.component4;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController("component4FacultyController")
@RequestMapping("/api/component4/faculties")
public class FacultyController {

    // Existing method - Get faculty statistics
    @GetMapping("/stats")
    public ResponseEntity<List<Map<String, Object>>> getFacultyStats() {
        List<Map<String, Object>> facultyStats = new ArrayList<>();
        
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

    // ========== NEW METHODS FOR COMPONENT 4 ==========

    // Get all faculties (list)
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllFaculties() {
        List<Map<String, Object>> faculties = new ArrayList<>();
        
        Map<String, Object> faculty1 = new HashMap<>();
        faculty1.put("facultyId", 1);
        faculty1.put("name", "Faculty of Computing");
        faculty1.put("code", "FOC");
        faculties.add(faculty1);
        
        Map<String, Object> faculty2 = new HashMap<>();
        faculty2.put("facultyId", 2);
        faculty2.put("name", "Faculty of Engineering");
        faculty2.put("code", "FOE");
        faculties.add(faculty2);
        
        Map<String, Object> faculty3 = new HashMap<>();
        faculty3.put("facultyId", 3);
        faculty3.put("name", "Faculty of Business");
        faculty3.put("code", "FOB");
        faculties.add(faculty3);
        
        Map<String, Object> faculty4 = new HashMap<>();
        faculty4.put("facultyId", 4);
        faculty4.put("name", "Faculty of Science");
        faculty4.put("code", "FOS");
        faculties.add(faculty4);
        
        return ResponseEntity.ok(faculties);
    }

    // Get faculty by ID
    @GetMapping("/{facultyId}")
    public ResponseEntity<Map<String, Object>> getFacultyById(@PathVariable Long facultyId) {
        Map<String, Object> faculty = new HashMap<>();
        faculty.put("facultyId", facultyId);
        faculty.put("name", "Faculty of Computing");
        faculty.put("code", "FOC");
        faculty.put("programCount", 5);
        faculty.put("studentCount", 320);
        return ResponseEntity.ok(faculty);
    }

    // Get faculty programs
    @GetMapping("/{facultyId}/programs")
    public ResponseEntity<List<Map<String, Object>>> getFacultyPrograms(@PathVariable Long facultyId) {
        List<Map<String, Object>> programs = new ArrayList<>();
        
        Map<String, Object> program1 = new HashMap<>();
        program1.put("programId", 1);
        program1.put("programName", "Computer Science");
        program1.put("studentCount", 156);
        programs.add(program1);
        
        Map<String, Object> program2 = new HashMap<>();
        program2.put("programId", 2);
        program2.put("programName", "Software Engineering");
        program2.put("studentCount", 98);
        programs.add(program2);
        
        Map<String, Object> program3 = new HashMap<>();
        program3.put("programId", 3);
        program3.put("programName", "Data Science");
        program3.put("studentCount", 67);
        programs.add(program3);
        
        return ResponseEntity.ok(programs);
    }

    // Get faculty summary (for dashboard)
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getFacultySummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalFaculties", 4);
        summary.put("totalPrograms", 12);
        summary.put("totalStudents", 156 + 98 + 67 + 45);
        summary.put("activeFaculties", 4);
        return ResponseEntity.ok(summary);
    }
}