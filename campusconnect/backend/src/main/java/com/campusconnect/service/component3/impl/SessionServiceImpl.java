package com.campusconnect.service.component3.impl;

import com.campusconnect.dto.component3.SessionDtos;
import com.campusconnect.entity.component1.User;
import com.campusconnect.entity.component3.Session;
import com.campusconnect.entity.component3.StudyGroup;
import com.campusconnect.repository.component1.UserRepository;
import com.campusconnect.repository.component3.SessionRepository;
import com.campusconnect.repository.component3.StudyGroupRepository;
import com.campusconnect.service.component3.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class SessionServiceImpl implements SessionService {

    private final SessionRepository sessionRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final UserRepository userRepository;

    @Override
    public SessionDtos.Response create(SessionDtos.Request request) {
        User actor = getAuthenticatedUser();

        StudyGroup group = studyGroupRepository.findById(request.groupId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        User user = userRepository.findById(request.createdByUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        validateBatchRepCanManageGroup(actor, group);
        validateActorMatchesCreatedBy(actor, user);
        validateSessionRequest(request);

        Session session = new Session();
        session.setSessionName(request.sessionName());
        session.setSessionDate(request.sessionDate());
        session.setStartTime(request.startTime());
        session.setEndTime(request.endTime());
        String normalizedMode = request.mode().trim().toUpperCase(Locale.ROOT);
        String normalizedStatus = request.status().trim().toUpperCase(Locale.ROOT);
        session.setMode(normalizedMode);
        session.setLocation("PHYSICAL".equals(normalizedMode) ? request.location() : null);
        session.setLink("ONLINE".equals(normalizedMode) ? request.link() : null);
        session.setDriveLink(request.driveLink());
        session.setStatus(normalizedStatus);
        session.setReminderSentAt(null);
        session.setStudyGroup(group);
        session.setCreatedBy(user);

        return toResponse(sessionRepository.save(session));
    }

    @Override
    public SessionDtos.Response update(Long sessionId, SessionDtos.Request request) {
        User actor = getAuthenticatedUser();

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        validateBatchRepCanManageSession(actor, session);

        StudyGroup group = studyGroupRepository.findById(request.groupId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        User createdBy = userRepository.findById(request.createdByUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        validateBatchRepCanManageGroup(actor, group);
        validateActorMatchesCreatedBy(actor, createdBy);
        validateSessionRequest(request);

        session.setSessionName(request.sessionName());
        session.setSessionDate(request.sessionDate());
        session.setStartTime(request.startTime());
        session.setEndTime(request.endTime());
        String normalizedMode = request.mode().trim().toUpperCase(Locale.ROOT);
        String normalizedStatus = request.status().trim().toUpperCase(Locale.ROOT);
        session.setMode(normalizedMode);
        session.setLocation("PHYSICAL".equals(normalizedMode) ? request.location() : null);
        session.setLink("ONLINE".equals(normalizedMode) ? request.link() : null);
        session.setDriveLink(request.driveLink());
        session.setStatus(normalizedStatus);
        session.setReminderSentAt(null);
        session.setStudyGroup(group);
        session.setCreatedBy(createdBy);

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
        return sessionRepository.findByStudyGroup_GroupId(groupId).stream().map(this::toResponse).toList();
    }

    @Override
    public List<SessionDtos.Response> getByOrganizer(Long userId) {
        return sessionRepository.findByCreatedBy_UserId(userId).stream().map(this::toResponse).toList();
    }

    @Override
    public List<SessionDtos.Response> getPastByGroup(Long groupId) {
        return sessionRepository.findByStudyGroup_GroupIdAndSessionDateBefore(groupId, LocalDate.now()).stream()
                .filter(s -> StringUtils.hasText(s.getDriveLink()))
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void delete(Long id) {
        User actor = getAuthenticatedUser();

        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        validateBatchRepCanManageSession(actor, session);

        sessionRepository.deleteById(id);
    }

    private void validateSessionRequest(SessionDtos.Request request) {
        String normalizedStatus = request.status().trim().toUpperCase(Locale.ROOT);

        if (!"SCHEDULED".equals(normalizedStatus) && !"COMPLETED".equals(normalizedStatus) && !"CANCELLED".equals(normalizedStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Session status must be SCHEDULED, COMPLETED, or CANCELLED");
        }

        if (request.sessionDate().isBefore(LocalDate.now()) && !"COMPLETED".equals(normalizedStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Session date cannot be in the past unless status is COMPLETED"
            );
        }

        if (!request.startTime().isBefore(request.endTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Session start time must be before end time");
        }

        String normalizedMode = request.mode().trim().toUpperCase(Locale.ROOT);
        if (!"ONLINE".equals(normalizedMode) && !"PHYSICAL".equals(normalizedMode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Session mode must be ONLINE or PHYSICAL");
        }

        if ("ONLINE".equals(normalizedMode) && !StringUtils.hasText(request.link())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Online session requires meeting link");
        }

        if ("PHYSICAL".equals(normalizedMode) && !StringUtils.hasText(request.location())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Physical session requires location");
        }
    }

    private void validateActorMatchesCreatedBy(User actor, User createdBy) {
        if (isBatchRep(actor) && !actor.getUserId().equals(createdBy.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Batch Rep can only organize own sessions");
        }
    }

    private void validateBatchRepCanManageGroup(User actor, StudyGroup group) {
        if (isBatchRep(actor)) {
            Long ownerId = group.getCreatedBy() == null ? null : group.getCreatedBy().getUserId();
            if (ownerId == null || !ownerId.equals(actor.getUserId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Batch Rep can only manage sessions for own study groups");
            }
        }
    }

    private void validateBatchRepCanManageSession(User actor, Session session) {
        if (isBatchRep(actor)) {
            Long ownerId = session.getCreatedBy() == null ? null : session.getCreatedBy().getUserId();
            if (ownerId == null || !ownerId.equals(actor.getUserId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Batch Rep can only manage own sessions");
            }
        }
    }

    private boolean isBatchRep(User user) {
        return user.getRole() != null && "BATCHREP".equalsIgnoreCase(user.getRole().getRoleName());
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !StringUtils.hasText(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated request");
        }

        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found"));
    }

    private SessionDtos.Response toResponse(Session s) {
        return new SessionDtos.Response(
                s.getSessionId(),
                s.getSessionDate(),
                s.getSessionName(),
                s.getStartTime(),
                s.getEndTime(),
                s.getMode(),
                s.getLocation(),
                s.getLink(),
                s.getDriveLink(),
                s.getStatus(),
                s.getStudyGroup() == null ? null : s.getStudyGroup().getGroupId(),
                s.getCreatedBy() == null ? null : s.getCreatedBy().getUserId()
        );
    }
}