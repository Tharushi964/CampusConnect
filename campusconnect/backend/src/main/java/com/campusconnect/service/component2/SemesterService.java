package com.campusconnect.service.component2;

import com.campusconnect.dto.component2.SemesterDtos;
import com.campusconnect.entity.component2.Batch;

import java.util.List;

public interface SemesterService {
    SemesterDtos.Response create(SemesterDtos.Request request);

    SemesterDtos.Response update(Long semesterId, SemesterDtos.Request request);

    SemesterDtos.Response getById(Long semesterId);

    List<SemesterDtos.Response> getAll();

    void delete(Long semesterId);

    void generateSemestersForBatch(Batch batch);
}

