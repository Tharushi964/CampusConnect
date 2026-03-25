package com.campusconnect.service.component3.impl;

import com.campusconnect.dto.component3.SessionAttendanceDtos;
import com.campusconnect.entity.component1.User;
import com.campusconnect.entity.component3.*;
import com.campusconnect.repository.component1.UserRepository;
import com.campusconnect.repository.component3.SessionAttendanceRepository;
import com.campusconnect.repository.component3.SessionRepository;
import com.campusconnect.service.component3.SessionAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionAttendanceServiceImpl implements SessionAttendanceService {

    private final SessionAttendanceRepository repository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;

    // ✅ MARK ATTENDANCE
    @Override
    public SessionAttendanceDtos.Response mark(SessionAttendanceDtos.Request request) {

        Session session = sessionRepository.findById(request.sessionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        SessionAttendanceId id = new SessionAttendanceId(session.getSessionId(), user.getUserId());

        if (repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Attendance already marked");
        }

        SessionAttendance attendance = new SessionAttendance();
        attendance.setId(id);
        attendance.setSession(session);
        attendance.setUser(user);
        attendance.setAttendanceStatus(request.attendanceStatus());

        return toResponse(repository.save(attendance));
    }

    // ✅ REMOVE ATTENDANCE
    @Override
    public void remove(Long sessionId, Long userId) {

        SessionAttendanceId id = new SessionAttendanceId(sessionId, userId);

        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Attendance not found");
        }

        repository.deleteById(id);
    }

    // ✅ GET BY SESSION
    @Override
    public List<SessionAttendanceDtos.Response> getBySession(Long sessionId) {

        return repository.findBySession_SessionId(sessionId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ✅ GET BY USER
    @Override
    public List<SessionAttendanceDtos.Response> getByUser(Long userId) {

        return repository.findByUser_UserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // 🔄 Mapper
    private SessionAttendanceDtos.Response toResponse(SessionAttendance a) {
        return new SessionAttendanceDtos.Response(
                a.getSession().getSessionId(),
                a.getUser().getUserId(),
                a.getAttendanceStatus()
        );
    }
}