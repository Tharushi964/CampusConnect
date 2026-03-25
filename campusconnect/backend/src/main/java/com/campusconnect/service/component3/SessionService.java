package com.campusconnect.service.component3;

import com.campusconnect.dto.component3.SessionDtos;

import java.util.List;

public interface SessionService {
    SessionDtos.Response create(SessionDtos.Request request);

    SessionDtos.Response update(Long sessionId, SessionDtos.Request request);

    SessionDtos.Response getById(Long sessionId);

    List<SessionDtos.Response> getByGroup(Long groupId);

    List<SessionDtos.Response> getAll();

    void delete(Long sessionId);
}

