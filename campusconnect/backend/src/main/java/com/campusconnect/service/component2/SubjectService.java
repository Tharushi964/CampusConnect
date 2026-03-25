package com.campusconnect.service.component2;

import com.campusconnect.dto.component2.SubjectDtos;

import java.util.List;

public interface SubjectService {
    SubjectDtos.Response create(SubjectDtos.Request request);

    SubjectDtos.Response update(Long subjectId, SubjectDtos.Request request);

    SubjectDtos.Response getById(Long subjectId);

    List<SubjectDtos.Response> getAll();

    List<SubjectDtos.Response> getBySemester(Long semesterId);

    void delete(Long subjectId);
}

