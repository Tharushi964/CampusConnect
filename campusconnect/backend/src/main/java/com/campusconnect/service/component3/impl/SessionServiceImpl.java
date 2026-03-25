package com.campusconnect.service.component3.impl;

import com.campusconnect.dto.component3.SessionDtos;
import com.campusconnect.dto.component3.StudyGroupDtos;
import com.campusconnect.entity.component1.User;
import com.campusconnect.entity.component2.Semester;
import com.campusconnect.entity.component3.Session;
import com.campusconnect.entity.component3.StudyGroup;
import com.campusconnect.repository.component1.UserRepository;
import com.campusconnect.repository.component3.SessionRepository;
import com.campusconnect.repository.component3.StudyGroupRepository;
import com.campusconnect.service.component3.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionServiceImpl implements SessionService {

    private final SessionRepository sessionRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final UserRepository userRepository;

    @Override
    public SessionDtos.Response create(SessionDtos.Request request) {

        StudyGroup group = studyGroupRepository.findById(request.groupId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        User user = userRepository.findById(request.createdByUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Session session = new Session();
        session.setSessionName(request.sessionName());
        session.setSessionDate(request.sessionDate());
        session.setStartTime(request.startTime());
        session.setEndTime(request.endTime());
        session.setMode(request.mode());
        session.setLocation(request.location());
        session.setLink(request.link());
        session.setStatus(request.status());
        session.setStudyGroup(group);
        session.setCreatedBy(user);

        return toResponse(sessionRepository.save(session));
    }

    @Override
    public SessionDtos.Response update(Long sessionId, SessionDtos.Request request) {

        // ✅ Get existing session
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        // ✅ Get group
        StudyGroup group = studyGroupRepository.findById(request.groupId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        // ✅ Get user
        User createdBy = userRepository.findById(request.createdByUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // ✅ Update fields
        session.setSessionName(request.sessionName());
        session.setSessionDate(request.sessionDate());
        session.setStartTime(request.startTime());
        session.setEndTime(request.endTime());
        session.setMode(request.mode());
        session.setLocation(request.location());
        session.setLink(request.link());
        session.setStatus(request.status());
        session.setStudyGroup(group);
        session.setCreatedBy(createdBy);

        // ✅ Save session (NOT group)
        return toResponse(sessionRepository.save(session));
    }

    @Override
    public List<SessionDtos.Response> getAll() {
        return sessionRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public SessionDtos.Response getById(Long id) {
        return sessionRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));
    }

    @Override
    public List<SessionDtos.Response> getByGroup(Long groupId) {
        return sessionRepository.findAll().stream()
                .filter(s -> s.getStudyGroup().getGroupId().equals(groupId))
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!sessionRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found");
        }
        sessionRepository.deleteById(id);
    }

    private SessionDtos.Response toResponse(Session s) {
    return new SessionDtos.Response(
            s.getSessionId(),
            s.getSessionDate(),     // ✅ correct
            s.getSessionName(),     // ✅ correct
            s.getStartTime(),
            s.getEndTime(),
            s.getMode(),
            s.getLocation(),
            s.getLink(),
            s.getStatus(),
            s.getStudyGroup() == null ? null : s.getStudyGroup().getGroupId(),
            s.getCreatedBy() == null ? null : s.getCreatedBy().getUserId()
    );
}
}