package com.campusconnect.controller.component3;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController("comp3BatchController")
@RequestMapping("/api/batches")
public class BatchController {

    // Get all batches
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllBatches() {
        List<Map<String, Object>> batches = new ArrayList<>();
        
        Map<String, Object> batch1 = new HashMap<>();
        batch1.put("batchId", 1);
        batch1.put("batchName", "Batch 2024A");
        batch1.put("programName", "Computer Science");
        batch1.put("studentCount", 52);
        batch1.put("status", "ACTIVE");
        batches.add(batch1);
        
        Map<String, Object> batch2 = new HashMap<>();
        batch2.put("batchId", 2);
        batch2.put("batchName", "Batch 2024B");
        batch2.put("programName", "Software Engineering");
        batch2.put("studentCount", 48);
        batch2.put("status", "ACTIVE");
        batches.add(batch2);
        
        Map<String, Object> batch3 = new HashMap<>();
        batch3.put("batchId", 3);
        batch3.put("batchName", "Batch 2024C");
        batch3.put("programName", "Data Science");
        batch3.put("studentCount", 35);
        batch3.put("status", "ACTIVE");
        batches.add(batch3);
        
        return ResponseEntity.ok(batches);
    }

    // Get popular batches (for Component 4)
    @GetMapping("/popular")
    public ResponseEntity<List<Map<String, Object>>> getPopularBatches() {
        List<Map<String, Object>> popular = new ArrayList<>();
        
        Map<String, Object> batch1 = new HashMap<>();
        batch1.put("batchName", "Batch 2024A");
        batch1.put("programName", "Computer Science");
        batch1.put("studentCount", 52);
        batch1.put("popularityScore", 4.8);
        popular.add(batch1);
        
        Map<String, Object> batch2 = new HashMap<>();
        batch2.put("batchName", "Batch 2024B");
        batch2.put("programName", "Software Engineering");
        batch2.put("studentCount", 48);
        batch2.put("popularityScore", 4.5);
        popular.add(batch2);
        
        Map<String, Object> batch3 = new HashMap<>();
        batch3.put("batchName", "Batch 2024C");
        batch3.put("programName", "Data Science");
        batch3.put("studentCount", 35);
        batch3.put("popularityScore", 4.2);
        popular.add(batch3);
        
        Map<String, Object> batch4 = new HashMap<>();
        batch4.put("batchName", "Batch 2023D");
        batch4.put("programName", "Cyber Security");
        batch4.put("studentCount", 42);
        batch4.put("popularityScore", 4.0);
        popular.add(batch4);
        
        return ResponseEntity.ok(popular);
    }

    // Get batch statistics (for Component 4)
    @GetMapping("/stats")
    public ResponseEntity<List<Map<String, Object>>> getBatchStats() {
        List<Map<String, Object>> stats = new ArrayList<>();
        
        Map<String, Object> batch1 = new HashMap<>();
        batch1.put("batchName", "Batch A");
        batch1.put("startDate", "2024-01-01");
        batch1.put("endDate", "");
        batch1.put("studentCount", 45);
        batch1.put("representativeCount", 3);
        batch1.put("percentage", 75);
        stats.add(batch1);
        
        Map<String, Object> batch2 = new HashMap<>();
        batch2.put("batchName", "Batch B");
        batch2.put("startDate", "2024-02-01");
        batch2.put("endDate", "");
        batch2.put("studentCount", 38);
        batch2.put("representativeCount", 2);
        batch2.put("percentage", 63);
        stats.add(batch2);
        
        Map<String, Object> batch3 = new HashMap<>();
        batch3.put("batchName", "Batch C");
        batch3.put("startDate", "2024-03-01");
        batch3.put("endDate", "");
        batch3.put("studentCount", 52);
        batch3.put("representativeCount", 4);
        batch3.put("percentage", 87);
        stats.add(batch3);
        
        Map<String, Object> batch4 = new HashMap<>();
        batch4.put("batchName", "Batch D");
        batch4.put("startDate", "2024-04-01");
        batch4.put("endDate", "");
        batch4.put("studentCount", 41);
        batch4.put("representativeCount", 2);
        batch4.put("percentage", 68);
        stats.add(batch4);
        
        return ResponseEntity.ok(stats);
    }

    // Get batch by ID
    @GetMapping("/{batchId}")
    public ResponseEntity<Map<String, Object>> getBatchById(@PathVariable Long batchId) {
        Map<String, Object> batch = new HashMap<>();
        batch.put("batchId", batchId);
        batch.put("batchName", "Batch 2024A");
        batch.put("programName", "Computer Science");
        batch.put("studentCount", 52);
        batch.put("status", "ACTIVE");
        return ResponseEntity.ok(batch);
    }
}