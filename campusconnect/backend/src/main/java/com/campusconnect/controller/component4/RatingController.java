package com.campusconnect.controller.component4;

import com.campusconnect.dto.component4.RatingDtos;
import com.campusconnect.service.component4.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    // ✅ Create or Update rating
    @PostMapping
    public RatingDtos.Response createOrUpdate(@Valid @RequestBody RatingDtos.Request request) {
        return ratingService.createOrUpdate(request);
    }

    // ✅ Get by ID
    @GetMapping("/{id}")
    public RatingDtos.Response getById(@PathVariable Long id) {
        return ratingService.getById(id);
    }

    // ✅ Get ratings for entity
    @GetMapping("/entity")
    public List<RatingDtos.Response> getByEntity(
            @RequestParam String entityType,
            @RequestParam Long entityId) {
        return ratingService.getByEntity(entityType, entityId);
    }

    // ✅ Get ratings by user
    @GetMapping("/user/{userId}")
    public List<RatingDtos.Response> getByUser(@PathVariable Long userId) {
        return ratingService.getByUser(userId);
    }

    // ✅ Get all
    @GetMapping
    public List<RatingDtos.Response> getAll() {
        return ratingService.getAll();
    }

    // ✅ Delete
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        ratingService.delete(id);
    }
}