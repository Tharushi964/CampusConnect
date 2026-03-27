package com.campusconnect.service.component2;

import com.campusconnect.dto.component2.ResourceDtos;

import java.util.List;

public interface ResourceService {

    ResourceDtos.Response create(ResourceDtos.Request request);

    ResourceDtos.Response update(Long resourceId, ResourceDtos.UpdateRequest request);

    ResourceDtos.Response getById(Long resourceId);

    List<ResourceDtos.Response> getAll();

    List<ResourceDtos.Response> getBySubject(Long subjectId);

    void delete(Long resourceId);
}