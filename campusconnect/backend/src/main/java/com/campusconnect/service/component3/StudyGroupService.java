package com.campusconnect.service.component3;

import com.campusconnect.dto.component3.StudyGroupDtos;

import java.util.List;

public interface StudyGroupService {
    StudyGroupDtos.Response create(StudyGroupDtos.Request request);

    StudyGroupDtos.Response update(Long groupId, StudyGroupDtos.Request request);

    StudyGroupDtos.Response getById(Long groupId);

    List<StudyGroupDtos.Response> getBySemester(Long semesterId);

    List<StudyGroupDtos.Response> getByOrganizer(Long userId);

    List<StudyGroupDtos.Response> getAll();

    void delete(Long groupId);
}

