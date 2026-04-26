package com.campusconnect.service.component3.impl;

import com.campusconnect.dto.component3.StudyGroupDtos;
import com.campusconnect.entity.component1.User;
import com.campusconnect.entity.component2.Semester;
import com.campusconnect.entity.component2.Subject;
import com.campusconnect.entity.component3.StudyGroup;
import com.campusconnect.repository.component1.UserRepository;
import com.campusconnect.repository.component2.SemesterRepository;
import com.campusconnect.repository.component2.SubjectRepository;
import com.campusconnect.repository.component3.StudyGroupRepository;
import com.campusconnect.service.component3.StudyGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudyGroupServiceImpl implements StudyGroupService {
    private final StudyGroupRepository studyGroupRepository;
    private final SubjectRepository subjectRepository;
    private final SemesterRepository semesterRepository;
    private final UserRepository userRepository;

    @Override
    public StudyGroupDtos.Response create(StudyGroupDtos.Request request) {
                User actor = getAuthenticatedUser();

        Subject subject = subjectRepository.findById(request.subjectId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found: " + request.subjectId()));

        Semester semester = semesterRepository.findById(request.semesterId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Semester not found: " + request.semesterId()));

        User createdBy = userRepository.findById(request.createdByUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + request.createdByUserId()));

        validateGroupRequest(actor, createdBy, semester, subject);

        StudyGroup group = new StudyGroup();
        group.setGroupName(request.groupName());
        group.setStatus(request.status());
        group.setCreatedAt(LocalDateTime.now());
        group.setSubject(subject);
        group.setSemester(semester);
        group.setCreatedBy(createdBy);
        return toResponse(studyGroupRepository.save(group));
    }

    @Override
    public StudyGroupDtos.Response update(Long groupId, StudyGroupDtos.Request request) {
                User actor = getAuthenticatedUser();

        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "StudyGroup not found: " + groupId));

        Subject subject = subjectRepository.findById(request.subjectId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found: " + request.subjectId()));

        Semester semester = semesterRepository.findById(request.semesterId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Semester not found: " + request.semesterId()));

        User createdBy = userRepository.findById(request.createdByUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + request.createdByUserId()));

        validateBatchRepCanManageGroup(actor, group);
        validateGroupRequest(actor, createdBy, semester, subject);

        group.setGroupName(request.groupName());
        group.setStatus(request.status());
        group.setSubject(subject);
        group.setSemester(semester);
        group.setCreatedBy(createdBy);
        return toResponse(studyGroupRepository.save(group));
    }

    @Override
    public StudyGroupDtos.Response getById(Long groupId) {
        return studyGroupRepository.findById(groupId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "StudyGroup not found: " + groupId));
    }

        @Override
        public List<StudyGroupDtos.Response> getBySemester(Long semesterId) {
                return studyGroupRepository.findBySemester_SemesterId(semesterId).stream().map(this::toResponse).toList();
        }

        @Override
        public List<StudyGroupDtos.Response> getByOrganizer(Long userId) {
                return studyGroupRepository.findByCreatedBy_UserId(userId).stream().map(this::toResponse).toList();
        }

    @Override
    public List<StudyGroupDtos.Response> getAll() {
        return studyGroupRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public void delete(Long groupId) {
                User actor = getAuthenticatedUser();

                StudyGroup group = studyGroupRepository.findById(groupId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "StudyGroup not found: " + groupId));

                validateBatchRepCanManageGroup(actor, group);

        studyGroupRepository.deleteById(groupId);
    }

        private void validateGroupRequest(User actor, User createdBy, Semester semester, Subject subject) {
                if (subject.getSemester() != null && !subject.getSemester().getSemesterId().equals(semester.getSemesterId())) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Subject does not belong to selected semester");
                }

                if (!StringUtils.hasText(actor.getRole() == null ? null : actor.getRole().getRoleName())) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Authenticated user does not have a role");
                }

                if (isBatchRep(actor)) {
                        if (!actor.getUserId().equals(createdBy.getUserId())) {
                                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Batch Rep can only create or update own study groups");
                        }

                        if (actor.getBatch() == null || semester.getBatch() == null ||
                                        !actor.getBatch().getBatchId().equals(semester.getBatch().getBatchId())) {
                                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Batch Rep can only manage study groups for own batch");
                        }
                }
        }

        private void validateBatchRepCanManageGroup(User actor, StudyGroup group) {
                if (isBatchRep(actor)) {
                        Long ownerId = group.getCreatedBy() == null ? null : group.getCreatedBy().getUserId();
                        if (ownerId == null || !ownerId.equals(actor.getUserId())) {
                                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Batch Rep can only manage own study groups");
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

    private StudyGroupDtos.Response toResponse(StudyGroup group) {
        return new StudyGroupDtos.Response(
                group.getGroupId(),
                group.getGroupName(),
                group.getStatus(),
                group.getCreatedAt(),
                group.getSubject() == null ? null : group.getSubject().getSubjectId(),
                group.getSemester() == null ? null : group.getSemester().getSemesterId(),
                group.getCreatedBy() == null ? null : group.getCreatedBy().getUserId()
        );
    }
}

