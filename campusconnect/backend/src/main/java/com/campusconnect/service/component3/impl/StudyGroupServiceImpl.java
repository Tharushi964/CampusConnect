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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
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
        Subject subject = subjectRepository.findById(request.subjectId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found: " + request.subjectId()));

        Semester semester = semesterRepository.findById(request.semesterId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Semester not found: " + request.semesterId()));

        User createdBy = userRepository.findById(request.createdByUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + request.createdByUserId()));
        
        if (createdBy.getRole() != null &&
                "STUDENT".equalsIgnoreCase(createdBy.getRole().getRoleName())) {

                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Access Denied: Students cannot create study groups"
                );
        } 

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
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "StudyGroup not found: " + groupId));

        Subject subject = subjectRepository.findById(request.subjectId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found: " + request.subjectId()));

        Semester semester = semesterRepository.findById(request.semesterId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Semester not found: " + request.semesterId()));

        User createdBy = userRepository.findById(request.createdByUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + request.createdByUserId()));

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
    public List<StudyGroupDtos.Response> getAll() {
        return studyGroupRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
        public List<StudyGroupDtos.Response> getBySemesterId(Long semesterId) {

        
        if (!semesterRepository.existsById(semesterId)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Semester not found: " + semesterId);
        }

        return studyGroupRepository.findBySemester_SemesterId(semesterId)
                .stream()
                .map(this::toResponse)
                .toList();
        }

    @Override
    public void delete(Long groupId) {
        if (!studyGroupRepository.existsById(groupId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "StudyGroup not found: " + groupId);
        }
        studyGroupRepository.deleteById(groupId);
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

