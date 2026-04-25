package com.campusconnect.controller.component2;

import com.campusconnect.dto.component2.BatchDtos;
import com.campusconnect.service.component2.BatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/batches")
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;

    @PostMapping("/create")
    public BatchDtos.Response create(@Valid @RequestBody BatchDtos.Request request) {
        return batchService.create(request);
    }

    @PutMapping("/update")
    public BatchDtos.Response update(
            @RequestParam Long batchId,
            @Valid @RequestBody BatchDtos.Request request) {
        return batchService.update(batchId, request);
    }

    @GetMapping("/get")
    public BatchDtos.Response getById(@RequestParam Long batchId) {
        return batchService.getById(batchId);
    }

    @GetMapping("/all")
    public List<BatchDtos.Response> getAll() {
        return batchService.getAll();
    }

    @DeleteMapping("/delete")
    public void delete(@RequestParam Long batchId) {
        batchService.delete(batchId);
    }
}

