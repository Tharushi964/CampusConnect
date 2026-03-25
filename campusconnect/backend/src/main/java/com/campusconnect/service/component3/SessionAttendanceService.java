package com.campusconnect.service.component3;

import com.campusconnect.dto.component3.SessionAttendanceDtos;

import java.util.List;

public interface SessionAttendanceService {

    SessionAttendanceDtos.Response mark(SessionAttendanceDtos.Request request);

    void remove(Long sessionId, Long userId);

    List<SessionAttendanceDtos.Response> getBySession(Long sessionId);

    List<SessionAttendanceDtos.Response> getByUser(Long userId);
}