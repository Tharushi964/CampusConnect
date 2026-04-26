package com.campusconnect.service.component2;

import com.campusconnect.dto.component2.CampusDtos;

import java.util.List;

public interface CampusService {
    CampusDtos.Response create(CampusDtos.Request request);

    CampusDtos.Response update(Long campusId, CampusDtos.Request request);

    CampusDtos.Response activate(Long campusId);

    CampusDtos.Response deactivate(Long campusId);

    CampusDtos.Response getById(Long campusId);

    List<CampusDtos.Response> getAll();

    void delete(Long campusId);
}

