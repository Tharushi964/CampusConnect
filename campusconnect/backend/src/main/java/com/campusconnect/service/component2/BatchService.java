package com.campusconnect.service.component2;

import com.campusconnect.dto.component2.BatchDtos;

import java.util.List;

public interface BatchService {
    BatchDtos.Response create(BatchDtos.Request request);

    BatchDtos.Response update(Long batchId, BatchDtos.Request request);

    BatchDtos.Response getById(Long batchId);

    List<BatchDtos.Response> getAll();

    void delete(Long batchId);
}

