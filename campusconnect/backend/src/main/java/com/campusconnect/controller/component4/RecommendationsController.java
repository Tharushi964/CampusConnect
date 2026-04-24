package com.campusconnect.controller.component4;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationsController {

    @GetMapping("/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getRecommendations(@PathVariable Long userId) {
        List<Map<String, Object>> recommendations = new ArrayList<>();
        
        Map<String, Object> rec1 = new HashMap<>();
        rec1.put("programName", "Advanced Web Development");
        rec1.put("faculty", "Faculty of Computing");
        rec1.put("description", "Learn modern web technologies including React, Node.js, and Cloud Computing");
        rec1.put("matchScore", 95);
        rec1.put("enrolledStudents", 45);
        recommendations.add(rec1);
        
        Map<String, Object> rec2 = new HashMap<>();
        rec2.put("programName", "Data Science & Analytics");
        rec2.put("faculty", "Faculty of Computing");
        rec2.put("description", "Master data analysis, machine learning, and visualization techniques");
        rec2.put("matchScore", 88);
        rec2.put("enrolledStudents", 52);
        recommendations.add(rec2);
        
        Map<String, Object> rec3 = new HashMap<>();
        rec3.put("programName", "Mobile App Development");
        rec3.put("faculty", "Faculty of Engineering");
        rec3.put("description", "Build iOS and Android apps using React Native and Flutter");
        rec3.put("matchScore", 82);
        rec3.put("enrolledStudents", 38);
        recommendations.add(rec3);
        
        return ResponseEntity.ok(recommendations);
    }
}