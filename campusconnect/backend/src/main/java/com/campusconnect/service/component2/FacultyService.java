package com.campusconnect.service.component2;

import com.campusconnect.dto.component2.FacultyDtos;

import java.util.List;

public interface FacultyService {

    FacultyDtos.Response create(FacultyDtos.Request request);

    FacultyDtos.Response update(Long id, FacultyDtos.Request request);

    FacultyDtos.Response getById(Long id);

    List<FacultyDtos.Response> getAll();

    void delete(Long id);
}