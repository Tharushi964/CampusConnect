package com.campusconnect.service.component2;

import com.campusconnect.dto.component2.ProgramDtos;

import java.util.List;

public interface ProgramService {
    ProgramDtos.Response create(ProgramDtos.Request request);

    ProgramDtos.Response update(Long programId, ProgramDtos.Request request);

    ProgramDtos.Response getById(Long programId);

    List<ProgramDtos.Response> getAll();

    void delete(Long programId);
}

