package com.campusconnect.controller.component4;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardData() {
        Map<String, Object> data = new HashMap<>();
        
        // Dashboard Summary
        data.put("totalStudents", 156);
        data.put("totalFaculties", 8);
        data.put("activePrograms", 12);
        data.put("totalBatches", 24);
        
        // Batch Statistics
        List<Map<String, Object>> batchStats = new ArrayList<>();
        batchStats.add(Map.of("batchName", "Batch A", "studentCount", 45, "representativeCount", 3, "percentage", 75));
        batchStats.add(Map.of("batchName", "Batch B", "studentCount", 38, "representativeCount", 2, "percentage", 63));
        batchStats.add(Map.of("batchName", "Batch C", "studentCount", 52, "representativeCount", 4, "percentage", 87));
        data.put("batchStats", batchStats);
        
        // Faculty Statistics
        List<Map<String, Object>> facultyStats = new ArrayList<>();
        facultyStats.add(Map.of("name", "Faculty of Computing", "studentCount", 320));
        facultyStats.add(Map.of("name", "Faculty of Engineering", "studentCount", 280));
        facultyStats.add(Map.of("name", "Faculty of Business", "studentCount", 190));
        data.put("facultyStats", facultyStats);
        
        // Program Statistics
        List<Map<String, Object>> programStats = new ArrayList<>();
        programStats.add(Map.of("programName", "Computer Science", "studentCount", 156, "isActive", true));
        programStats.add(Map.of("programName", "Software Engineering", "studentCount", 98, "isActive", true));
        data.put("programStats", programStats);
        
        return ResponseEntity.ok(data);
    }
}