package com.campusconnect.service.component2;

import com.campusconnect.dto.component2.CurriculumDtos;

import java.util.List;

public interface CurriculumService {
    CurriculumDtos.Response create(CurriculumDtos.Request request);

    CurriculumDtos.Response update(Long curriculumId, CurriculumDtos.Request request);

    CurriculumDtos.Response getById(Long curriculumId);

    List<CurriculumDtos.Response> getAll();

    void delete(Long curriculumId);
}

